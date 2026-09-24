import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthScreen from './AuthScreen'
import CompleteProfile from './CompleteProfile'
import Home from './Home'
import Services from './Services'
import Booking from './Booking'
import Appointments from './Appointments'
import Notifications from './Notifications'
import { motion, AnimatePresence } from 'framer-motion'
import { GearLoader } from './Skeleton'
import { createPortal } from 'react-dom'
import { LangProvider, useLang } from './lib/i18n'
import { applyTheme } from './lib/themes'
import { haptic } from './lib/haptic'
import { initPush } from './lib/push'
import { AtSign, Phone, MapPin, User, Info, Shield, FileText, Trash2, LogOut } from 'lucide-react'
import './app.css'

// Svaki salon = svoja Vercel instanca istog koda. Slug se čita iz env
// promenljive (postavlja se po projektu u Vercel-u), sa 'lumen' kao
// podrazumevanom vrednošću za lokalni razvoj ako promenljiva nije setovana.
const SALON_SLUG = import.meta.env.VITE_SALON_SLUG || 'lumen'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [client, setClient] = useState(undefined)
  const [salon, setSalon] = useState(null)
  const [entered, setEntered] = useState(false)   // gate ekran mora da se klikne SVAKI put

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) setEntered(false)   // odjava → sledeći put opet gate ekran
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Salon se učitava odmah, nezavisno od sesije — treba nam za gate ekran i pre logina
  useEffect(() => {
    supabase.from('salons').select('*').eq('slug', SALON_SLUG).single()
      .then(({ data }) => {
        setSalon(data)
        applyTheme(data?.theme, data?.brand_color)
      })
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('clients').select('*').eq('auth_user_id', session.user.id).maybeSingle()
      .then(({ data }) => setClient(data))
  }, [session])

  // Push: traži dozvolu tek kad je klijent ulogovan i završio profil
  useEffect(() => { if (client?.phone) initPush('klijent') }, [client?.id])

  if (session === undefined || !salon) return <Loading />
  if (!session) return <AuthScreen salon={salon} />
  if (!entered) return <Home salon={salon} standalone onBook={() => setEntered(true)} />
  if (client === undefined) return <Loading />
  if (!client || !client.phone) {
    return (
      <CompleteProfile
        salonId={salon.id}
        userId={session.user.id}
        email={session.user.email}
        onDone={() => supabase.from('clients').select('*')
          .eq('auth_user_id', session.user.id).maybeSingle()
          .then(({ data }) => setClient(data))}
      />
    )
  }

  return <LangProvider><MainApp client={client} salon={salon} /></LangProvider>
}

function Loading() {
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><GearLoader /></div>
}

function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang">
      <button className={lang==='sr'?'on':''} onClick={()=>setLang('sr')}>SR</button>
      <button className={lang==='en'?'on':''} onClick={()=>setLang('en')}>EN</button>
    </div>
  )
}

function MainApp({ client, salon }) {
  const { t } = useLang()
  // page: 'home' | 'services' | 'termini' | 'notif' | 'settings'
  // booking: kad nije null, prikazuje se preko svega — { worker, serviceIds }
  const [page, setPage] = useState('services')
  const [svcActive, setSvcActive] = useState(false)

  const [openWorkerId, setOpenWorkerId] = useState(null)
  const [booking, setBooking] = useState(null)
  // Izbor radnika i Podesavanja staju na jedan ekran — bez skrolovanja.
  useEffect(() => {
    const lock = !booking && (page === 'settings' || (page === 'services' && !svcActive))
    document.documentElement.classList.toggle('no-scroll', lock)
    window.scrollTo(0, 0)
    return () => document.documentElement.classList.remove('no-scroll')
  }, [page, svcActive, booking])

  return (
    <div className="app-shell">
      <div className="topbar">
        <b>{salon.name}<span>.</span></b>
        <LangSwitch />
      </div>

      {booking ? (
        <Booking
          salon={salon} client={client}
          worker={booking.worker} serviceIds={booking.serviceIds}
          onBack={() => setBooking(null)}
          onDone={() => { setBooking(null); setPage('termini') }}
        />
      ) : (
        <div className="tabpage-stack">
          <div style={{ display: page === 'home' ? 'block' : 'none' }}>
            <Home salon={salon} onBook={() => { setOpenWorkerId(null); setPage('services') }} />
          </div>
          <div style={{ display: page === 'services' ? 'block' : 'none' }}>
            <Services salon={salon} openWorkerId={openWorkerId} onActiveChange={setSvcActive}
              onBookWith={(w, serviceIds) => setBooking({ worker: w, serviceIds })} />
          </div>
          <div style={{ display: page === 'termini' ? 'block' : 'none' }}>
            <Appointments client={client} />
          </div>
          <div style={{ display: page === 'notif' ? 'block' : 'none' }}>
            <Notifications client={client} salon={salon} />
          </div>
          <div style={{ display: page === 'settings' ? 'block' : 'none' }}>
            <Settings client={client} />
          </div>
        </div>
      )}

      {!booking && (
        <div className="tabs">
          <button className={page==='home'?'on':''} onClick={()=>setPage('home')}><span className="i">⌂</span><span>{t('tabHome')}</span></button>
          <button className={page==='services'?'on':''} onClick={()=>{ setOpenWorkerId(null); setPage('services') }}><span className="i">☰</span><span>{t('tabServices')}</span></button>
          <button className={page==='termini'?'on':''} onClick={()=>setPage('termini')}><span className="i">◷</span><span>{t('tabAppts')}</span></button>
          <button className={page==='notif'?'on':''} onClick={()=>setPage('notif')}><span className="i">◔</span><span>{t('tabNotif')}</span></button>
          <button className={page==='settings'?'on':''} onClick={()=>setPage('settings')}><span className="i">⚙</span><span>{t('tabSettings')}</span></button>
        </div>
      )}
    </div>
  )
}

function Profile({ client }) {
  const initials = client.name.split(' ').map(x=>x[0]).join('')
  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="card" style={{ textAlign: 'center', padding: 22 }}>
        <div className="profile-avatar">{initials}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22 }}>{client.name}</div>
        <div className="tiny">{client.email}</div>
        <a href={`tel:${client.phone.replace(/ /g,'')}`} style={{ display: 'block', marginTop: 14 }}>
          <div className="ghost">{client.phone}</div>
        </a>
      </div>
    </div>
  )
}

// ============================================================
// Settings tab — Moj profil, O aplikaciji, Pravila privatnosti,
// Uslovi korišćenja, Obriši profil. Svaka stavka otvara modal
// koji izlazi odozdo (bottom sheet).
// ============================================================
function Settings({ client }) {
  const { t } = useLang()
  const [modal, setModal] = useState(null)   // 'profile' | 'about' | 'privacy' | 'terms' | 'delete' | null
  const [busy, setBusy] = useState(false)

  const titles = {
    profile: t('myProfile'), about: t('aboutApp'), privacy: t('privacyPolicy'),
    terms: t('termsOfUse'), delete: t('deleteAccount'),
  }

  function open(key) { haptic('tap'); setModal(key) }
  function close() { if (!busy) setModal(null) }

  async function deleteAccount() {
    haptic('warning'); setBusy(true)
    await supabase.from('clients').delete().eq('id', client.id)
    await supabase.auth.signOut()
  }

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('settingsTitle')}</h2></div>
      <div className="settings-list">
        <button className="settings-row" onClick={() => open('profile')}><span className="s-ic"><User size={13} strokeWidth={1.75} /></span>{t('myProfile')}<span className="chev">›</span></button>
        <button className="settings-row" onClick={() => open('about')}><span className="s-ic"><Info size={13} strokeWidth={1.75} /></span>{t('aboutApp')}<span className="chev">›</span></button>
        <button className="settings-row danger" onClick={() => open('delete')}><span className="s-ic"><Trash2 size={13} strokeWidth={1.75} /></span>{t('deleteAccount')}<span className="chev">›</span></button>
        <button className="settings-row" onClick={() => { haptic('tap'); supabase.auth.signOut() }}><span className="s-ic"><LogOut size={13} strokeWidth={1.75} /></span>{t('signOut')}</button>
      </div>

      {modal && createPortal((
        <motion.div className="settings-modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          onClick={close}>
          <motion.div className="settings-modal" onClick={e => e.stopPropagation()}
            initial={{ y: '100%' }} animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, info) => { if (info.offset.y > 90 || info.velocity.y > 600) close() }}
          >
            <div className="sheet-handle" />
            <div className="sheet-header">
              <b>{titles[modal]}</b>
              <button className="sheet-close" onClick={close}>✕</button>
            </div>
            <div className="sheet-body">
              {modal === 'profile' && <Profile client={client} />}
              {modal === 'about' && <p>{t('aboutAppBody')}</p>}
              {modal === 'delete' && (
                <div>
                  <p style={{ color: 'var(--rouge)' }}>{t('deleteConfirm')}</p>
                  <button className="btn" disabled={busy} onClick={deleteAccount} style={{ marginBottom: 8 }}>
                    {busy ? '…' : t('deleteBtn')}
                  </button>
                  <button className="ghost" onClick={close}>{t('cancelBtn')}</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ), document.body)}
    </div>
  )
}