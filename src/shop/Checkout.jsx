// Porudžbina: šta se naručuje, preuzimanje ili slanje, datum, podaci, avans
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Bouquet from './Bouquet'
import { din, orderDates, iso, deposit, lines, summary, pickupChoices, pickupMode, leadFor, totalCount } from './engine'
import { haptic } from '../lib/haptic'

const DAYS = { sr: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }

async function uploadDataUrl(path, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob()
  const { error } = await supabase.storage.from('order-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) return null
  return supabase.storage.from('order-photos').getPublicUrl(path).data.publicUrl
}

export default function Checkout({ shop, salon, client, lang, cart, setCart, onAddMore, onBack, onDone, onClient }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const o = shop.order || {}
  const methods = [o.pickup?.on && 'pickup', o.delivery?.on && 'delivery'].filter(Boolean)
  const [fulfil, setFulfil] = useState(methods[0] || 'pickup')
  // najveći buket u korpi određuje najraniji rok (npr. preko 50 cvetova → 10 dana)
  const biggest = Math.max(0, ...cart.filter(it => !it.keychain).map(it => totalCount(it.design)))
  const lead = leadFor(shop, biggest)
  const allDates = orderDates(shop, 28, new Date(), biggest)
  const mode = fulfil === 'pickup' ? pickupMode(shop) : 'none'
  const timeOn = mode !== 'none'
  // termini iz radnog vremena: samo dani kad radi
  const dates = (mode === 'hours' ? allDates.filter(d => pickupChoices(shop, salon.hours, d).length) : allDates).slice(0, 14)
  const [full, setFull] = useState(new Set())
  const [di, setDi] = useState(0)
  const [tm, setTm] = useState('')
  const slots = timeOn && dates[di] ? pickupChoices(shop, salon.hours, dates[di]) : []
  const parts = String(client.name || '').trim().split(/\s+/)
  const ship = client.ship || {}
  const [f, setF] = useState({ first: parts[0] || '', last: parts.slice(1).join(' '), phone: client.phone || '', email: client.email || '', address: ship.address || '', city: ship.city || '', zip: ship.zip || '' })
  useEffect(() => { setDi(0) }, [fulfil])
  useEffect(() => { if (tm && !slots.includes(tm)) setTm('') }, [di, fulfil])
  const [card, setCard] = useState('')
  const [agree, setAgree] = useState(!(o.rules || []).filter(Boolean).length)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [tried, setTried] = useState(false)

  // Pun dan (najviše porudžbina dnevno) se zatvara
  useEffect(() => {
    if (!(Number(o.maxPerDay) > 0) || !dates.length) return
    supabase.rpc('order_day_counts', { p_salon: salon.id, p_from: iso(dates[0]), p_to: iso(dates[dates.length - 1]) })
      .then(({ data }) => {
        if (!data) return
        const s = new Set(data.filter(r => r.n >= Number(o.maxPerDay)).map(r => r.day))
        setFull(s)
        const first = dates.findIndex(d => !s.has(iso(d)))
        if (first >= 0) setDi(first)
      })
  }, [])

  const total = cart.reduce((a, it) => a + it.price, 0)
  const dep = deposit(shop, total)
  const need = ['first', 'last', 'phone', 'email', ...(fulfil === 'delivery' ? ['address', 'city', 'zip'] : [])]
  const missing = need.filter(k => !String(f[k] || '').trim() || (k === 'email' && !/@/.test(f.email)))
  const ok = cart.length > 0 && !missing.length && agree && dates[di] && !full.has(iso(dates[di])) && (!timeOn || !slots.length || !!tm)
  const inp = (k, label, props = {}) => (
    <label className="field"><span>{label}</span>
      <input className={'fin' + (tried && missing.includes(k) ? ' bad' : '')} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} {...props} />
    </label>
  )

  async function send() {
    setTried(true)
    if (!ok) { haptic('warning'); setErr(timeOn && !tm && slots.length ? L('Izaberi vreme preuzimanja.', 'Choose a pickup time.') : L('Popuni sva polja i potvrdi pravila.', 'Fill in every field and accept the rules.')); return }
    setBusy(true); setErr('')
    try {
      const items = []
      for (const [k, it] of cart.entries()) {
        const design = { ...it.design }
        if (design.inspo && design.inspo.startsWith('data:')) design.inspo = await uploadDataUrl(`${salon.id}/${client.id}/${Date.now()}-${k}.jpg`, design.inspo)
        items.push({ title: it.title, productId: it.productId || null, keychain: !!it.keychain, price: it.price, photo: it.photo || null, design, lines: lines(shop, design, 'sr'), summary: summary(shop, design, 'sr') })
      }
      const contact = { first: f.first.trim(), last: f.last.trim(), phone: f.phone.trim(), email: f.email.trim(),
        ...(fulfil === 'delivery' ? { address: f.address.trim(), city: f.city.trim(), zip: f.zip.trim() } : {}) }
      const { data, error } = await supabase.from('orders').insert({
        salon_id: salon.id, client_id: client.id, status: dep > 0 ? 'awaiting_payment' : 'confirmed',
        fulfil, due_date: iso(dates[di]), ...(timeOn ? { due_time: tm } : {}), contact, items, total, deposit: dep, card_message: card.trim() || null,
      }).select('id, number, created_at').single()
      if (error) throw error
      haptic('success')
      // zapamti telefon i adresu za sledeći put (kupac ih samo proveri)
      const patch = { phone: contact.phone, ...(fulfil === 'delivery' ? { ship: { address: contact.address, city: contact.city, zip: contact.zip } } : {}) }
      supabase.from('clients').update(patch).eq('id', client.id).then(({ error: e2 }) => {
        if (!e2) onClient?.(patch)
        else if (patch.ship) supabase.from('clients').update({ phone: patch.phone }).eq('id', client.id).then(() => onClient?.({ phone: patch.phone }))
      })
      onDone({ ...data, total, deposit: dep, fulfil, due: dates[di], due_date: iso(dates[di]), due_time: timeOn ? tm : null })
    } catch (e) {
      haptic('warning'); setErr(e.message || String(e))
    }
    setBusy(false)
  }

  return (
    <div className="flow anim-in">
      <button className="ghost" style={{ marginBottom: 12, width: 'auto', padding: '9px 14px' }} onClick={onBack}>← {L('Nazad', 'Back')}</button>
      <div className="pagehead"><h2>{L('Porudžbina', 'Order')}</h2></div>

      <div className="card" style={{ padding: '4px 14px', marginBottom: 8 }}>
        {cart.map((it, k) => (
          <div key={k} className="cartitem">
            <span className="th">{it.photo ? <img src={it.photo} alt="" /> : <Bouquet shop={shop} design={it.design} size={56} keychain={it.keychain} />}</span>
            <span className="grow"><span className="name">{it.title}</span><br /><span className="tiny">{summary(shop, it.design, lang)}</span></span>
            <span style={{ textAlign: 'right' }}><b className="svc-price">{din(it.price)}</b><br />
              <button className="tiny" style={{ textDecoration: 'underline' }} onClick={() => setCart(cart.filter((_, j) => j !== k))}>{L('Ukloni', 'Remove')}</button></span>
          </div>
        ))}
      </div>
      <button className="ghost" style={{ marginBottom: 16 }} onClick={onAddMore}>+ {L('Dodaj još nešto', 'Add something else')}</button>

      {methods.length > 0 && <div className="eyebrow">{L('Kako stiže', 'Delivery')}</div>}
      {o.pickup?.on && (
        <button className={'opt' + (fulfil === 'pickup' ? ' sel' : '')} onClick={() => setFulfil('pickup')}>
          <span className="chk">✓</span><span className="grow"><b style={{ fontWeight: 600 }}>{o.pickup.label}</b><br /><span className="tiny">{o.pickup.place}</span></span>
        </button>
      )}
      {o.delivery?.on && (
        <button className={'opt' + (fulfil === 'delivery' ? ' sel' : '')} onClick={() => setFulfil('delivery')}>
          <span className="chk">✓</span><span className="grow"><b style={{ fontWeight: 600 }}>{o.delivery.label}</b><br /><span className="tiny">{o.delivery.sub}</span></span>
        </button>
      )}

      <div className="eyebrow" style={{ marginTop: 16 }}>{L('Za kada', 'When')}{lead ? L(` · najranije za ${lead} dana`, ` · at least ${lead} days ahead`) : ''}</div>
      <div className="dates">
        {dates.map((d, k) => (
          <button key={k} className={k === di ? 'sel' : ''} disabled={full.has(iso(d))} onClick={() => setDi(k)}>
            <small>{DAYS[lang === 'en' ? 'en' : 'sr'][d.getDay()]}</small>{d.getDate()}.{d.getMonth() + 1}.
          </button>
        ))}
      </div>
      {timeOn && (
        <>
          <div className="eyebrow" style={{ marginTop: 14 }}>{mode === 'parts' ? L('Kada ti odgovara preuzimanje', 'Preferred pickup time') : L('Vreme preuzimanja', 'Pickup time')}{o.pickup?.place ? ` · ${o.pickup.place}` : ''}</div>
          {mode === 'parts' && o.pickup?.partsNote && <p className="tiny" style={{ margin: '-4px 0 8px' }}>{o.pickup.partsNote}</p>}
          <div className={'times' + (mode === 'parts' ? ' parts' : '')} role="radiogroup" aria-label={L('Vreme preuzimanja', 'Pickup time')}>
            {slots.map(t => <button key={t} role="radio" aria-checked={tm === t} className={tm === t ? 'sel' : ''} onClick={() => { haptic('tap'); setTm(t) }}>{t}</button>)}
          </div>
        </>
      )}

      <div className="eyebrow" style={{ marginTop: 16 }}>{L('Podaci', 'Your details')}</div>
      {(client.phone || ship.address) && <p className="tiny" style={{ margin: '-4px 0 10px' }}>{L('Tvoji podaci od prošli put. Proveri ih ili izmeni.', 'Your details from last time. Check or change them.')}</p>}
      <div className="grid2">{inp('first', L('Ime', 'First name'), { autoComplete: 'given-name' })}{inp('last', L('Prezime', 'Last name'), { autoComplete: 'family-name' })}</div>
      <div className="grid2">{inp('phone', L('Telefon', 'Phone'), { type: 'tel', autoComplete: 'tel' })}{inp('email', 'Email', { type: 'email', autoComplete: 'email' })}</div>
      {fulfil === 'delivery' && (
        <>
          {inp('address', L('Adresa', 'Address'), { autoComplete: 'street-address' })}
          <div className="grid2">{inp('city', L('Grad', 'City'), { autoComplete: 'address-level2' })}{inp('zip', L('Poštanski broj', 'Postal code'), { inputMode: 'numeric', autoComplete: 'postal-code' })}</div>
        </>
      )}
      {o.cardMessage && (
        <label className="field"><span>{L('Poruka za karticu (opciono)', 'Card message (optional)')}</span>
          <textarea className="fin" rows={2} maxLength={200} style={{ resize: 'none' }} value={card} onChange={e => setCard(e.target.value)} />
        </label>
      )}

      <div className="eyebrow" style={{ marginTop: 16 }}>{L('Plaćanje', 'Payment')}</div>
      <div className="card lines">
        <div className="ln"><span>{L('Ukupno', 'Total')}</span><b>{din(total)}</b></div>
        {fulfil === 'delivery' && o.delivery?.postage && <div className="ln"><span>{L('Poštarina', 'Postage')}</span><span style={{ textAlign: 'right' }}>{o.delivery.postage}</span></div>}
        {dep > 0 ? (
          <>
            <div className="ln" style={{ color: 'var(--rouge)' }}><span style={{ color: 'var(--rouge)' }}>{L(`Avans ${o.depositPct}% uplatom na račun`, `${o.depositPct}% deposit by transfer`)}</span><b>{din(dep)}</b></div>
            <div className="ln"><span>{fulfil === 'delivery' ? L('Ostatak kuriru', 'Rest to the courier') : L('Ostatak pri preuzimanju', 'Rest at pickup')}</span><span>{din(total - dep)}</span></div>
          </>
        ) : <div className="ln"><span>{L('Plaćaš pri preuzimanju', 'Pay at pickup')}</span><b>{din(total)}</b></div>}
      </div>

      {(o.rules || []).filter(Boolean).length > 0 && (
        <label className="row" style={{ alignItems: 'flex-start', marginTop: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ width: 22, height: 22, accentColor: 'var(--rouge)', flex: 'none', marginTop: 1 }} />
          <span className="tiny" style={{ fontSize: 13.5 }}>{L('Pročitao/la sam pravila:', 'I have read the rules:')} {(o.rules || []).filter(Boolean).join(' ')}</span>
        </label>
      )}
      {err && <p className="err-text">{err}</p>}

      <div className="bar">
        <span className="grow"><small>{dep > 0 ? L('Uplaćuješ sada', 'Pay now') : L('Plaćaš pri preuzimanju', 'Pay at pickup')}</small><b>{din(dep > 0 ? dep : total)}</b></span>
        <button className="btn" disabled={busy} style={!ok ? { opacity: .55 } : undefined} onClick={send}>{busy ? '…' : L('Pošalji', 'Send')}</button>
      </div>
    </div>
  )
}
