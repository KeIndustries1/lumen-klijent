// Motor šablona "Katalog i porudžbine". ISTI fajl postoji u:
//   kreator/src/shop/engine.js, klijent/src/shop/engine.js, radnik/src/shop/engine.js
// Kad menjaš jedan, kopiraj ga u ostale.
//
// salons.shop (jsonb) = sva podešavanja prodavnice. Porudžbina čuva "design":
//   { pack, packColor, items:[{flower,count,color}], extras:{id:true|'tekst'}, custom:{stepId:vrednost}, wish, inspo }

export const SHOP_VERSION = 1

let seq = 0
export const sid = p => `${p || 'x'}${Date.now().toString(36)}${(seq++).toString(36)}`

// ---------------------------------------------------------------- podrazumevano: cvećara
const C = (id, name, nameEn, hex) => ({ id, name, nameEn, hex, on: true })

export function defaultShop(preset = 'cvecara') {
  const shop = baseShop(preset)
  shop.hero = { on: true, preset: 'h-oblak', design: heroBouquets(shop)[0].design }
  return shop
}

function baseShop(preset) {
  const colors = [
    C('crvena', 'Crvena', 'Red', '#C62839'), C('bordo', 'Bordo', 'Burgundy', '#7A1630'), C('roze', 'Roze', 'Pink', '#EE8FB0'),
    C('puder', 'Puder', 'Blush', '#F5C9D3'), C('bela', 'Bela', 'White', '#F7F3EC'), C('krem', 'Krem', 'Cream', '#EEDCB8'),
    C('lila', 'Lila', 'Lilac', '#B497D6'), C('plava', 'Plava', 'Blue', '#4F78CF'), C('crna', 'Crna', 'Black', '#2A2228'), C('zuta', 'Žuta', 'Yellow', '#F1C94A'),
  ]
  const paperColors = [
    C('beli', 'Beli', 'White', '#FFFFFF'), C('crni', 'Crni', 'Black', '#2A2228'), C('roze', 'Roze', 'Pink', '#F6C3D2'),
    C('krem', 'Krem', 'Cream', '#F0E2C8'), C('kraft', 'Kraft', 'Kraft', '#C69C74'), C('providni', 'Providni', 'Clear', '#F4F4F6'),
  ]
  const boxColors = [
    C('crna', 'Crna', 'Black', '#231D22'), C('bela', 'Bela', 'White', '#F4F1EC'), C('roze', 'Roze', 'Pink', '#E9A3BC'),
    C('bordo', 'Bordo', 'Burgundy', '#6E1A33'), C('krem', 'Krem', 'Cream', '#E8D8B8'),
  ]
  return {
    v: SHOP_VERSION, preset, visual: 'bouquet',
    texts: {
      catalogTitle: 'Katalog', catalogSub: 'Gotovi buketi ili tvoj, po želji',
      makeOwn: 'Napravi svoj buket', makeOwnSub: 'Pakovanje, cveće, boje i detalji', cta: 'Naruči buket',
    },
    colors, paperColors, boxColors,
    flowers: [
      { id: 'ruza', name: 'Ruža', nameEn: 'Rose', price: 250, shape: 'rose', on: true },
      { id: 'lala', name: 'Lala', nameEn: 'Tulip', price: 220, shape: 'tulip', on: true },
      { id: 'bozur', name: 'Božur', nameEn: 'Peony', price: 350, shape: 'peony', on: true },
      { id: 'gerber', name: 'Gerber', nameEn: 'Gerbera', price: 200, shape: 'gerbera', on: true },
    ],
    packs: [
      { id: 'papir', name: 'Buket u papiru', nameEn: 'Wrapped bouquet', kind: 'wrap', price: 0, on: true },
      { id: 'okrugla', name: 'Okrugla kutija', nameEn: 'Round box', kind: 'box-round', price: 800, on: true },
      { id: 'srce', name: 'Kutija srce', nameEn: 'Heart box', kind: 'box-heart', price: 1000, on: true },
      { id: 'kvadratna', name: 'Kvadratna kutija', nameEn: 'Square box', kind: 'box-square', price: 900, on: false },
    ],
    extras: [
      { id: 'masna', name: 'Mašnica', nameEn: 'Bow', price: 150, input: 'none', draw: 'bow', on: true },
      { id: 'sljokice', name: 'Šljokice', nameEn: 'Glitter', price: 200, input: 'none', draw: 'glitter', on: true },
      { id: 'leptirici', name: 'Leptirići', nameEn: 'Butterflies', price: 300, input: 'none', draw: 'butterflies', on: true },
      { id: 'krunica', name: 'Krunica', nameEn: 'Crown', price: 500, input: 'none', draw: 'crown', on: true },
      { id: 'igracka', name: 'Igračka (meda)', nameEn: 'Toy (teddy)', price: 600, input: 'none', draw: 'toy', on: true },
      { id: 'natpis', name: 'Natpis', nameEn: 'Lettering', price: 400, input: 'text', maxLen: 18, draw: 'text', on: true },
      { id: 'slova', name: 'Slova', nameEn: 'Letters', price: 150, input: 'letters', perChar: true, maxLen: 6, draw: 'letters', on: true },
      { id: 'broj', name: 'Broj', nameEn: 'Number', price: 300, input: 'number', maxLen: 3, draw: 'letters', on: true },
    ],
    steps: [
      { id: 'pack', type: 'pack', on: true, title: 'Pakovanje', titleEn: 'Packaging', sub: 'Buket u papiru ili kutija' },
      { id: 'flowers', type: 'flowers', on: true, title: 'Cveće', titleEn: 'Flowers', sub: 'Izaberi jednu ili više vrsta' },
      { id: 'qty', type: 'qty', on: true, title: 'Količina', titleEn: 'Quantity', sub: 'Koliko komada kog cveta' },
      { id: 'colors', type: 'colors', on: true, title: 'Boje cveća', titleEn: 'Flower colors', sub: 'Boja za svaku vrstu' },
      { id: 'packColor', type: 'packColor', on: true, title: 'Boja papira ili kutije', titleEn: 'Paper or box color', sub: '' },
      { id: 'extras', type: 'extras', on: true, title: 'Dodaci', titleEn: 'Extras', sub: 'Detalji po želji' },
      { id: 'wish', type: 'wish', on: true, title: 'Tvoja želja', titleEn: 'Your wish', sub: 'Opiši želju i dodaj sliku inspiracije' },
    ],
    limits: { minFlowers: 1, maxFlowers: 101, qtyPresets: [7, 11, 15, 21, 31, 51, 101] },
    groups: [
      { id: 'buketi', name: 'Najprodavaniji buketi', nameEn: 'Bestsellers', type: 'bouquet', on: true },
      { id: 'privesci', name: 'Privesci', nameEn: 'Keychains', type: 'keychain', on: true },
    ],
    products: [
      { id: 'klasik21', group: 'buketi', name: 'Klasik 21', nameEn: 'Classic 21', desc: '21 crvena ruža u crnom papiru, sa mašnicom', price: null, photo: null, on: true,
        edit: { colors: true, packColor: false, extras: false },
        design: { pack: 'papir', packColor: 'crni', items: [{ flower: 'ruza', count: 21, color: 'crvena' }], extras: { masna: true } } },
      { id: 'plavisan', group: 'buketi', name: 'Plavi san', nameEn: 'Blue dream', desc: '31 ruža u plavoj i beloj, sa leptirićima', price: null, photo: null, on: true,
        edit: { colors: true, packColor: false, extras: false },
        design: { pack: 'papir', packColor: 'beli', items: [{ flower: 'ruza', count: 20, color: 'plava' }, { flower: 'ruza', count: 11, color: 'bela' }], extras: { leptirici: true } } },
      { id: 'srce15', group: 'buketi', name: 'Srce od ruža', nameEn: 'Heart of roses', desc: '15 ruža u kutiji srce', price: null, photo: null, on: true,
        edit: { colors: true, packColor: true, extras: false },
        design: { pack: 'srce', packColor: 'crna', items: [{ flower: 'ruza', count: 15, color: 'roze' }], extras: {} } },
      { id: 'velvet', group: 'buketi', name: 'Black velvet', nameEn: 'Black velvet', desc: '11 crnih ruža u kraft papiru, sa krunicom', price: null, photo: null, on: true,
        edit: { colors: true, packColor: false, extras: false },
        design: { pack: 'papir', packColor: 'kraft', items: [{ flower: 'ruza', count: 11, color: 'crna' }], extras: { krunica: true } } },
      { id: 'minibloom', group: 'privesci', name: 'Mini bloom', nameEn: 'Mini bloom', desc: 'Privezak sa malim buketom', price: 800, photo: null, on: true,
        edit: { colors: true, packColor: true, extras: false },
        design: { pack: 'papir', packColor: 'roze', items: [{ flower: 'ruza', count: 3, color: 'roze' }], extras: {} } },
      { id: 'matching', group: 'privesci', name: 'Matching par', nameEn: 'Matching pair', desc: 'Dva ista priveska, za tebe i nju', price: 1500, photo: null, on: true,
        edit: { colors: true, packColor: true, extras: false },
        design: { pack: 'papir', packColor: 'beli', items: [{ flower: 'ruza', count: 3, color: 'crvena' }], extras: {} } },
    ],
    upsell: { on: true, product: 'minibloom', title: 'Dodaj privezak u istim bojama?', titleEn: 'Add a matching keychain?' },
    order: {
      pickup: { on: true, label: 'Lično preuzimanje', place: 'Beograd' },
      delivery: { on: true, label: 'Slanje BEX-om', sub: 'Svi gradovi u Srbiji', postage: 'Poštarina po cenovniku kurirske službe, plaća se kuriru' },
      leadDays: 7, closedDays: [], maxPerDay: 0,
      depositPct: 50, payHours: 48,
      bank: { name: '', account: '', purpose: 'Avans za porudžbinu' },
      cardMessage: true,
      rules: [
        'Buket se naručuje najmanje nedelju dana unapred.',
        'Plaća se 50% unapred, ostatak pri preuzimanju ili kuriru.',
        'Uplata u roku od 48h, inače se porudžbina ne prihvata.',
        'Ako otkažeš gotov buket, novac se ne vraća.',
      ],
    },
  }
}

// ---------------------------------------------------------------- pomoćne
export const byId = (list, id) => (list || []).find(x => x.id === id)
export const onList = list => (list || []).filter(x => x.on !== false)
export const nm = (x, lang) => (x ? (lang === 'en' && x.nameEn ? x.nameEn : x.name) : '')
export const ttl = (x, lang) => (x ? (lang === 'en' && x.titleEn ? x.titleEn : x.title) : '')
export const din = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' din'
export const packOf = (shop, d) => byId(shop.packs, d?.pack) || onList(shop.packs)[0] || shop.packs?.[0]
export const isBox = pack => String(pack?.kind || '').startsWith('box')
export const packColors = (shop, pack) => onList(isBox(pack) ? shop.boxColors : shop.paperColors)
export const totalCount = d => (d?.items || []).reduce((a, it) => a + (Number(it.count) || 0), 0)

export function newDesign(shop) {
  const pack = onList(shop.packs)[0]
  const f = onList(shop.flowers)[0]
  const c = onList(shop.colors)[0]
  return {
    pack: pack?.id, packColor: packColors(shop, pack)[0]?.id,
    items: f ? [{ flower: f.id, count: 11, color: c?.id }] : [],
    extras: {}, custom: {}, wish: '', inspo: null, card: '',
  }
}
// Galerija gotovih crteža: za početni ekran i kao slika proizvoda kad nema fotografije.
// Uzimaju cveće/boje po id-u, a ako ih prodavnica nema, prve uključene.
function maker(shop) {
  const L = k => onList(shop[k])
  const pick = (k, id, i = 0) => (byId(L(k), id) || L(k)[i % Math.max(1, L(k).length)])?.id
  const packBy = kind => (L('packs').find(p => p.kind === kind) || L('packs')[0])
  const ex = (...draws) => Object.fromEntries(draws.map(dr => onList(shop.extras).find(e => e.draw === dr && e.input === 'none')).filter(Boolean).map(e => [e.id, true]))
  const D = (kind, paper, items, extras) => {
    const pk = packBy(kind)
    const pc = packColors(shop, pk)
    return { pack: pk?.id, packColor: (byId(pc, paper) || pc[0])?.id, items: items.map(([f, fi, n, c, ci]) => ({ flower: pick('flowers', f, fi), count: n, color: pick('colors', c, ci) })), extras, custom: {}, wish: '', inspo: null, card: '' }
  }
  return { D, ex }
}

// 5 velikih buketa za početni ekran (umesto fotografije)
export function heroBouquets(shop) {
  const { D, ex } = maker(shop)
  return [
    { id: 'h-oblak', name: 'Roze oblak', design: D('wrap', 'crni', [['ruza', 0, 18, 'roze', 2], ['ruza', 0, 14, 'puder', 3], ['ruza', 0, 12, 'bela', 4]], ex('glitter', 'bow')) },
    { id: 'h-crveni', name: '51 crvena ruža', design: D('wrap', 'crni', [['ruza', 0, 51, 'crvena', 0]], ex('bow')) },
    { id: 'h-plavi', name: 'Plavo-beli', design: D('wrap', 'beli', [['ruza', 0, 24, 'plava', 7], ['ruza', 0, 16, 'bela', 4]], ex('butterflies', 'glitter')) },
    { id: 'h-srce', name: 'Veliko srce', design: D('box-heart', 'crna', [['ruza', 0, 30, 'crvena', 0], ['ruza', 0, 8, 'bordo', 1]], ex('crown')) },
    { id: 'h-basta', name: 'Prolećna bašta', design: D('wrap', 'kraft', [['bozur', 2, 10, 'roze', 2], ['lala', 1, 12, 'zuta', 9], ['gerber', 3, 10, 'lila', 6], ['ruza', 0, 8, 'bela', 4]], ex('bow', 'butterflies')) },
  ]
}

// 15 buketa za proizvode u katalogu (kad nema fotografije)
export function bouquetGallery(shop) {
  const { D, ex } = maker(shop)
  return [
    { id: 'oblak', name: 'Roze oblak', design: D('wrap', 'crni', [['ruza', 0, 10, 'roze', 2], ['ruza', 0, 8, 'puder', 3], ['ruza', 0, 7, 'bela', 4]], ex('glitter')) },
    { id: 'klasik', name: 'Crveni klasik', design: D('wrap', 'crni', [['ruza', 0, 21, 'crvena', 0]], ex('bow')) },
    { id: 'plavi', name: 'Plavi san', design: D('wrap', 'beli', [['ruza', 0, 14, 'plava', 7], ['ruza', 0, 7, 'bela', 4]], ex('butterflies')) },
    { id: 'srce', name: 'Srce u kutiji', design: D('box-heart', 'crna', [['ruza', 0, 15, 'crvena', 0]], ex('crown')) },
    { id: 'prolece', name: 'Prolećni miks', design: D('wrap', 'kraft', [['lala', 1, 7, 'zuta', 9], ['bozur', 2, 5, 'roze', 2], ['gerber', 3, 5, 'lila', 6]], ex('bow')) },
    { id: 'bordo', name: 'Bordo noć', design: D('wrap', 'crni', [['ruza', 0, 25, 'bordo', 1], ['ruza', 0, 6, 'crna', 8]], ex('glitter')) },
    { id: 'bela', name: 'Bela elegancija', design: D('wrap', 'crni', [['ruza', 0, 19, 'bela', 4]], ex('bow')) },
    { id: 'bozur', name: 'Božuri', design: D('wrap', 'roze', [['bozur', 2, 9, 'roze', 2], ['bozur', 2, 4, 'puder', 3]], ex('bow')) },
    { id: 'lavanda', name: 'Lavanda', design: D('wrap', 'krem', [['ruza', 0, 15, 'lila', 6], ['lala', 1, 6, 'bela', 4]], ex('butterflies')) },
    { id: 'sunce', name: 'Sunce', design: D('wrap', 'kraft', [['gerber', 3, 11, 'zuta', 9], ['lala', 1, 6, 'krem', 5]], ex('bow')) },
    { id: 'kutija-bela', name: 'Bela kutija', design: D('box-round', 'bela', [['ruza', 0, 12, 'puder', 3], ['ruza', 0, 7, 'roze', 2]], {}) },
    { id: 'kutija-crna', name: 'Crna kutija', design: D('box-round', 'crna', [['ruza', 0, 9, 'crvena', 0], ['ruza', 0, 8, 'bela', 4]], ex('crown')) },
    { id: 'srce-roze', name: 'Roze srce', design: D('box-heart', 'roze', [['ruza', 0, 10, 'bela', 4], ['ruza', 0, 5, 'puder', 3]], ex('glitter')) },
    { id: 'meda', name: 'Meda i ruže', design: D('wrap', 'roze', [['ruza', 0, 11, 'crvena', 0]], ex('toy', 'bow')) },
    { id: 'duga', name: 'Duga', design: D('wrap', 'providni', [['lala', 1, 4, 'crvena', 0], ['lala', 1, 4, 'zuta', 9], ['lala', 1, 4, 'plava', 7], ['lala', 1, 4, 'lila', 6], ['lala', 1, 4, 'roze', 2]], ex('bow')) },
  ]
}
export const heroPresets = heroBouquets

export const cloneDesign = d => JSON.parse(JSON.stringify(d || {}))

// Koraci koji se prikazuju (uključeni + uslov "prikaži samo za pakovanja")
export function visibleSteps(shop, d) {
  return (shop.steps || []).filter(s => {
    if (s.on === false) return false
    if (s.type === 'pack' && onList(shop.packs).length < 2) return false
    if (s.type === 'packColor' && !packColors(shop, packOf(shop, d)).length) return false
    if (s.type === 'extras' && !onList(shop.extras).length) return false
    if (s.showIf?.packs?.length && !s.showIf.packs.includes(d?.pack)) return false
    return true
  })
}

// Da li je korak popunjen (za dugme Dalje)
export function stepError(shop, step, d, lang) {
  const en = lang === 'en'
  if (step.type === 'flowers' && !(d.items || []).length) return en ? 'Pick at least one flower' : 'Izaberi bar jedno cveće'
  if (step.type === 'qty') {
    const n = totalCount(d), L = shop.limits || {}
    if ((d.items || []).some(it => !(it.count > 0))) return en ? 'Every flower needs a quantity' : 'Svako cveće mora da ima količinu'
    if (L.minFlowers && n < L.minFlowers) return (en ? 'At least ' : 'Najmanje ') + L.minFlowers
    if (L.maxFlowers && n > L.maxFlowers) return (en ? 'At most ' : 'Najviše ') + L.maxFlowers
  }
  if (step.type === 'single' && step.required && !d.custom?.[step.id]) return en ? 'Choose an option' : 'Izaberi opciju'
  if (step.type === 'text' && step.required && !String(d.custom?.[step.id] || '').trim()) return en ? 'Fill this in' : 'Popuni polje'
  return ''
}

// ---------------------------------------------------------------- cena
const picked = v => v !== undefined && v !== null && v !== false
export function extraPrice(e, v) {
  if (!picked(v)) return 0
  if (e.perChar) return (Number(e.price) || 0) * String(typeof v === 'string' ? v : '').replace(/\s/g, '').length
  return Number(e.price) || 0
}
export function designPrice(shop, d) {
  let t = 0
  for (const it of d.items || []) t += (Number(byId(shop.flowers, it.flower)?.price) || 0) * (Number(it.count) || 0)
  t += Number(packOf(shop, d)?.price) || 0
  for (const e of onList(shop.extras)) t += extraPrice(e, d.extras?.[e.id])
  for (const s of shop.steps || []) {
    if (s.on === false) continue
    const v = d.custom?.[s.id]
    if (s.type === 'single') t += Number(byId(s.options, v)?.price) || 0
    if (s.type === 'multi') for (const id of v || []) t += Number(byId(s.options, id)?.price) || 0
    if (s.type === 'text' && v) t += Number(s.price) || 0
  }
  return t
}
// Gotov proizvod: fiksna cena ako je upisana (+ doplata za dodatke koje je kupac dodao), inače izračunata iz sastava
export function productPrice(shop, p, d) {
  const des = d || p?.design
  if (p?.price == null || p.price === '') return designPrice(shop, des)
  return Number(p.price) + Math.max(0, designPrice(shop, des) - designPrice(shop, p.design))
}

// ---------------------------------------------------------------- opis porudžbine
export function lines(shop, d, lang) {
  const en = lang === 'en', out = []
  const pack = packOf(shop, d)
  if (pack) out.push({ label: en ? 'Packaging' : 'Pakovanje', value: nm(pack, lang) })
  for (const it of d.items || []) {
    const f = byId(shop.flowers, it.flower), c = byId(shop.colors, it.color)
    out.push({ label: nm(f, lang) || '?', value: `${it.count} × ${nm(c, lang).toLowerCase()}`, hex: c?.hex })
  }
  const pc = byId(isBox(pack) ? shop.boxColors : shop.paperColors, d.packColor)
  if (pc) out.push({ label: isBox(pack) ? (en ? 'Box color' : 'Boja kutije') : (en ? 'Paper color' : 'Boja papira'), value: nm(pc, lang), hex: pc.hex })
  for (const e of onList(shop.extras)) {
    const v = d.extras?.[e.id]
    if (!picked(v)) continue
    out.push({ label: nm(e, lang), value: typeof v === 'string' ? (v ? `„${v}“` : '—') : (en ? 'yes' : 'da') })
  }
  for (const s of shop.steps || []) {
    if (s.on === false || !['single', 'multi', 'text'].includes(s.type)) continue
    const v = d.custom?.[s.id]
    if (!v || (Array.isArray(v) && !v.length)) continue
    const val = s.type === 'single' ? nm(byId(s.options, v), lang) : s.type === 'multi' ? v.map(id => nm(byId(s.options, id), lang)).join(', ') : `„${v}“`
    out.push({ label: ttl(s, lang), value: val })
  }
  if (d.wish) out.push({ label: en ? 'Wish' : 'Želja', value: d.wish })
  return out
}
export function summary(shop, d, lang) {
  const parts = (d.items || []).map(it => `${it.count} × ${nm(byId(shop.flowers, it.flower), lang).toLowerCase()} ${nm(byId(shop.colors, it.color), lang).toLowerCase()}`)
  const pack = packOf(shop, d)
  return [parts.join(' + '), nm(pack, lang).toLowerCase()].filter(Boolean).join(' · ')
}

// Privezak u istim bojama kao buket
export function matchingDesign(shop, d, keychain) {
  const base = cloneDesign(keychain?.design || newDesign(shop))
  const first = (d.items || [])[0]
  base.items = [{ flower: first?.flower || base.items[0]?.flower, count: base.items[0]?.count || 3, color: first?.color || base.items[0]?.color }]
  if (!isBox(packOf(shop, d)) && d.packColor) base.packColor = d.packColor
  base.extras = {}
  return base
}

// Najranije datumi za porudžbinu (preskače zatvorene dane u nedelji)
export function orderDates(shop, n = 10, from = new Date()) {
  const o = shop.order || {}, out = []
  const d = new Date(from); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + (Number(o.leadDays) || 0))
  for (let i = 0; out.length < n && i < 60; i++) {
    if (!(o.closedDays || []).includes(d.getDay())) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
export const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
export const deposit = (shop, total) => Math.ceil((total * (Number(shop.order?.depositPct) || 0)) / 100 / 10) * 10

// ---------------------------------------------------------------- crtež buketa (prostor 300×300)
function rgb(h) { h = String(h || '#888').replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0) }
export function mix(h, t, k) { const a = rgb(h), b = rgb(t); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})` }

function headBg(shape, col) {
  const L = mix(col, '#FFFFFF', 0.38), D = mix(col, '#000000', 0.32), B = col
  if (shape === 'tulip') return { bg: `linear-gradient(180deg,${L},${B} 55%,${D})`, rad: '46% 46% 50% 50% / 58% 58% 42% 42%', w: 0.82 }
  if (shape === 'peony') return { bg: `radial-gradient(circle at 50% 44%,${L} 0 16%,${B} 28%,${L} 40%,${B} 56%,${D} 100%)`, rad: '50%', w: 1 }
  if (shape === 'gerbera') return { bg: `radial-gradient(circle,#5B3A1E 0 15%,#8A5A2B 16% 20%,${B} 21% 58%,${L} 62% 70%,${B} 74%,${D} 100%)`, rad: '50%', w: 1 }
  return { bg: `radial-gradient(circle at 48% 46%,${D} 0 7%,${B} 8% 19%,${D} 20% 23%,${B} 24% 39%,${D} 40% 43%,${L} 46% 68%,${B} 82%,${D} 100%)`, rad: '50%', w: 1 }
}

// Vraća sve što React komponenta treba da nacrta: glave cvetova, pakovanje i dodatke
export function drawing(shop, d, { keychain = false } = {}) {
  const pack = packOf(shop, d) || { kind: 'wrap' }
  const kind = keychain ? 'wrap' : pack.kind
  const pcList = isBox(pack) && !keychain ? shop.boxColors : shop.paperColors
  const pc = byId(pcList, d.packColor) || pcList?.[0] || { hex: '#FFFFFF' }
  const items = (d.items || []).filter(it => it.count > 0)
  const total = items.reduce((a, it) => a + it.count, 0) || 1
  const cap = keychain ? 7 : 37
  const shown = Math.max(1, Math.min(total, cap))
  // koliko glava dobija svaka vrsta, pa izmešano
  const seqArr = []
  items.forEach((it, ix) => { const k = Math.max(1, Math.round((it.count / total) * shown)); for (let j = 0; j < k; j++) seqArr.push(ix) })
  while (seqArr.length > shown) seqArr.pop()
  for (let j = 0; j < seqArr.length; j++) { const k = (j * 7 + 3) % seqArr.length; [seqArr[j], seqArr[k]] = [seqArr[k], seqArr[j]] }
  const box = kind !== 'wrap'
  const R = keychain ? 44 : box ? 86 : 84
  const cx = 150, cy = keychain ? 132 : box ? 138 : 118
  let size = Math.max(keychain ? 26 : 24, Math.min(keychain ? 46 : 76, (2 * R / Math.sqrt(shown)) * 0.98))
  const heads = []
  for (let i = 0; i < seqArr.length; i++) {
    const it = items[seqArr[i]]
    const f = byId(shop.flowers, it?.flower) || { shape: 'rose' }
    const col = byId(shop.colors, it?.color)?.hex || '#C62839'
    const s = f.shape === 'peony' ? Math.min(86, size * 1.1) : size
    const rr = seqArr.length === 1 ? 0 : (R - s / 2) * Math.sqrt((i + 0.5) / seqArr.length), a = i * 2.39996
    const hb = headBg(f.shape, col)
    const w = s * hb.w
    heads.push({ x: cx + rr * Math.cos(a) - w / 2, y: cy + rr * Math.sin(a) * (box ? 1 : 0.9) - s / 2, w, h: s, bg: hb.bg, rad: hb.rad })
  }
  heads.sort((p, q) => p.y - q.y)
  const ex = keychain ? {} : (d.extras || {})
  const drawOf = kindName => onList(shop.extras).filter(e => e.draw === kindName && picked(ex[e.id]))
  const textE = drawOf('text')[0]
  const letterE = drawOf('letters').map(e => ex[e.id]).filter(v => typeof v === 'string' && v.trim())
  const glitter = []
  if (drawOf('glitter').length) for (let k = 0; k < 18; k++) {
    const gr = (R - 8) * Math.sqrt((k + 0.5) / 18), ga = k * 2.4 + 0.7
    glitter.push({ x: cx + gr * Math.cos(ga) - 2.5, y: cy + gr * Math.sin(ga) * 0.9 - 2.5, c: k % 2 ? '#FFF6D6' : '#F2CF6B' })
  }
  const dark = ['crni', 'crna', 'kraft', 'bordo'].includes(pc.id)
  return {
    kind, keychain, heads, glitter,
    paper: pc.hex, paperDark: mix(pc.hex, '#000000', 0.12), paperEdge: mix(pc.hex, '#000000', 0.3),
    bow: drawOf('bow').length ? (pc.id === 'crni' || pc.id === 'crna' ? '#E9A3BC' : '#B0306A') : null,
    crown: drawOf('crown').length > 0, butterflies: drawOf('butterflies').length > 0, toy: drawOf('toy').length > 0,
    text: textE && typeof ex[textE.id] === 'string' ? ex[textE.id] : '', textColor: dark ? '#FFFFFF' : '#7A1F48',
    letters: letterE.join(' '),
  }
}
