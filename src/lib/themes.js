// ============================================================
// TEME — 14 gotovih paleta. Salon bira jednu (kolona 'theme' u
// salons tabeli), app je primeni pri pokretanju.
// Sve teme dele ISTU strukturu i funkcionalnost — menja se samo
// estetika (boje pozadine, akcenat, kartice).
// ============================================================

export const THEMES = {
  rouge: {
    label: 'Rouge',
    vars: {
      '--ink': '#17131C', '--ink2': '#241E2B', '--bg': '#1D1720', '--card': '#251E29',
      '--line': '#3A2F3C', '--muted': '#B7A9B4', '--text': '#F3E9EE', '--rouge': '#E27594',
    },
  },

  midnight: {
    label: 'Midnight',
    vars: {
      '--ink': '#0F1520', '--ink2': '#1A2332', '--bg': '#131A26', '--card': '#1C2634',
      '--line': '#2C3849', '--muted': '#9BAABF', '--text': '#E9EFF6', '--rouge': '#D4A857',
    },
  },

  emerald: {
    label: 'Emerald',
    vars: {
      '--ink': '#121614', '--ink2': '#1D2420', '--bg': '#161B18', '--card': '#1F2723',
      '--line': '#2E3A34', '--muted': '#A3B3AA', '--text': '#EAF2ED', '--rouge': '#4FBF8B',
    },
  },

  terracotta: {
    label: 'Terracotta',
    vars: {
      '--ink': '#1A1614', '--ink2': '#262019', '--bg': '#1F1A16', '--card': '#2A231C',
      '--line': '#3D342A', '--muted': '#BBAA9A', '--text': '#F5EDE4', '--rouge': '#D97B4F',
    },
  },

  slate: {
    label: 'Slate',
    vars: {
      '--ink': '#0D0D0F', '--ink2': '#1A1A1E', '--bg': '#131316', '--card': '#1D1D22',
      '--line': '#2E2E35', '--muted': '#A0A0AB', '--text': '#EDEDF2', '--rouge': '#5B9BD5',
    },
  },

  orchid: {
    label: 'Orchid',
    vars: {
      '--ink': '#161020', '--ink2': '#221A2E', '--bg': '#1A1425', '--card': '#251D32',
      '--line': '#382C47', '--muted': '#B5A6C4', '--text': '#F0EAF6', '--rouge': '#A78BE0',
    },
  },

  champagne: {
    label: 'Champagne',
    vars: {
      '--ink': '#1A1614', '--ink2': '#26201B', '--bg': '#1E1915', '--card': '#26201B',
      '--line': '#3A322B', '--muted': '#B8AC9B', '--text': '#F6F0E8', '--rouge': '#E3C89A',
    },
  },

  teal: {
    label: 'Teal',
    vars: {
      '--ink': '#101817', '--ink2': '#182524', '--bg': '#141E1D', '--card': '#182524',
      '--line': '#28393A', '--muted': '#9AB3B5', '--text': '#E6F1F1', '--rouge': '#46B5B0',
    },
  },

  crimson: {
    label: 'Crimson',
    vars: {
      '--ink': '#1B1113', '--ink2': '#271A1D', '--bg': '#1F1518', '--card': '#271A1D',
      '--line': '#3C2A2D', '--muted': '#C2A6AA', '--text': '#F7E9EA', '--rouge': '#D6485C',
    },
  },

  indigo: {
    label: 'Indigo',
    vars: {
      '--ink': '#14161D', '--ink2': '#1D212C', '--bg': '#181B24', '--card': '#1D212C',
      '--line': '#2B3040', '--muted': '#A2A8BC', '--text': '#ECEEF6', '--rouge': '#7B7BE8',
    },
  },

  olive: {
    label: 'Olive',
    vars: {
      '--ink': '#181613', '--ink2': '#23201A', '--bg': '#1C1A16', '--card': '#23201A',
      '--line': '#38342B', '--muted': '#B3AE9C', '--text': '#F2F0E6', '--rouge': '#A8B865',
    },
  },

  blush: {
    label: 'Blush',
    vars: {
      '--ink': '#1C1418', '--ink2': '#281E24', '--bg': '#20171C', '--card': '#281E24',
      '--line': '#3E2F38', '--muted': '#C1A8B8', '--text': '#F8ECF2', '--rouge': '#E8A9B8',
    },
  },

  graphite: {
    label: 'Graphite',
    vars: {
      '--ink': '#0E1012', '--ink2': '#181B1E', '--bg': '#121416', '--card': '#181B1E',
      '--line': '#262A2E', '--muted': '#9BA3AA', '--text': '#ECEFF2', '--rouge': '#E8EAEC',
    },
  },

  copper: {
    label: 'Copper',
    vars: {
      '--ink': '#1A1410', '--ink2': '#261E17', '--bg': '#1E1813', '--card': '#261E17',
      '--line': '#3B2F24', '--muted': '#BCA894', '--text': '#F6EDE4', '--rouge': '#C87F42',
    },
  },
}

// Primeni temu na ceo dokument. Poziva se jednom, kad se salon učita.
export function applyTheme(themeKey, brandColorOverride) {
  const theme = THEMES[themeKey] || THEMES.rouge
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  // Salon može da pregazi SAMO akcentnu boju ako želi svoju tačnu nijansu
  if (brandColorOverride) root.style.setProperty('--rouge', brandColorOverride)
}