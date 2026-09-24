// Naziv usluge na izabranom jeziku. Ako engleski ne postoji, prikazuje srpski.
export const sname = (s, lang) => (lang === 'en' && s.name_en) || s.name_sr

// Uloga radnice (npr. "Frizerka"). Radi i ako kolona role_en još ne postoji.
export const rname = (w, lang) => (lang === 'en' && w.role_en) || w.role_sr

// Lep datum: "sre, 24. sep" / "Wed, 24 Sep"
export const niceDate = (ds, lang) =>
  new Date(ds + 'T00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'sr-Latn-RS',
    { weekday: 'short', day: 'numeric', month: 'short' })