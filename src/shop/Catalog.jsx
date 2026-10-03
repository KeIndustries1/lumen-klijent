// Katalog: "Napravi svoj" + gotovi proizvodi po grupama
import { useState } from 'react'
import Bouquet from './Bouquet'
import { onList, productPrice, din, nm, byId } from './engine'
import { haptic } from '../lib/haptic'

export default function Catalog({ shop, lang, onMake, onOpen, cartCount, onCart }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const groups = onList(shop.groups).filter(g => onList(shop.products).some(p => p.group === g.id))
  const [gid, setGid] = useState(groups[0]?.id)
  const g = byId(groups, gid) || groups[0]
  const prods = onList(shop.products).filter(p => p.group === g?.id)
  const builder = shop.builderOn !== false && onList(shop.flowers).length > 0

  return (
    <div className="anim-in shop-page">
      <div className="pagehead"><h2>{shop.texts?.catalogTitle || L('Katalog', 'Catalog')}</h2><p>{shop.texts?.catalogSub}</p></div>

      {builder && (
        <button className="shop-make" onClick={() => { haptic('tap'); onMake() }}>
          <span className="plus" aria-hidden>+</span>
          <span className="grow"><span className="name" style={{ fontSize: 16 }}>{shop.texts?.makeOwn || L('Napravi svoj', 'Make your own')}</span><br /><span className="tiny">{shop.texts?.makeOwnSub}</span></span>
          <span style={{ color: 'var(--rouge)', fontSize: 22 }} aria-hidden>›</span>
        </button>
      )}

      {groups.length > 1 && (
        <div className="shop-groups" role="tablist">
          {groups.map(x => <button key={x.id} role="tab" aria-selected={x.id === g?.id} className={x.id === g?.id ? 'on' : ''} onClick={() => { haptic('tap'); setGid(x.id) }}>{nm(x, lang)}</button>)}
        </div>
      )}
      {groups.length === 1 && <div className="eyebrow">{nm(g, lang)}</div>}

      {prods.map(p => (
        <button key={p.id} className="prow" onClick={() => { haptic('tap'); onOpen(p) }}>
          <span className="prow-img">
            {p.photo ? <img src={p.photo} alt="" /> : <Bouquet shop={shop} design={p.design} size={84} keychain={g?.type === 'keychain'} />}
          </span>
          <span className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="name">{nm(p, lang)}</span>
            <span className="tiny">{lang === 'en' && p.descEn ? p.descEn : p.desc}</span>
            <span className="svc-price">{din(productPrice(shop, p))}</span>
          </span>
          <span className="prow-btn">{L('Poruči', 'Order')}</span>
        </button>
      ))}

      {cartCount > 0 && (
        <div className="bar" style={{ bottom: 'calc(70px + env(safe-area-inset-bottom))' }}>
          <span className="grow"><small>{L('U porudžbini', 'In your order')}</small><b>{cartCount} {cartCount === 1 ? L('stavka', 'item') : L('stavke', 'items')}</b></span>
          <button className="btn" onClick={onCart}>{L('Nastavi', 'Continue')}</button>
        </div>
      )}
    </div>
  )
}
