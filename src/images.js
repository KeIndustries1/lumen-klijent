// Kategorije usluga: boja + ikonica umesto fotografija.
// Radnik ima kolonu `category` (npr. 'barber', 'pets'); stari radnici
// bez nje dobijaju kategoriju po ulozi (role_sr), kao ranije.
import { Scissors, Hand, Sparkles, Eye, Flower2, PawPrint, PenTool, Dumbbell, HeartPulse, Brush, Star } from 'lucide-react'

export const CATEGORY = {
  hair:    { Icon: Scissors,   from: '#8A2F47', to: '#5C1F32', label: 'Kosa' },
  barber:  { Icon: Scissors,   from: '#3E4654', to: '#1F242C', label: 'Berbernica' },
  nails:   { Icon: Hand,       from: '#7A3F63', to: '#4E2740', label: 'Nokti' },
  face:    { Icon: Sparkles,   from: '#3F5B4E', to: '#28392F', label: 'Nega lica' },
  lashes:  { Icon: Eye,        from: '#6B4A2E', to: '#42301F', label: 'Trepavice i obrve' },
  makeup:  { Icon: Brush,      from: '#7A4A5A', to: '#4E2F3A', label: 'Šminka' },
  massage: { Icon: Flower2,    from: '#2F5B5A', to: '#1C3A3A', label: 'Masaža i spa' },
  pets:    { Icon: PawPrint,   from: '#5B6B2F', to: '#384220', label: 'Ljubimci' },
  tattoo:  { Icon: PenTool,    from: '#3B2F5C', to: '#241C3A', label: 'Tetovaže' },
  fitness: { Icon: Dumbbell,   from: '#2F4A6B', to: '#1E3048', label: 'Trening' },
  health:  { Icon: HeartPulse, from: '#6B2F3A', to: '#421D24', label: 'Zdravlje' },
  generic: { Icon: Star,       from: '#4A4458', to: '#2C2836', label: 'Ostalo' },
}
export const ROLE_CATEGORY = {
  'Frizer i kolorista':  'hair',
  'Manikir i pedikir':   'nails',
  'Kozmetičar':          'face',
  'Trepavice i obrve':   'lashes',
}
// catFor(radnik) ili catFor('Frizer i kolorista')
export function catFor(w) {
  const key = typeof w === 'string' ? ROLE_CATEGORY[w] : (w?.category || ROLE_CATEGORY[w?.role_sr])
  return CATEGORY[key] || CATEGORY[typeof w === 'string' ? 'hair' : 'generic']
}

// Izgled pločice usluge (bez fotografije), po izboru salona (salons.tile_style):
//  'category' boja kategorije + ikonica · 'accent' boja salona + ikonica · 'monogram' boja salona + prvo slovo
const ACCENT_BG = 'linear-gradient(150deg, color-mix(in srgb, var(--rouge) 78%, #000), color-mix(in srgb, var(--rouge) 36%, #000))'
export function tileFor(salon, c, name) {
  const style = salon?.tile_style || 'category'
  if (style === 'monogram') return { background: ACCENT_BG, letter: (String(name || '').trim()[0] || '•').toUpperCase() }
  if (style === 'accent') return { background: ACCENT_BG, letter: null }
  return { background: `linear-gradient(150deg, ${c.from}, ${c.to})`, letter: null }
}

export function initials(n) { return n.split(' ').map(x => x[0]).join('') }
