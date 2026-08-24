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
import { LangProvider, useLang } from './lib/i18n'
import './app.css'

const SALON_SLUG = 'lumen'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [client, setClient] = useState(undefined)
  const [salon, setSalon] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('salons').select('*').eq('slug', SALON_SLUG).single()
      .then(({ data }) => setSalon(data))
    supabase.from('clients').select('*').eq('auth_user_id', session.user.id).maybeSingle()
      .then(({ data }) => setClient(data))
  }, [session])

  if (session === undefined) return <Loading />
  if (!session) return <AuthScreen />
  if (client === undefined || !salon) return <Loading />
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
  return <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#6B6274' }}>Učitavanje…</div>
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
  // page: 'home' | 'services' | 'termini' | 'notif' | 'profile'
  // booking: kad nije null, prikazuje se preko svega — { worker, serviceIds }
  const [page, setPage] = useState('home')
  const [openWorkerId, setOpenWorkerId] = useState(null)
  const [booking, setBooking] = useState(null)

  return (
    <div className="app-shell">
      <div className="topbar">
        <b>Lumen<span>.</span></b>
        <LangSwitch />
        {page === 'profile' && (
          <button className="signout" onClick={() => supabase.auth.signOut()}>{t('signOut')}</button>
        )}
      </div>

      {booking ? (
        <Booking
          salon={salon} client={client}
          worker={booking.worker} serviceIds={booking.serviceIds}
          onBack={() => setBooking(null)}
          onDone={() => { setBooking(null); setPage('termini') }}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {page === 'home' && (
              <Home salon={salon} onBook={() => { setOpenWorkerId(null); setPage('services') }} />
            )}
            {page === 'services' && (
              <Services salon={salon} openWorkerId={openWorkerId}
                onBookWith={(w, serviceIds) => setBooking({ worker: w, serviceIds })} />
            )}
            {page === 'termini' && <Appointments client={client} />}
            {page === 'notif' && <Notifications />}
            {page === 'profile' && <Profile client={client} />}
          </motion.div>
        </AnimatePresence>
      )}

      {!booking && (
        <div className="tabs">
          <button className={page==='home'?'on':''} onClick={()=>setPage('home')}><span className="i">⌂</span>{t('tabHome')}</button>
          <button className={page==='services'?'on':''} onClick={()=>{ setOpenWorkerId(null); setPage('services') }}><span className="i">☰</span>{t('tabServices')}</button>
          <button className={page==='termini'?'on':''} onClick={()=>setPage('termini')}><span className="i">◷</span>{t('tabAppts')}</button>
          <button className={page==='notif'?'on':''} onClick={()=>setPage('notif')}><span className="i">◔</span>{t('tabNotif')}</button>
          <button className={page==='profile'?'on':''} onClick={()=>setPage('profile')}><span className="i">☺</span>{t('tabProfile')}</button>
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