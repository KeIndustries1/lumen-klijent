// Kategorije usluga — boja + ikonica, umesto fotografija.
// Bez rizika sa autorskim pravima i tuđim licima, i vizuelno dosledno.
export const CATEGORY = {
  hair:   { icon: '✂', from: '#8A2F47', to: '#5C1F32', label: 'Kosa' },
  nails:  { icon: '💅', from: '#7A3F63', to: '#4E2740', label: 'Nokti' },
  face:   { icon: '✦',  from: '#3F5B4E', to: '#28392F', label: 'Nega lica' },
  lashes: { icon: '◡',  from: '#6B4A2E', to: '#42301F', label: 'Trepavice i obrve' },
}
export const ROLE_CATEGORY = {
  'Frizer i kolorista':  'hair',
  'Manikir i pedikir':   'nails',
  'Kozmetičar':          'face',
  'Trepavice i obrve':   'lashes',
}
export const WORKER_LEVEL = {
  'Milica Jovanović': 'Senior · specijalista za boju',
  'Jelena Nikolić':    'Specijalista za nokte',
  'Ana Petrović':      'Specijalista za negu lica',
  'Tijana Marković':   'Junior · trepavice i obrve',
}
export function catFor(roleSr) { return CATEGORY[ROLE_CATEGORY[roleSr]] || CATEGORY.hair }
export function initials(n) { return n.split(' ').map(x => x[0]).join('') }