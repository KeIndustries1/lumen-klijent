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
// papir sa šarom: two = dvostrani, border = rub, dots = sitan print (voće), spots = fleke (kravlji)
const P = (id, name, nameEn, pattern, hex, hex2) => ({ id, name, nameEn, hex, hex2, pattern, on: true })

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
    P('roze-plavi', 'Dvostrani roze-plavi', 'Two-sided pink-blue', 'two', '#F6C3D2', '#9CC3EE'),
    P('beli-zlatni', 'Beli sa zlatnim rubom', 'White with gold edge', 'border', '#FFFFFF', '#D9A93A'),
    P('jagode', 'Print jagode', 'Strawberry print', 'dots', '#FFF4F4', '#D8314A'),
    P('kravlji', 'Kravlji print', 'Cow print', 'spots', '#FFFFFF', '#2A2228'),
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
      { id: 'suncokret', name: 'Suncokret', nameEn: 'Sunflower', price: 250, shape: 'sunflower', colors: ['zuta'], on: true },
      { id: 'dalija', name: 'Dalija', nameEn: 'Dahlia', price: 300, shape: 'dahlia', on: true },
      { id: 'hibiskus', name: 'Hibiskus', nameEn: 'Hibiscus', price: 200, shape: 'hibiscus', on: true },
      { id: 'plumerija', name: 'Plumerija', nameEn: 'Plumeria', price: 150, shape: 'plumeria', on: true },
    ],
    packs: [
      { id: 'papir', name: 'Buket u papiru', nameEn: 'Wrapped bouquet', kind: 'wrap', price: 0, on: true },
      { id: 'okrugla', name: 'Okrugla kutija', nameEn: 'Round box', kind: 'box-round', price: 0, on: true },
      { id: 'srce', name: 'Kutija srce', nameEn: 'Heart box', kind: 'box-heart', price: 0, on: true },
      { id: 'kvadratna', name: 'Kvadratna kutija', nameEn: 'Square box', kind: 'box-square', price: 0, on: true },
    ],
    extras: [
      { id: 'kruna-m', name: 'Mala kruna', nameEn: 'Small crown', price: 200, input: 'none', draw: 'crown', size: 's', on: true },
      { id: 'kruna-s', name: 'Srednja kruna', nameEn: 'Medium crown', price: 300, input: 'none', draw: 'crown', size: 'm', on: true },
      { id: 'kruna-v', name: 'Velika kruna', nameEn: 'Large crown', price: 500, input: 'none', draw: 'crown', size: 'l', on: true },
      { id: 'leptir', name: 'Leptirić', nameEn: 'Butterfly', price: 20, input: 'qty', max: 20, draw: 'butterflies', on: true },
      { id: 'tresnja', name: 'Trešnja', nameEn: 'Cherry', price: 50, input: 'qty', max: 20, draw: 'cherry', on: true },
      { id: 'masna', name: 'Mašnica', nameEn: 'Bow', price: 10, input: 'none', draw: 'bow', on: true },
      { id: 'natpis', name: 'Natpis ili broj', nameEn: 'Lettering or number', price: 200, input: 'text', maxLen: 18, draw: 'text', on: true },
      { id: 'meda', name: 'Meda sa kapicom', nameEn: 'Graduation teddy', price: 300, input: 'none', draw: 'toy-cap', on: true },
      { id: 'sljokice', name: 'Šljokice', nameEn: 'Glitter', price: 10, perFlower: true, input: 'none', draw: 'glitter', on: true },
      { id: 'igracka', name: 'Plišana igračka', nameEn: 'Plush toy', price: 550, input: 'none', draw: 'toy', on: true },
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
    limits: { minFlowers: 9, maxFlowers: 101, qtyPresets: [9, 11, 15, 21, 31, 51, 101] },
    groups: [
      { id: 'buketi', name: 'Najprodavaniji buketi', nameEn: 'Bestsellers', type: 'bouquet', on: true },
      { id: 'privesci', name: 'Privesci', nameEn: 'Keychains', type: 'keychain', on: true },
    ],
    products: [
      { id: 'klasik21', group: 'buketi', name: 'Klasik 21', nameEn: 'Classic 21', desc: '21 crvena ruža u crnom papiru, sa mašnicom', price: null, photo: null, on: true,
        edit: { colors: true, count: true, packColor: true, extras: true },
        design: { pack: 'papir', packColor: 'crni', items: [{ flower: 'ruza', count: 21, color: 'crvena' }], extras: { masna: true } } },
      { id: 'plavisan', group: 'buketi', name: 'Plavi san', nameEn: 'Blue dream', desc: '31 ruža u plavoj i beloj, sa leptirićima', price: null, photo: null, on: true,
        edit: { colors: true, count: true, packColor: true, extras: true },
        design: { pack: 'papir', packColor: 'beli', items: [{ flower: 'ruza', count: 20, color: 'plava' }, { flower: 'ruza', count: 11, color: 'bela' }], extras: { leptir: 4 } } },
      { id: 'srce15', group: 'buketi', name: 'Srce od ruža', nameEn: 'Heart of roses', desc: '15 ruža u kutiji srce', price: null, photo: null, on: true,
        edit: { colors: true, count: true, packColor: true, extras: true },
        design: { pack: 'srce', packColor: 'crna', items: [{ flower: 'ruza', count: 15, color: 'roze' }], extras: {} } },
      { id: 'velvet', group: 'buketi', name: 'Black velvet', nameEn: 'Black velvet', desc: '11 crnih ruža u kraft papiru, sa krunicom', price: null, photo: null, on: true,
        edit: { colors: true, count: true, packColor: true, extras: true },
        design: { pack: 'papir', packColor: 'kraft', items: [{ flower: 'ruza', count: 11, color: 'crna' }], extras: { 'kruna-s': true } } },
      { id: 'minibloom', group: 'privesci', name: 'Mini bloom', nameEn: 'Mini bloom', desc: 'Privezak sa malim buketom', price: 800, photo: null, on: true,
        edit: { colors: true, packColor: true, extras: false },
        design: { pack: 'papir', packColor: 'roze', items: [{ flower: 'ruza', count: 3, color: 'roze' }], extras: {} } },
      { id: 'matching', group: 'privesci', name: 'Matching par', nameEn: 'Matching pair', desc: 'Dva ista priveska, za tebe i nju', price: 1500, photo: null, on: true,
        edit: { colors: true, packColor: true, extras: false },
        design: { pack: 'papir', packColor: 'beli', items: [{ flower: 'ruza', count: 3, color: 'crvena' }], extras: {} } },
    ],
    upsell: { on: true, product: 'minibloom', title: 'Dodaj privezak u istim bojama?', titleEn: 'Add a matching keychain?' },
    order: {
      pickup: { on: true, label: 'Lično preuzimanje', place: 'Beograd', timeMode: 'parts', slotMin: 60,
        parts: ['Prepodne (9–12h)', 'Popodne (12–17h)', 'Uveče (17–21h)'], partsNote: 'Tačno vreme dogovaramo porukom.' },
      delivery: { on: true, label: 'Slanje BEX-om', sub: 'Svi gradovi u Srbiji', postage: 'Cenu poštarine određuje kurirska služba prema težini paketa, plaća se kuriru.' },
      leadDays: 5, leadRules: [{ over: 50, days: 10 }], closedDays: [], offDates: [], maxPerDay: 0,
      depositPct: 50, payHours: 48, autoCancel: true, contactEmail: '',
      bank: { name: '', account: '', purpose: 'Avans za porudžbinu' },
      cardMessage: true,
      rules: [
        'Buket se naručuje najmanje 5 dana unapred, a buket veći od 50 cvetova najmanje 10 dana unapred.',
        'Plaća se 50% unapred na račun, ostatak pri preuzimanju ili kuriru.',
        'Uplata u roku od 48h, inače se porudžbina sama otkazuje.',
        'Porudžbinu možeš sam da otkažeš dok ne uplatiš. Posle uplate javi se na mejl ili Instagram.',
      ],
    },
  }
}

// ---------------------------------------------------------------- pomoćne
const picked = v => v !== undefined && v !== null && v !== false && v !== 0
export const byId = (list, id) => (list || []).find(x => x.id === id)
export const onList = list => (list || []).filter(x => x.on !== false)
export const nm = (x, lang) => (x ? (lang === 'en' && x.nameEn ? x.nameEn : x.name) : '')
export const ttl = (x, lang) => (x ? (lang === 'en' && x.titleEn ? x.titleEn : x.title) : '')
export const din = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' din'
export const packOf = (shop, d) => byId(shop.packs, d?.pack) || onList(shop.packs)[0] || shop.packs?.[0]
export const isBox = pack => String(pack?.kind || '').startsWith('box')
// Boje koje ima određeni cvet (ako je u kreatoru suženo, npr. suncokret samo žut)
export function flowerColors(shop, flowerId) {
  const all = onList(shop.colors), f = byId(shop.flowers, flowerId)
  const allowed = Array.isArray(f?.colors) && f.colors.length ? all.filter(c => f.colors.includes(c.id)) : all
  return allowed.length ? allowed : all
}
// CSS pozadina za papir (jednobojan ili sa šarom) — za uzorak boje i za crtež
export function paperBg(c, small = false) {
  if (!c) return '#FFFFFF'
  const a = c.hex || '#FFFFFF', b = c.hex2 || '#000000'
  const k = small ? 0.5 : 1
  if (c.pattern === 'two') return `linear-gradient(135deg,${a} 0 50%,${b} 50% 100%)`
  if (c.pattern === 'border') return small ? `radial-gradient(circle,${a} 0 52%,${b} 56%)` : a
  if (c.pattern === 'dots') return `radial-gradient(circle,${b} 0 ${2.2 * k}px,transparent ${2.6 * k}px) 0 0/${12 * k}px ${12 * k}px,radial-gradient(circle,${b} 0 ${2.2 * k}px,transparent ${2.6 * k}px) ${6 * k}px ${6 * k}px/${12 * k}px ${12 * k}px,${a}`
  if (c.pattern === 'spots') return `radial-gradient(ellipse ${9 * k}px ${6 * k}px at 30% 30%,${b} 98%,transparent) 0 0/${30 * k}px ${26 * k}px,radial-gradient(ellipse ${6 * k}px ${8 * k}px at 70% 75%,${b} 98%,transparent) 0 0/${30 * k}px ${26 * k}px,${a}`
  return a
}
export const extraQty = v => (typeof v === 'number' ? v : picked(v) ? 1 : 0)
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
  const ex = (...draws) => Object.fromEntries(draws.map(dr => onList(shop.extras).find(e => e.draw === dr && (e.input === 'none' || e.input === 'qty'))).filter(Boolean).map(e => [e.id, e.input === 'qty' ? 3 : true]))
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

// Slike proizvoda (do 3). Stari zapis ima samo photo.
export const photosOf = p => (Array.isArray(p?.photos) && p.photos.length ? p.photos : p?.photo ? [p.photo] : []).filter(Boolean)

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
export function extraPrice(e, v, d) {
  if (!picked(v)) return 0
  const pr = Number(e.price) || 0
  if (e.perChar) return pr * String(typeof v === 'string' ? v : '').replace(/\s/g, '').length
  if (e.input === 'qty') return pr * extraQty(v)
  if (e.perFlower) return pr * totalCount(d)
  return pr
}
export function designPrice(shop, d) {
  let t = 0
  for (const it of d.items || []) t += (Number(byId(shop.flowers, it.flower)?.price) || 0) * (Number(it.count) || 0)
  t += Number(packOf(shop, d)?.price) || 0
  for (const e of onList(shop.extras)) t += extraPrice(e, d.extras?.[e.id], d)
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
    out.push({ label: nm(e, lang), value: typeof v === 'string' ? (v ? `„${v}“` : '—') : typeof v === 'number' ? `${v} ${en ? 'pcs' : 'kom'}` : (en ? 'yes' : 'da') })
  }
  for (const [k, v] of Object.entries(d.opts || {})) if (v) out.push({ label: k, value: v })
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

// Šta kupac bira za lično preuzimanje: 'parts' = doba dana (tačno vreme dogovor), 'hours' = termini iz radnog vremena, 'none' = ništa
export const pickupMode = shop => {
  const p = shop.order?.pickup || {}
  return p.timeMode || (p.time === false ? 'none' : 'hours')
}
export function pickupChoices(shop, hours, date) {
  const m = pickupMode(shop)
  if (m === 'parts') return (shop.order?.pickup?.parts || []).map(x => String(x).trim()).filter(Boolean)
  if (m === 'hours') return pickupSlots(shop, hours, date)
  return []
}
// Termini za lično preuzimanje: iz radnog vremena biznisa (salons.hours) za taj dan
export function pickupSlots(shop, hours, date) {
  const step = Number(shop.order?.pickup?.slotMin) || 60
  const day = (hours || []).find(h => h.d === date.getDay())
  const o = day ? (day.off ? null : day.o) : 600, c = day ? (day.off ? null : day.c) : 1140
  if (o == null || !(c > o)) return []
  const out = []
  for (let m = o; m + Math.min(step, 60) <= c; m += step) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  return out
}

// Najranije datumi za porudžbinu (preskače zatvorene dane u nedelji)
// Najraniji rok: osnovni, ili duži za veće bukete (npr. preko 50 cvetova → 10 dana)
export function leadFor(shop, flowers = 0) {
  const o = shop.order || {}
  let days = Number(o.leadDays) || 0
  for (const r of o.leadRules || []) if (flowers > (Number(r.over) || 0)) days = Math.max(days, Number(r.days) || 0)
  return days
}
export function orderDates(shop, n = 10, from = new Date(), flowers = 0) {
  const o = shop.order || {}, out = []
  const off = new Set(o.offDates || [])
  const d = new Date(from); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + leadFor(shop, flowers))
  for (let i = 0; out.length < n && i < 120; i++) {
    if (!(o.closedDays || []).includes(d.getDay()) && !off.has(iso(d))) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
export const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
export const deposit = (shop, total) => Math.ceil((total * (Number(shop.order?.depositPct) || 0)) / 100 / 10) * 10

// ---------------------------------------------------------------- crtež buketa (prostor 300×300)
function rgb(h) { h = String(h || '#888').replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0) }
export function mix(h, t, k) { const a = rgb(h), b = rgb(t); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})` }

const isDark = hex => { const h = String(hex || '').replace('#', ''); if (h.length !== 6) return false; const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); return (r * 299 + g * 587 + b * 114) / 1000 < 90 }
function headBg(shape, col) {
  const L = mix(col, '#FFFFFF', 0.38), D = mix(col, '#000000', 0.32), B = col
  if (shape === 'tulip') return { bg: `linear-gradient(180deg,${L},${B} 55%,${D})`, rad: '46% 46% 50% 50% / 58% 58% 42% 42%', w: 0.82 }
  if (shape === 'peony') return { bg: `radial-gradient(circle at 50% 44%,${L} 0 16%,${B} 28%,${L} 40%,${B} 56%,${D} 100%)`, rad: '50%', w: 1 }
  if (shape === 'dahlia') return { bg: `radial-gradient(circle,${D} 0 7%,${L} 9% 14%,transparent 15%),radial-gradient(circle,transparent 30%,rgba(0,0,0,.22) 100%),repeating-conic-gradient(from 0deg,${L} 0 7deg,${B} 7deg 13deg,${D} 13deg 15deg)`, rad: '50%', w: 1 }
  if (shape === 'hibiscus') return { bg: `radial-gradient(circle,#F7E07A 0 5%,${D} 6% 18%,transparent 34%),repeating-conic-gradient(from 18deg,${L} 0 22deg,${B} 22deg 58deg,${D} 58deg 72deg)`, rad: '46% 54% 50% 50%', w: 1.04 }
  if (shape === 'plumeria') return { bg: `radial-gradient(circle,#F6C945 0 12%,rgba(246,201,69,.55) 22%,transparent 34%),repeating-conic-gradient(from 10deg,${B} 0 46deg,${L} 46deg 66deg,${D} 66deg 72deg)`, rad: '50%', w: 1 }
  if (shape === 'sunflower') return { bg: `radial-gradient(circle,#3B2414 0 23%,#6B4423 24% 30%,transparent 31%),repeating-conic-gradient(from 4deg,${B} 0 10deg,${L} 10deg 15deg,${D} 15deg 18deg)`, rad: '50%', w: 1 }
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
  const dark = ['crni', 'crna', 'kraft', 'bordo'].includes(pc.id) || isDark(pc.hex)
  const crownE = drawOf('crown').sort((a, b) => 'sml'.indexOf(b.size || 'm') - 'sml'.indexOf(a.size || 'm'))[0]
  const nOf = kindName => drawOf(kindName).reduce((a, e) => a + extraQty(ex[e.id]), 0)
  return {
    kind, keychain, heads, glitter,
    paper: pc.hex, paperBg: paperBg(pc), rim: pc.pattern === 'border' ? pc.hex2 : null, paperDark: mix(pc.hex, '#000000', 0.12), paperEdge: mix(pc.hex2 && pc.pattern === 'border' ? pc.hex2 : pc.hex, '#000000', 0.3),
    bow: drawOf('bow').length ? (dark ? '#E9A3BC' : '#B0306A') : null,
    crown: !!crownE, crownSize: crownE?.size || 'm', butterflies: Math.min(6, nOf('butterflies')), cherries: Math.min(8, nOf('cherry')),
    toy: drawOf('toy').length > 0, toyCap: drawOf('toy-cap').length > 0,
    text: textE && typeof ex[textE.id] === 'string' ? ex[textE.id] : '', textColor: dark ? '#FFFFFF' : '#7A1F48',
    letters: letterE.join(' '),
  }
}
