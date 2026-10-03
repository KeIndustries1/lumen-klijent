// Nacrtan buket na početnom ekranu (šablon Katalog i porudžbine). Bira se u kreatoru.
import Bouquet from './Bouquet'

export function heroArt(salon) {
  const sh = salon?.shop
  if (salon?.kind !== 'catalog' || !sh?.hero || sh.hero.on === false || !sh.hero.design) return null
  return (
    <div className="gate-art" aria-hidden>
      <Bouquet shop={sh} design={sh.hero.design} size={300} />
      <i />
    </div>
  )
}
