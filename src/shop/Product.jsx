// Gotov proizvod: slika ili crtež, opis, cena i (ako je dozvoljeno) promena boja i dodataka
import { useState } from 'react'
import Bouquet from './Bouquet'
import { Swatches, ExtrasPicker } from './Builder'
import { onList, productPrice, din, nm, byId, packOf, packColors, isBox, cloneDesign, lines } from './engine'
import { haptic } from '../lib/haptic'

export default function Product({ shop, lang, product, onBack, onOrder }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const [d, setD] = useState(() => cloneDesign(product.design))
  const set = fn => setD(prev => { const n = cloneDesign(prev); fn(n); return n })
  const keychain = byId(shop.groups, product.group)?.type === 'keychain'
  const edit = product.edit || {}
  const pack = packOf(shop, d)
  const price = productPrice(shop, product, d)
  const changed = JSON.stringify(d) !== JSON.stringify(product.design)

  return (
    <div className="flow anim-in">
      <button className="ghost" style={{ marginBottom: 12, width: 'auto', padding: '9px 14px' }} onClick={onBack}>← {L('Nazad', 'Back')}</button>
      <div className="pagehead"><h2>{nm(product, lang)}</h2><p>{lang === 'en' && product.descEn ? product.descEn : product.desc}</p></div>

      <div className="stage">
        {product.photo && !changed ? <img src={product.photo} alt={nm(product, lang)} /> : <Bouquet shop={shop} design={d} size={250} keychain={keychain} />}
      </div>

      {edit.colors && (d.items || []).map((it, k) => (
        <div key={k}>
          <div className="swlabel">{L('Boja', 'Color')}: {nm(byId(shop.flowers, it.flower), lang)}{(d.items || []).length > 1 ? ` · ${it.count}` : ''}</div>
          <Swatches list={onList(shop.colors)} value={it.color} lang={lang} onPick={id => set(n => { n.items[k].color = id })} />
        </div>
      ))}
      {edit.packColor && (
        <>
          <div className="swlabel">{isBox(pack) && !keychain ? L('Boja kutije', 'Box color') : L('Boja ukrasnog papira', 'Paper color')}</div>
          <Swatches list={keychain ? onList(shop.paperColors) : packColors(shop, pack)} value={d.packColor} lang={lang} onPick={id => set(n => { n.packColor = id })} />
        </>
      )}
      {edit.extras && (<><div className="eyebrow" style={{ marginTop: 6 }}>{L('Dodaci', 'Extras')}</div><ExtrasPicker shop={shop} d={d} set={set} lang={lang} /></>)}

      {!edit.colors && !edit.packColor && !edit.extras && (
        <div className="card lines">{lines(shop, d, lang).filter(x => x.label).map((x, i) => <div key={i} className="ln"><span>{x.label}</span><span>{x.hex && <i className="dot" style={{ background: x.hex }} />}{x.value}</span></div>)}</div>
      )}

      <div className="bar">
        <span className="grow"><small>{nm(product, lang)}</small><b>{din(price)}</b></span>
        <button className="btn" onClick={() => { haptic('tap'); onOrder({ title: nm(product, lang), productId: product.id, design: d, keychain, price, photo: changed ? null : product.photo }) }}>{L('Poruči', 'Order')}</button>
      </div>
    </div>
  )
}
