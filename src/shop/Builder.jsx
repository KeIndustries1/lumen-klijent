// "Napravi svoj": koraci dolaze iz podešavanja prodavnice (kreator → Katalog)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Bouquet from './Bouquet'
import { onList, visibleSteps, stepError, designPrice, din, nm, ttl, byId, packOf, packColors, isBox, summary, newDesign, cloneDesign } from './engine'
import { haptic } from '../lib/haptic'

export function readImage(file, max = 1200) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = reject
    r.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.85))
      }
      img.src = r.result
    }
    r.readAsDataURL(file)
  })
}

export function Swatches({ list, value, onPick, lang }) {
  return (
    <div className="swatches" role="radiogroup">
      {list.map(c => (
        <button key={c.id} role="radio" aria-checked={value === c.id} className={'sw' + (value === c.id ? ' sel' : '')} onClick={() => { haptic('tap'); onPick(c.id) }}>
          <i style={{ background: c.hex }} />{nm(c, lang)}
        </button>
      ))}
    </div>
  )
}

export function ExtrasPicker({ shop, d, set, lang }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  return onList(shop.extras).map(e => {
    const v = d.extras?.[e.id]
    const sel = !!v || v === ''
    const toggle = () => { haptic('tap'); set(n => { const ex = { ...n.extras }; if (sel) delete ex[e.id]; else ex[e.id] = e.input === 'none' ? true : ''; n.extras = ex }) }
    return (
      <div key={e.id}>
        <button className={'opt' + (sel ? ' sel' : '')} onClick={toggle}>
          <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(e, lang)}</span>
          <span className="price">+{din(e.price)}{e.perChar ? L(' / slovo', ' / letter') : ''}</span>
        </button>
        {sel && e.input !== 'none' && (
          <label className="field" style={{ margin: '-2px 0 12px' }}>
            <span>{e.input === 'number' ? L('Upiši broj', 'Enter a number') : e.input === 'letters' ? L('Upiši slova', 'Enter letters') : L('Upiši tekst', 'Enter text')}</span>
            <input className="fin" value={typeof v === 'string' ? v : ''} maxLength={e.maxLen || 40} inputMode={e.input === 'number' ? 'numeric' : 'text'}
              onChange={ev => {
                let t = ev.target.value
                if (e.input === 'number') t = t.replace(/[^0-9]/g, '')
                if (e.input === 'letters') t = t.toUpperCase()
                set(n => { n.extras = { ...n.extras, [e.id]: t } })
              }} />
          </label>
        )}
      </div>
    )
  })
}

export default function Builder({ shop, lang, initial, onBack, onDone }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const [d, setD] = useState(() => cloneDesign(initial || newDesign(shop)))
  const [i, setI] = useState(0)
  const [err, setErr] = useState('')
  const set = fn => setD(prev => { const n = cloneDesign(prev); fn(n); return n })
  const steps = visibleSteps(shop, d)
  const idx = Math.min(i, steps.length - 1)
  const step = steps[idx]
  const price = designPrice(shop, d)
  const presets = shop.limits?.qtyPresets || []

  function next() {
    const e = step ? stepError(shop, step, d, lang) : ''
    if (e) { setErr(e); haptic('warning'); return }
    setErr(''); haptic('tap')
    if (idx < steps.length - 1) { setI(idx + 1); window.scrollTo(0, 0) } else onDone(d)
  }
  function back() { setErr(''); if (idx === 0) onBack(); else setI(idx - 1) }

  const flowersOn = onList(shop.flowers)
  const pack = packOf(shop, d)

  return (
    <div className="flow anim-in">
      <button className="ghost" style={{ marginBottom: 12, width: 'auto', padding: '9px 14px' }} onClick={back}>← {L('Nazad', 'Back')}</button>
      <div className="flow-bars">{steps.map((s, k) => <i key={s.id} className={k <= idx ? 'on' : ''} />)}</div>
      <div className="pagehead"><h2>{ttl(step, lang)}</h2><p>{lang === 'en' ? step?.subEn || '' : step?.sub}</p></div>

      <div className="stage"><Bouquet shop={shop} design={d} size={250} /></div>

      <AnimatePresence mode="wait">
        <motion.div key={step?.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          {step?.type === 'pack' && onList(shop.packs).map(p => (
            <button key={p.id} className={'opt' + (d.pack === p.id ? ' sel' : '')} onClick={() => { haptic('tap'); set(n => { n.pack = p.id; const pc = packColors(shop, p); if (!byId(pc, n.packColor)) n.packColor = pc[0]?.id }) }}>
              <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(p, lang)}</span>
              <span className="price">{p.price ? '+' + din(p.price) : L('uključeno', 'included')}</span>
            </button>
          ))}

          {step?.type === 'flowers' && flowersOn.map(f => {
            const sel = (d.items || []).some(it => it.flower === f.id)
            return (
              <button key={f.id} className={'opt' + (sel ? ' sel' : '')} onClick={() => {
                haptic('tap')
                set(n => {
                  if (sel) n.items = n.items.filter(it => it.flower !== f.id)
                  else n.items = [...(n.items || []), { flower: f.id, count: (n.items || []).length ? 5 : (presets[1] || 11), color: onList(shop.colors)[0]?.id }]
                })
              }}>
                <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(f, lang)}</span>
                <span className="price">{din(f.price)} {L('/ kom', '/ pc')}</span>
              </button>
            )
          })}

          {step?.type === 'qty' && (
            <>
              {(d.items || []).map((it, k) => (
                <div key={k} className="qty">
                  <b>{nm(byId(shop.flowers, it.flower), lang)}</b>
                  <button aria-label={L('Manje', 'Less')} onClick={() => set(n => { n.items[k].count = Math.max(1, (n.items[k].count || 1) - 1) })}>−</button>
                  <span>{it.count}</span>
                  <button aria-label={L('Više', 'More')} onClick={() => set(n => { n.items[k].count = Math.min(shop.limits?.maxFlowers || 999, (n.items[k].count || 0) + 1) })}>+</button>
                </div>
              ))}
              {(d.items || []).length === 1 && presets.length > 0 && (
                <div className="qpresets">{presets.map(q => <button key={q} onClick={() => set(n => { n.items[0].count = q })}>{q}</button>)}</div>
              )}
              <p className="tiny">{L('Ukupno cvetova', 'Total flowers')}: {(d.items || []).reduce((a, x) => a + x.count, 0)}</p>
            </>
          )}

          {step?.type === 'colors' && (d.items || []).map((it, k) => (
            <div key={k}>
              <div className="swlabel">{nm(byId(shop.flowers, it.flower), lang)} · {it.count}</div>
              <Swatches list={onList(shop.colors)} value={it.color} lang={lang} onPick={id => set(n => { n.items[k].color = id })} />
            </div>
          ))}

          {step?.type === 'packColor' && (
            <>
              <div className="swlabel">{isBox(pack) ? L('Boja kutije', 'Box color') : L('Boja ukrasnog papira', 'Wrapping paper color')}</div>
              <Swatches list={packColors(shop, pack)} value={d.packColor} lang={lang} onPick={id => set(n => { n.packColor = id })} />
            </>
          )}

          {step?.type === 'extras' && <ExtrasPicker shop={shop} d={d} set={set} lang={lang} />}

          {step?.type === 'wish' && (
            <>
              <label className="field"><span>{L('Opiši svoju želju (opciono)', 'Describe your wish (optional)')}</span>
                <textarea className="fin" rows={4} style={{ resize: 'none' }} value={d.wish || ''} onChange={e => set(n => { n.wish = e.target.value })} />
              </label>
              <label className="inspo">
                {d.inspo ? <img src={d.inspo} alt="" /> : null}
                {d.inspo ? L('Promeni sliku inspiracije', 'Change inspiration photo') : L('+ Dodaj sliku inspiracije', '+ Add an inspiration photo')}
                <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) { const u = await readImage(f); set(n => { n.inspo = u }) } }} />
              </label>
              {d.inspo && <button className="ghost" style={{ marginTop: 8 }} onClick={() => set(n => { n.inspo = null })}>{L('Ukloni sliku', 'Remove photo')}</button>}
            </>
          )}

          {step?.type === 'single' && onList(step.options).map(o => (
            <button key={o.id} className={'opt' + (d.custom?.[step.id] === o.id ? ' sel' : '')} onClick={() => { haptic('tap'); set(n => { n.custom = { ...n.custom, [step.id]: o.id } }) }}>
              <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(o, lang)}</span>
              {o.price ? <span className="price">+{din(o.price)}</span> : null}
            </button>
          ))}
          {step?.type === 'multi' && onList(step.options).map(o => {
            const cur = d.custom?.[step.id] || [], sel = cur.includes(o.id)
            return (
              <button key={o.id} className={'opt' + (sel ? ' sel' : '')} onClick={() => { haptic('tap'); set(n => { n.custom = { ...n.custom, [step.id]: sel ? cur.filter(x => x !== o.id) : [...cur, o.id] } }) }}>
                <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(o, lang)}</span>
                {o.price ? <span className="price">+{din(o.price)}</span> : null}
              </button>
            )
          })}
          {step?.type === 'text' && (
            <label className="field"><span>{ttl(step, lang)}{step.price ? ` (+${din(step.price)})` : ''}</span>
              <textarea className="fin" rows={3} maxLength={step.maxLen || 200} style={{ resize: 'none' }} value={d.custom?.[step.id] || ''} onChange={e => set(n => { n.custom = { ...n.custom, [step.id]: e.target.value } })} />
            </label>
          )}
          {err && <p className="err-text">{err}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="bar">
        <span className="grow" style={{ minWidth: 0 }}><small>{summary(shop, d, lang)}</small><b>{din(price)}</b></span>
        <button className="btn" onClick={next}>{idx < steps.length - 1 ? L('Dalje', 'Next') : L('Poruči', 'Order')}</button>
      </div>
    </div>
  )
}
