// Gotov proizvod: slika ili crtež, opis, cena i (ako je dozvoljeno) promena boja i dodataka
import { useState, useRef } from 'react'
import Bouquet from './Bouquet'
import { Swatches, ExtrasPicker, FlowerRows } from './Builder'
import { onList, productPrice, din, nm, byId, packOf, packColors, isBox, cloneDesign, lines, photosOf } from './engine'
import { haptic } from '../lib/haptic'

// Slike proizvoda (do 3) koje se listaju prstom; crtež ide prvi kad kupac nešto promeni
function Gallery({ photos, drawing, alt, lang }) {
  const ref = useRef(null)
  const [at, setAt] = useState(0)
  const slides = [...(drawing ? [{ draw: drawing }] : []), ...photos.map(src => ({ src }))]
  if (slides.length === 1) return <div className="stage">{slides[0].draw || <img src={slides[0].src} alt={alt} />}</div>
  return (
    <div className="gal">
      <div className="gal-track" ref={ref} onScroll={e => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {slides.map((x, k) => <div key={k} className="stage gal-slide">{x.draw || <img src={x.src} alt={`${alt} ${k + 1}`} loading="lazy" />}</div>)}
      </div>
      <div className="gal-dots">{slides.map((x, k) => (
        <button key={k} className={k === at ? 'on' : ''} aria-label={(lang === 'en' ? 'Picture ' : 'Slika ') + (k + 1)}
          onClick={() => ref.current?.scrollTo({ left: k * ref.current.clientWidth, behavior: 'smooth' })} />
      ))}</div>
    </div>
  )
}

export default function Product({ shop, lang, product, onBack, onOrder }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const [d, setD] = useState(() => cloneDesign(product.design))
  const set = fn => setD(prev => { const n = cloneDesign(prev); fn(n); return n })
  const keychain = byId(shop.groups, product.group)?.type === 'keychain'
  const edit = product.edit || {}
  const pack = packOf(shop, d)
  const price = productPrice(shop, product, d)
  const changed = JSON.stringify({ ...d, opts: undefined }) !== JSON.stringify({ ...product.design, opts: undefined })
  const opts = (product.options || []).filter(o => o.title?.trim())
  const [err, setErr] = useState('')
  const photos = photosOf(product)

  return (
    <div className="flow anim-in">
      <button className="ghost" style={{ marginBottom: 12, width: 'auto', padding: '9px 14px' }} onClick={onBack}>← {L('Nazad', 'Back')}</button>
      <div className="pagehead"><h2>{nm(product, lang)}</h2><p>{lang === 'en' && product.descEn ? product.descEn : product.desc}</p></div>

      <Gallery photos={photos} drawing={!photos.length || changed ? <Bouquet shop={shop} design={d} size={250} keychain={keychain} /> : null} alt={nm(product, lang)} lang={lang} />

      {opts.map(o => {
        const v = d.opts?.[o.title] || ''
        const put = val => set(n => { n.opts = { ...(n.opts || {}), [o.title]: val } })
        return (
          <div key={o.id || o.title} style={{ marginBottom: 10 }}>
            <div className="eyebrow" style={{ marginTop: 6 }}>{o.title}{o.required ? '' : L(' (opciono)', ' (optional)')}</div>
            {o.type === 'text' ? (
              <input className="fin" value={v} maxLength={60} placeholder={o.placeholder || ''} aria-label={o.title} onChange={e => put(e.target.value)} />
            ) : (
              <div className="chips" role="radiogroup" aria-label={o.title}>
                {(o.choices || []).filter(Boolean).map(c => (
                  <button key={c} role="radio" aria-checked={v === c} className={'chip' + (v === c ? ' sel' : '')} onClick={() => { haptic('tap'); put(v === c ? '' : c) }}>{c}</button>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {(edit.colors || (edit.count && !keychain)) && (
        <>
          <div className="eyebrow" style={{ marginTop: 6 }}>{edit.colors && edit.count && !keychain ? L('Cveće, boje i broj', 'Flowers, colors and count') : edit.colors ? L('Boje cveća', 'Flower colors') : L('Broj cvetova', 'Number of flowers')}</div>
          <FlowerRows shop={shop} d={d} set={set} lang={lang} colors={!!edit.colors} count={edit.count && !keychain ? true : 'split'} />
        </>
      )}
      {edit.packColor && (
        <>
          <div className="swlabel">{isBox(pack) && !keychain ? L('Boja kutije', 'Box color') : L('Boja ukrasnog papira', 'Paper color')}</div>
          <Swatches list={keychain ? onList(shop.paperColors) : packColors(shop, pack)} value={d.packColor} lang={lang} onPick={id => set(n => { n.packColor = id })} />
        </>
      )}
      {edit.extras && (<><div className="eyebrow" style={{ marginTop: 6 }}>{L('Dodaci', 'Extras')}</div><ExtrasPicker shop={shop} d={d} set={set} lang={lang} /></>)}

      {!edit.colors && !edit.count && !edit.packColor && !edit.extras && (
        <div className="card lines">{lines(shop, d, lang).filter(x => x.label).map((x, i) => <div key={i} className="ln"><span>{x.label}</span><span>{x.hex && <i className="dot" style={{ background: x.hex }} />}{x.value}</span></div>)}</div>
      )}

      <div className="bar">
        <span className="grow"><small>{nm(product, lang)}</small><b>{din(price)}</b></span>
        {err && <span className="err-text" style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, margin: 0, padding: '8px 16px', background: 'var(--card)' }}>{err}</span>}
        <button className="btn" onClick={() => {
          const miss = opts.find(o => o.required && !String(d.opts?.[o.title] || '').trim())
          if (miss) { haptic('warning'); setErr(`${L('Izaberi', 'Choose')}: ${miss.title}`); return }
          setErr(''); haptic('tap'); onOrder({ title: nm(product, lang), productId: product.id, design: d, keychain, price, photo: changed ? null : photos[0] || null })
        }}>{L('Poruči', 'Order')}</button>
      </div>
    </div>
  )
}
