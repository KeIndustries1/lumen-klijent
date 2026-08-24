import { useLang } from './lib/i18n'

export default function Home({ salon, onBook }) {
  const { t } = useLang()
  return (
    <div className="anim-in">
      <div className="hero">
        <div className="mark">{t('tagline')}</div>
        <h1>{salon.name}</h1>
        <p>{salon.about_sr}</p>
        <button className="cta" onClick={onBook}>{t('book')}</button>
      </div>

      <div className="homedark">
        <div className="eyebrow">{t('contact')}</div>
        <a className="info-dark" href={`tel:${(salon.phone || '').replace(/ /g, '')}`}>
          <span className="ic">☎</span>
          <span className="grow"><span className="tiny">{t('phone')}</span><br/><span className="name">{salon.phone}</span></span>
          <span className="chev">›</span>
        </a>
        {salon.instagram && (
          <a className="info-dark" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <span className="ic">◎</span>
            <span className="grow"><span className="tiny">{t('instagram')}</span><br/><span className="name">{salon.instagram}</span></span>
            <span className="chev">›</span>
          </a>
        )}
        {salon.maps_url && (
          <a className="info-dark" href={salon.maps_url} target="_blank" rel="noopener noreferrer">
            <span className="ic">⌖</span>
            <span className="grow"><span className="tiny">{t('location')}</span><br/><span className="name">{salon.address}</span></span>
            <span className="chev">›</span>
          </a>
        )}
        <div className="info-dark">
          <span className="ic">◷</span>
          <span className="grow"><span className="tiny">{t('hours')}</span><br/><span className="name">{t('hoursValue')}</span></span>
        </div>
      </div>
    </div>
  )
}