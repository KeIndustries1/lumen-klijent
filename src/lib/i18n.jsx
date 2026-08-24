import { createContext, useContext, useState } from 'react'

const T = {
  sr: {
    tagline: 'Salon lepote · Beograd',
    book: 'Rezerviši termin',
    contact: 'Kontakt',
    phone: 'Telefon',
    instagram: 'Instagram',
    location: 'Lokacija',
    hours: 'Radno vreme',
    hoursValue: 'Pon–sub · 09:00–20:00',
    tabHome: 'Početna', tabServices: 'Usluge', tabAppts: 'Termini', tabNotif: 'Obaveštenja', tabProfile: 'Profil',
    signOut: 'Odjavi se',
    servicesTitle: 'Usluge i cene', servicesSub: 'Izaberite radnika da vidite cenovnik',
    apptsTitle: 'Moji termini',
    notifTitle: 'Obaveštenja',
    back: '← Nazad',
    loading: 'Učitavanje…',
  },
  en: {
    tagline: 'Beauty salon · Belgrade',
    book: 'Book an appointment',
    contact: 'Contact',
    phone: 'Phone',
    instagram: 'Instagram',
    location: 'Location',
    hours: 'Opening hours',
    hoursValue: 'Mon–Sat · 9:00 AM–8:00 PM',
    tabHome: 'Home', tabServices: 'Services', tabAppts: 'Bookings', tabNotif: 'Notifications', tabProfile: 'Profile',
    signOut: 'Sign out',
    servicesTitle: 'Services & pricing', servicesSub: 'Choose a stylist to see their price list',
    apptsTitle: 'My bookings',
    notifTitle: 'Notifications',
    back: '← Back',
    loading: 'Loading…',
  },
}

const LangCtx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lumen_lang') || 'sr')
  function change(l) { setLang(l); localStorage.setItem('lumen_lang', l) }
  return <LangCtx.Provider value={{ lang, setLang: change, t: k => T[lang][k] ?? k }}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }