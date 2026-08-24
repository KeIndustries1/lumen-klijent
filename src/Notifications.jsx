import { useLang } from './lib/i18n'
// Demo lista — nije još povezana na pravi sistem obaveštenja.
// Kad budeš spreman za prave push/SMS podsetnike, ovde ide upit ka bazi
// (npr. tabela 'notifications' po client_id) umesto ovog statičnog niza.
const DEMO = [
  { t: 'Podsetnik na termin', b: 'Vaš termin je sutra u zakazano vreme. Vidimo se!', w: 'pre 2 sata', unread: true },
  { t: 'Termin potvrđen', b: 'Vaša rezervacija je uspešno zabeležena.', w: 'juče', unread: true },
  { t: 'Novo u salonu', b: 'Laminacija obrva sada dostupna i vikendom.', w: 'pre 3 dana', unread: false },
]

export default function Notifications() {
  const { t } = useLang()
  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('notifTitle')}</h2><p>Podsetnici i novosti iz salona</p></div>
      {DEMO.map((n, i) => (
        <div key={i} className={'notif' + (n.unread ? ' unread' : '')}>
          {n.unread && <span className="dot" />}
          <div className="grow">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="name">{n.t}</span>
              <span className="tiny">{n.w}</span>
            </div>
            <div className="tiny" style={{ marginTop: 2 }}>{n.b}</div>
          </div>
        </div>
      ))}
    </div>
  )
}