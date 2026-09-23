import { AtSign, Phone, MapPin, Clock } from 'lucide-react'

const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

// ============================================================
// Glavna (pocetna) stranica salona — ista se koristi kao prvi
// ekran pri otvaranju aplikacije I kao tab "Pocetna" u aplikaciji.
// Gore: slika/gradijent, naziv salona, dugme Rezervisi.
// Ispod: Info kockice (IG, telefon, lokacija) + opis salona.
// ============================================================
export default function Home({ salon, onBook, label = 'Rezerviši', standalone = false }) {
  const igHandle = salon.instagram?.replace('@', '')
  return (
    <div className={standalone ? 'gate' : 'home-page'}>
      <div className={'gate-hero' + (salon.hero_image_url ? ' has-photo' : '')}
        style={salon.hero_image_url ? { '--gate-photo': `url(${salon.hero_image_url})` } : undefined}>
        <div className="gate-eyebrow">SALON</div>
        <div className="gate-name">{salon.name?.toUpperCase().split('').join(' ')}</div>
        <div className="gate-rule" />
        <button className="cta gate-cta" onClick={onBook}>{label}</button>
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
          {salon.opens_min != null && salon.closes_min != null && (
            <div className="info-tile wide">
              <Clock size={16} strokeWidth={1.75} />
              <span>Radno vreme · {hm(salon.opens_min)}–{hm(salon.closes_min)}</span>
            </div>
          )}
        </div>

        {salon.about_sr && (
          <div className="home-about">
            <div className="eyebrow">O nama</div>
            <p>{salon.about_sr}</p>
          </div>
        )}
      </div>
    </div>
  )
}