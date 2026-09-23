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
    tabHome: 'Početna', tabServices: 'Usluge', tabAppts: 'Termini', tabNotif: 'Obaveštenja', tabSettings: 'Podešavanja',
    signOut: 'Odjavi se',
    servicesTitle: 'Izaberi zaposlenog', servicesSub: 'Izaberite radnika da vidite cenovnik',
    apptsTitle: 'Moji termini',
    notifTitle: 'Obaveštenja',
    back: '← Nazad',
    loading: 'Učitavanje…',
    continue: 'Nastavi',
    settingsTitle: 'Podešavanja',
    myProfile: 'Moj profil',
    aboutApp: 'O aplikaciji',
    privacyPolicy: 'Pravila privatnosti',
    termsOfUse: 'Uslovi korišćenja',
    deleteAccount: 'Obriši profil',
    deleteConfirm: 'Ovo trajno briše vaš nalog i sve podatke. Ova radnja se ne može poništiti.',
    deleteBtn: 'Da, obriši nalog',
    cancelBtn: 'Otkaži',
    aboutAppBody: 'Aplikacija za zakazivanje termina. Verzija 1.0.',
    privacyBody: 'Vaši podaci (ime, telefon, email) koriste se isključivo za zakazivanje termina u salonu i ne dele se sa trećim stranama.',
    termsBody: 'Korišćenjem aplikacije prihvatate da su navedeni termini rezervacije obavezujući i da otkazivanje mora biti u predviđenom roku.',
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
    tabHome: 'Home', tabServices: 'Services', tabAppts: 'Bookings', tabNotif: 'Notifications', tabSettings: 'Settings',
    signOut: 'Sign out',
    servicesTitle: 'Choose a specialist', servicesSub: 'Choose a stylist to see their price list',
    apptsTitle: 'My bookings',
    notifTitle: 'Notifications',
    back: '← Back',
    loading: 'Loading…',
    continue: 'Continue',
    settingsTitle: 'Settings',
    myProfile: 'My profile',
    aboutApp: 'About this app',
    privacyPolicy: 'Privacy policy',
    termsOfUse: 'Terms of use',
    deleteAccount: 'Delete account',
    deleteConfirm: 'This permanently deletes your account and all data. This cannot be undone.',
    deleteBtn: 'Yes, delete my account',
    cancelBtn: 'Cancel',
    aboutAppBody: 'Booking app. Version 1.0.',
    privacyBody: 'Your data (name, phone, email) is used only to manage your salon bookings and is never shared with third parties.',
    termsBody: 'By using this app you agree that listed booking times are binding and cancellations must be made within the stated window.',
  },
}

const LangCtx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lumen_lang') || 'sr')
  function change(l) { setLang(l); localStorage.setItem('lumen_lang', l) }
  return <LangCtx.Provider value={{ lang, setLang: change, t: k => T[lang][k] ?? k }}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }