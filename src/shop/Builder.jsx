// "Napravi svoj": koraci dolaze iz podešavanja prodavnice (kreator → Katalog)
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Bouquet from './Bouquet'
import { onList, visibleSteps, stepError, designPrice, din, nm, ttl, byId, packOf, packColors, isBox, summary, newDesign, cloneDesign, flowerColors, paperBg, extraQty, totalCount } from './engine'
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
          <i style={{ background: paperBg(c, true) }} />{nm(c, lang)}
        </button>
      ))}
    </div>
  )
}

export function ExtrasPicker({ shop, d, set, lang }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const n = totalCount(d)
  return onList(shop.extras).map(e => {
    const v = d.extras?.[e.id]
    const sel = (!!v || v === '') && v !== 0
    const qty = e.input === 'qty'
    const toggle = () => { haptic('tap'); set(x => { const ex = { ...x.extras }; if (sel) delete ex[e.id]; else ex[e.id] = e.input === 'none' ? true : qty ? 1 : ''; x.extras = ex }) }
    const unit = e.perChar ? L(' / slovo', ' / letter') : qty ? L(' / kom', ' / pc') : e.perFlower ? L(' / cvet', ' / flower') : ''
    return (
      <div key={e.id}>
        <button className={'opt' + (sel ? ' sel' : '')} onClick={toggle}>
          <span className="chk">✓</span><span className="grow" style={{ fontWeight: 600 }}>{nm(e, lang)}</span>
          <span className="price">+{din(e.price)}{unit}{e.perFlower && sel && n ? ` = ${din(e.price * n)}` : ''}</span>
        </button>
        {sel && qty && (
          <div className="qty" style={{ margin: '-2px 0 12px' }}>
            <b>{L('Komada', 'Pieces')}</b>
            <button aria-label={L('Manje', 'Less')} onClick={() => { haptic('tap'); set(x => { const q = extraQty(x.extras[e.id]) - 1; const ex = { ...x.extras }; if (q < 1) delete ex[e.id]; else ex[e.id] = q; x.extras = ex }) }}>−</button>
            <span>{extraQty(v)}</span>
            <button aria-label={L('Više', 'More')} onClick={() => { haptic('tap'); set(x => { x.extras = { ...x.extras, [e.id]: Math.min(e.max || 50, extraQty(x.extras[e.id]) + 1) } }) }}>+</button>
          </div>
        )}
        {sel && !qty && e.input !== 'none' && (
          <label className="field" style={{ margin: '-2px 0 12px' }}>
            <span>{e.input === 'number' ? L('Upiši broj', 'Enter a number') : e.input === 'letters' ? L('Upiši slova', 'Enter letters') : L('Upiši tekst', 'Enter text')}</span>
            <input className="fin" value={typeof v === 'string' ? v : ''} maxLength={e.maxLen || 40} inputMode={e.input === 'number' ? 'numeric' : 'text'}
              onChange={ev => {
                let t = ev.target.value
                if (e.input === 'number') t = t.replace(/[^0-9]/g, '')
                if (e.input === 'letters') t = t.toUpperCase()
                set(x => { x.extras = { ...x.extras, [e.id]: t } })
              }} />
          </label>
        )}
      </div>
    )
  })
}

// Cveće po redovima: boja i broj za svaki red; isti cvet može u više boja (5 plavih + 10 belih ruža)
export function FlowerRows({ shop, d, set, lang, colors = true, count = 'split' }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const items = d.items || []
  const max = shop.limits?.maxFlowers || 999
  const nOf = fid => items.filter(x => x.flower === fid).length
  const total = items.reduce((a, x) => a + (Number(x.count) || 0), 0)
  return (
    <>
      {items.map((it, k) => {
        const f = byId(shop.flowers, it.flower)
        const multi = nOf(it.flower) > 1
        const last = !items.slice(k + 1).some(x => x.flower === it.flower)
        const showCount = count === true || (count === 'split' && multi)
        return (
          <div key={k} className="frow">
            <div className="frow-head">
              <span className="swlabel" style={{ margin: 0 }}>{nm(f, lang)}{!showCount ? ` · ${it.count}` : ''}</span>
              {showCount && (
                <span className="qty mini">
                  <button aria-label={L('Manje', 'Less')} onClick={() => { haptic('tap'); set(n => { n.items[k].count = Math.max(1, (n.items[k].count || 1) - 1) }) }}>−</button>
                  <span>{it.count}</span>
                  <button aria-label={L('Više', 'More')} onClick={() => { haptic('tap'); set(n => { if (total < max) n.items[k].count = (n.items[k].count || 0) + 1 }) }}>+</button>
                </span>
              )}
              {multi && <button className="frow-x" aria-label={L('Ukloni ovu boju', 'Remove this color')} onClick={() => { haptic('tap'); set(n => { n.items.splice(k, 1) }) }}>✕</button>}
            </div>
            {colors && <Swatches list={flowerColors(shop, it.flower)} value={it.color} lang={lang} onPick={id => set(n => { n.items[k].color = id })} />}
            {colors && last && flowerColors(shop, it.flower).length > 1 && (
              <button className="frow-add" onClick={() => {
                haptic('tap')
                set(n => {
                  const used = n.items.filter(x => x.flower === it.flower).map(x => x.color)
                  const fc = flowerColors(shop, it.flower)
                  const c = fc.find(x => !used.includes(x.id)) || fc[0]
                  n.items.splice(k + 1, 0, { flower: it.flower, count: 1, color: c?.id })
                })
              }}>+ {L(`${nm(f, lang)} u još jednoj boji`, `${nm(f, lang)} in another color`)}</button>
            )}
          </div>
        )
      })}
    </>
  )
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
                  else n.items = [...(n.items || []), { flower: f.id, count: (n.items || []).length ? 5 : (presets[1] || 11), color: flowerColors(shop, f.id)[0]?.id }]
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
                  <b>{nm(byId(shop.flowers, it.flower), lang)}{(d.items || []).filter(x => x.flower === it.flower).length > 1 ? ` · ${nm(byId(shop.colors, it.color), lang).toLowerCase()}` : ''}</b>
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

          {step?.type === 'colors' && <FlowerRows shop={shop} d={d} set={set} lang={lang} colors count="split" />}

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
