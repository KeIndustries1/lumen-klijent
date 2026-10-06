import { useState } from 'react'
import { AtSign, Phone, MapPin, Clock } from 'lucide-react'

const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

// Slova razmaknuta, a reči jasno odvojene: "K U M B A R B E R"
const spaced = s => String(s || '').toUpperCase().trim().split(/\s+/).map(w => w.split('').join(' ')).join('\u2003')

// salons.hours = [{ d: 1, off: false, o: 540, c: 960 }, ...] (d: 0=ned … 6=sub)
// → ["Pon–Pet 09:00–16:00", "Sub 09:00–17:00", "Ned ne radi"]
const DAY = { 1: 'Pon', 2: 'Uto', 3: 'Sre', 4: 'Čet', 5: 'Pet', 6: 'Sub', 0: 'Ned' }
function hoursLines(hours) {
  const order = [1, 2, 3, 4, 5, 6, 0]
  const by = Object.fromEntries((hours || []).map(h => [h.d, h]))
  const val = d => (!by[d] || by[d].off) ? 'ne radi' : `${hm(by[d].o)}–${hm(by[d].c)}`
  const out = []
  for (let i = 0; i < order.length;) {
    let j = i
    while (j + 1 < order.length && val(order[j + 1]) === val(order[i])) j++
    out.push(`${DAY[order[i]]}${j > i ? '–' + DAY[order[j]] : ''} ${val(order[i])}`)
    i = j + 1
  }
  return out
}

// ============================================================
// Glavna (pocetna) stranica salona — ista se koristi kao prvi
// ekran pri otvaranju aplikacije I kao tab "Pocetna" u aplikaciji.
// Gore: slika/gradijent, naziv salona, dugme Rezervisi.
// Ispod: Info kockice (IG, telefon, lokacija) + opis salona.
// ============================================================
// "O nama": duži tekst se skraćuje na početak, uz "Pročitaj celu priču"
function About({ text }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 420
  const short = long ? text.slice(0, text.lastIndexOf(' ', 380)).trim() + '…' : text
  return (
    <div className="home-about">
      <div className="eyebrow">O nama</div>
      <p style={{ whiteSpace: 'pre-line' }}>{open || !long ? text : short}</p>
      {long && <button className="about-more" onClick={() => setOpen(o => !o)}>{open ? 'Prikaži manje' : 'Pročitaj celu priču'}</button>}
    </div>
  )
}

export default function Home({ salon, onBook, label = 'Rezerviši', standalone = false, art = null }) {
  const igHandle = salon.instagram?.replace('@', '')
  // natpis iznad imena: null = 'SALON' (kao ranije), '' = bez natpisa
  const eyebrow = salon.label == null ? 'SALON' : salon.label
  return (
    <div className={standalone ? 'gate' : 'home-page'}>
      <div className={'gate-hero' + (art ? ' has-art' : salon.hero_image_url ? ' has-photo' : '')}
        style={!art && salon.hero_image_url ? { '--gate-photo': `url(${salon.hero_image_url})` } : undefined}>
        {art}
        {eyebrow && <div className="gate-eyebrow">{eyebrow}</div>}
        <div className="gate-name">{spaced(salon.name)}</div>
        <div className="gate-rule" />
        <button className="cta gate-cta" onClick={onBook}>{salon.texts?.sr?.cta || label}</button>
      </div>

      <div className="homedark">
        <div className="eyebrow">Info</div>
        <div className="info-grid">
          {salon.instagram && (
            <a className="info-tile" href={`https://instagram.com/${igHandle}`} target="_blank" rel="noreferrer">
              <AtSign size={16} strokeWidth={1.75} />
              <span>{salon.instagram}</span>
            </a>
          )}
          {salon.phone && (
            <a className="info-tile" href={`tel:${salon.phone.replace(/\s/g, '')}`}>
              <Phone size={16} strokeWidth={1.75} />
              <span>{salon.phone}</span>
            </a>
          )}
          {salon.address && (
            <a className="info-tile wide" href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`} target="_blank" rel="noreferrer">
              <MapPin size={16} strokeWidth={1.75} />
              <span>{salon.address}</span>
            </a>
          )}
          {Array.isArray(salon.hours) && salon.hours.length ? (
            <div className="info-tile wide">
              <Clock size={16} strokeWidth={1.75} />
              <span className="hours-lines">{hoursLines(salon.hours).map(l => <span key={l}>{l}</span>)}</span>
            </div>
          ) : salon.opens_min != null && salon.closes_min != null && (
            <div className="info-tile wide">
              <Clock size={16} strokeWidth={1.75} />
              <span>Radno vreme · {hm(salon.opens_min)}–{hm(salon.closes_min)}</span>
            </div>
          )}
        </div>

        {salon.about_sr && <About text={salon.about_sr} />}
      </div>
    </div>
  )
}