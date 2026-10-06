// Glavni deo aplikacije za šablon Katalog i porudžbine (salons.kind = 'catalog').
// Isti kostur kao zakazivanje: gornja traka, 5 tabova, obaveštenja i podešavanja.
import { useEffect, useState } from 'react'
import Home from '../Home'
import Notifications from '../Notifications'
import { useLang } from '../lib/i18n'
import { haptic } from '../lib/haptic'
import Catalog from './Catalog'
import Builder from './Builder'
import Product from './Product'
import Checkout from './Checkout'
import Orders, { Done } from './Orders'
import Bouquet from './Bouquet'
import { heroArt } from './HeroArt'
import { RulesButton, hasRules } from './Rules'
import { byId, matchingDesign, productPrice, nm, designPrice, defaultShop } from './engine'
import './shop.css'

function Upsell({ shop, lang, base, onAdd, onSkip }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const p = byId(shop.products, shop.upsell?.product)
  const d = matchingDesign(shop, base.design, p)
  const price = productPrice(shop, p, d)
  return (
    <div className="flow anim-in">
      <div className="pagehead" style={{ marginTop: 20 }}><h2>{(lang === 'en' && shop.upsell?.titleEn) || shop.upsell?.title || L('Dodaj uz porudžbinu?', 'Add to your order?')}</h2><p>{nm(p, lang)} · {L('u istim bojama', 'in matching colors')}</p></div>
      <div className="stage"><Bouquet shop={shop} design={d} size={250} keychain /></div>
      <button className="btn" onClick={() => onAdd({ title: nm(p, lang), productId: p.id, design: d, keychain: true, price })}>{L('Dodaj', 'Add')} · +{price.toLocaleString('sr-RS')} din</button>
      <button className="ghost" style={{ marginTop: 10 }} onClick={onSkip}>{L('Ne, hvala', 'No, thanks')}</button>
    </div>
  )
}

export default function ShopMain({ salon, client: client0, LangSwitch, Settings }) {
  const { lang } = useLang()
  const L = (sr, en) => (lang === 'en' ? en : sr)
  const shop = salon.shop || defaultShop()
  const [client, setClient] = useState(client0)
  useEffect(() => { setClient(client0) }, [client0])
  const [page, setPage] = useState('home')
  const [flow, setFlow] = useState(null)        // { type: 'builder'|'product'|'upsell'|'checkout'|'done', ... }
  const [cart, setCart] = useState([])
  const [refresh, setRefresh] = useState(0)

  useEffect(() => { window.scrollTo(0, 0) }, [page, flow?.type])

  const upsellProduct = shop.upsell?.on ? byId(shop.products, shop.upsell.product) : null
  function addToCart(item) {
    const next = [...cart, item]
    setCart(next)
    const already = next.some(x => x.productId === upsellProduct?.id)
    if (upsellProduct && upsellProduct.on !== false && !item.keychain && !already) setFlow({ type: 'upsell', base: item })
    else setFlow({ type: 'checkout' })
  }
  const goTab = p => { haptic('tap'); setFlow(null); setPage(p) }

  let body
  if (flow?.type === 'builder') body = <Builder shop={shop} lang={lang} initial={flow.initial} onBack={() => setFlow(null)} onDone={d => addToCart({ title: shop.texts?.makeOwn ? L('Moj buket', 'My bouquet') : L('Po želji', 'Custom'), design: d, price: designPrice(shop, d) })} />
  else if (flow?.type === 'product') body = <Product shop={shop} lang={lang} product={flow.product} onBack={() => setFlow(null)} onOrder={addToCart} />
  else if (flow?.type === 'upsell') body = <Upsell shop={shop} lang={lang} base={flow.base} onAdd={it => { setCart(c => [...c, it]); setFlow({ type: 'checkout' }) }} onSkip={() => setFlow({ type: 'checkout' })} />
  else if (flow?.type === 'checkout') body = <Checkout shop={shop} salon={salon} client={client} lang={lang} cart={cart} setCart={setCart}
    onAddMore={() => { setFlow(null); setPage('catalog') }} onBack={() => setFlow(null)} onClient={patch => setClient(c => ({ ...c, ...patch }))}
    onDone={order => { setCart([]); setRefresh(r => r + 1); setFlow({ type: 'done', order }) }} />
  else if (flow?.type === 'done') body = <Done shop={shop} order={flow.order} lang={lang} onOrders={() => { setFlow(null); setPage('orders') }} />

  return (
    <div className="app-shell">
      <div className="topbar">
        <b>{salon.name}<span>.</span></b>
        <LangSwitch />
      </div>

      {body || (
        <div className="tabpage-stack">
          <div style={{ display: page === 'home' ? 'block' : 'none' }}>
            <Home salon={salon} art={heroArt(salon)} label={shop.texts?.cta || L('Naruči', 'Order')} onBook={() => goTab('catalog')} />
            {hasRules(shop) && <div className="homedark" style={{ paddingTop: 0 }}><RulesButton shop={shop} lang={lang} /></div>}
          </div>
          <div style={{ display: page === 'catalog' ? 'block' : 'none' }}>
            <Catalog shop={shop} lang={lang} cartCount={cart.length} onCart={() => setFlow({ type: 'checkout' })}
              onMake={() => setFlow({ type: 'builder' })} onOpen={p => setFlow({ type: 'product', product: p })} />
          </div>
          <div style={{ display: page === 'orders' ? 'block' : 'none' }}>
            <Orders shop={shop} salon={salon} client={client} lang={lang} refresh={refresh} />
          </div>
          <div style={{ display: page === 'notif' ? 'block' : 'none' }}>
            <Notifications client={client} salon={salon} />
          </div>
          <div style={{ display: page === 'settings' ? 'block' : 'none' }}>
            <Settings client={client} />
          </div>
        </div>
      )}

      {!body && (
        <div className="tabs">
          <button className={page === 'home' ? 'on' : ''} onClick={() => goTab('home')}><span className="i">⌂</span><span>{L('Početna', 'Home')}</span></button>
          <button className={page === 'catalog' ? 'on' : ''} onClick={() => goTab('catalog')}><span className="i">☰</span><span>{L('Katalog', 'Catalog')}</span></button>
          <button className={page === 'orders' ? 'on' : ''} onClick={() => goTab('orders')}><span className="i">◷</span><span>{L('Porudžbine', 'Orders')}</span></button>
          <button className={page === 'notif' ? 'on' : ''} onClick={() => goTab('notif')}><span className="i">◔</span><span>{L('Obaveštenja', 'Notifications')}</span></button>
          <button className={page === 'settings' ? 'on' : ''} onClick={() => goTab('settings')}><span className="i">⚙</span><span>{L('Podešavanja', 'Settings')}</span></button>
        </div>
      )}
    </div>
  )
}
