// Moje porudžbine (umesto "Termini") + ekran posle slanja porudžbine
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Bouquet from './Bouquet'
import { din } from './engine'
import { haptic } from '../lib/haptic'

export const STATUS = ['awaiting_payment', 'confirmed', 'in_progress', 'ready', 'done']
export const STATUS_LABEL = {
  sr: { awaiting_payment: 'Čeka odobrenje', confirmed: 'Potvrđeno', in_progress: 'U izradi', ready: 'Spremno', done: 'Isporučeno', cancelled: 'Otkazano' },
  en: { awaiting_payment: 'Awaiting approval', confirmed: 'Confirmed', in_progress: 'In progress', ready: 'Ready', done: 'Delivered', cancelled: 'Cancelled' },
}
const fmtDate = s => { const d = new Date(s + 'T00:00:00'); return `${d.getDate()}.${d.getMonth() + 1}.` }

export default function Orders({ shop, salon, client, lang, refresh }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const [rows, setRows] = useState(null)
  const [tab, setTab] = useState('active')
  const [ask, setAsk] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cerr, setCerr] = useState('')
  const [copied, setCopied] = useState('')
  const contactEmail = shop.order?.contactEmail
  const ig = salon?.instagram
  async function cancel(o) {
    setBusy(true)
    const { error } = await supabase.from('orders').update({ status: 'cancelled', cancel_reason: 'client' }).eq('id', o.id).eq('status', 'awaiting_payment')
    setBusy(false); setAsk(null)
    if (error) { haptic('warning'); setCerr(error.message); return }
    setCerr(''); haptic('success'); setRows(rs => rs.map(x => (x.id === o.id ? { ...x, status: 'cancelled', cancel_reason: 'client' } : x)))
  }
  const copy = v => { navigator.clipboard?.writeText(String(v)); setCopied(v); haptic('tap'); setTimeout(() => setCopied(''), 1200) }
  useEffect(() => {
    supabase.from('orders').select('*').eq('client_id', client.id).order('created_at', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [client.id, refresh])

  const list = (rows || []).filter(o => (tab === 'active' ? !['done', 'cancelled'].includes(o.status) : ['done', 'cancelled'].includes(o.status)))
  return (
    <div className="anim-in shop-page">
      <div className="pagehead"><h2>{L('Moje porudžbine', 'My orders')}</h2></div>
      <div className="subtabs">
        <button className={tab === 'active' ? 'on' : ''} onClick={() => { haptic('tap'); setTab('active') }}>{L('Aktivne', 'Active')}</button>
        <button className={tab === 'past' ? 'on' : ''} onClick={() => { haptic('tap'); setTab('past') }}>{L('Prošle', 'Past')}</button>
      </div>
      {rows === null ? <p className="tiny">…</p> : !list.length ? (
        <div className="card"><p className="tiny" style={{ margin: 0 }}>{tab === 'active' ? L('Nemaš aktivnih porudžbina.', 'You have no active orders.') : L('Nema prošlih porudžbina.', 'No past orders.')}</p></div>
      ) : list.map(o => {
        const first = (o.items || [])[0]
        const si = STATUS.indexOf(o.status)
        return (
          <div key={o.id} className="card" style={{ marginBottom: 10 }}>
            <div className="row">
              <span className="prow-img" style={{ width: 64, height: 64 }}>
                {first?.photo ? <img src={first.photo} alt="" /> : first?.design ? <Bouquet shop={shop} design={first.design} size={64} keychain={first.keychain} /> : null}
              </span>
              <span className="grow">
                <span className="row" style={{ justifyContent: 'space-between' }}><span className="name">{(o.items || []).map(i => i.title).join(' + ')}</span><span className="tiny">#{o.number}</span></span>
                <span className="tiny">{fmtDate(o.due_date)}{o.due_time ? ` · ${o.due_time}` : ''} · {o.fulfil === 'delivery' ? shop.order?.delivery?.label : shop.order?.pickup?.label}</span><br />
                <span className="svc-price">{din(o.total)}</span>
              </span>
            </div>
            {o.status !== 'cancelled' && <div className="osteps">{STATUS.map((s, k) => <i key={s} className={k <= si ? 'on' : ''} />)}</div>}
            <span className="ostatus">{STATUS_LABEL[lang === 'en' ? 'en' : 'sr'][o.status] || o.status}</span>
            {o.status === 'awaiting_payment' && o.deposit > 0 && (
              <div className="paybox">{L('Avans', 'Deposit')} {din(o.deposit)} · {L('poziv na broj', 'reference')} {o.number}{shop.order?.bank?.account ? ` · ${shop.order.bank.account}` : ''}</div>
            )}
            {o.status === 'cancelled' && o.cancel_reason === 'auto' && <p className="tiny" style={{ margin: '6px 0 0' }}>{L('Uplata nije potvrđena u roku, porudžbina je otkazana.', 'Payment was not confirmed in time, the order was cancelled.')}</p>}
            {o.tracking && (
              <div className="lines" style={{ marginTop: 6 }}><div className="ln"><span>{L('Broj pošiljke', 'Tracking number')}</span>
                <button style={{ fontWeight: 700 }} onClick={() => copy(o.tracking)}>{copied === o.tracking ? L('Kopirano', 'Copied') : o.tracking}</button></div></div>
            )}
            {o.status === 'awaiting_payment' && (ask === o.id ? (
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <button className="ghost" style={{ flex: 1 }} onClick={() => setAsk(null)}>{L('Ne', 'No')}</button>
                <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={() => cancel(o)}>{busy ? '…' : L('Da, otkaži', 'Yes, cancel')}</button>
              </div>
            ) : (
              <button className="tiny" style={{ marginTop: 10, textDecoration: 'underline', minHeight: 36 }} onClick={() => { haptic('tap'); setAsk(o.id) }}>{L('Otkaži porudžbinu', 'Cancel order')}</button>
            ))}
            {cerr && ask === null && o.status === 'awaiting_payment' && <p className="err-text">{cerr}</p>}
            {['confirmed', 'in_progress', 'ready'].includes(o.status) && (contactEmail || ig) && (
              <p className="tiny" style={{ margin: '8px 0 0' }}>{L('Za otkazivanje posle uplate javi se na', 'To cancel after paying, contact')} {[contactEmail, ig].filter(Boolean).join(L(' ili ', ' or '))}.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Done({ shop, order, lang, onOrders }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const b = shop.order?.bank || {}
  const hours = Number(shop.order?.payHours) || 48
  const dl = new Date(new Date(order.created_at || Date.now()).getTime() + hours * 3600 * 1000)
  const [copied, setCopied] = useState('')
  const copy = (k, v) => { navigator.clipboard?.writeText(String(v)); setCopied(k); haptic('tap'); setTimeout(() => setCopied(''), 1200) }
  const row = (k, label, v) => (
    <div className="ln"><span>{label}</span><button style={{ fontWeight: 700, textAlign: 'right' }} onClick={() => copy(k, v)}>{copied === k ? L('Kopirano', 'Copied') : v}</button></div>
  )
  return (
    <div className="flow anim-in" style={{ background: 'var(--ink)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, margin: '30px 0 24px' }}>
        <div className="success-circle"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
        <p style={{ margin: 0, font: '600 20px Fraunces, serif' }}>{L('Porudžbina je poslata', 'Order sent')}</p>
        <span className="tiny">{L('Broj porudžbine', 'Order number')} <b style={{ color: 'var(--text)' }}>#{order.number}</b></span>
        {order.deposit > 0 && <span className="ostatus">{STATUS_LABEL[lang === 'en' ? 'en' : 'sr'].awaiting_payment}</span>}
      </div>
      {order.deposit > 0 ? (
        <div className="card lines" style={{ padding: '4px 16px 14px' }}>
          <div className="eyebrow" style={{ margin: '12px 0 2px' }}>{L('Uplata avansa', 'Deposit payment')}</div>
          {b.name && row('name', L('Primalac', 'Recipient'), b.name)}
          {b.account && row('acc', L('Račun', 'Account'), b.account)}
          {row('amt', L('Iznos', 'Amount'), din(order.deposit))}
          {row('ref', L('Poziv na broj', 'Reference'), order.number)}
          {b.purpose && <div className="ln"><span>{L('Svrha', 'Purpose')}</span><span>{b.purpose}</span></div>}
          <div className="paybox">{L('Uplati do', 'Pay by')} {dl.getDate()}.{dl.getMonth() + 1}. {String(dl.getHours()).padStart(2, '0')}:{String(dl.getMinutes()).padStart(2, '0')}. {L('Kad uplata legne, porudžbina se potvrđuje i dobijaš obaveštenje. Ako uplata ne stigne u roku, porudžbina se sama otkazuje.', 'Once the payment arrives, your order is confirmed and you get a notification. If it does not arrive in time, the order is cancelled automatically.')}</div>
        </div>
      ) : (
        <div className="card tiny" style={{ fontSize: 14 }}>{L('Ništa ne uplaćuješ unapred. Javićemo ti kad bude spremno.', 'Nothing to pay now. We will let you know when it is ready.')}</div>
      )}
      <button className="btn" style={{ marginTop: 18 }} onClick={onOrders}>{L('Moje porudžbine', 'My orders')}</button>
    </div>
  )
}
