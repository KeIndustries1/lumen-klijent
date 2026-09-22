import { useState } from 'react'
import { supabase } from './lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { haptic } from './lib/haptic'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

// ============================================================
// Ekran za prijavu / registraciju. Prvi ekran koji NOVI korisnik
// vidi (pre Gate ekrana). Google/Apple su glavni put; email+lozinka
// ostaje kao rezerva.
// ============================================================
export default function AuthScreen({ salon }) {
  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [oauthBusy, setOauthBusy] = useState(null)   // 'google' | 'apple' | null
  const [shake, setShake] = useState(0)

  async function submit(e) {
    e.preventDefault()
    setErr(null); setInfo(null); setBusy(true)
    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({ email, password: pass })
    setBusy(false)
    if (error) { setErr(poruka(error)); haptic('warning'); setShake(s => s + 1); return }
    // Ako je registracija uspela ali nema sesije, Supabase ceka potvrdu email-a
    if (mode === 'signup' && data?.user && !data?.session) {
      haptic('success')
      setInfo('Poslali smo vam email — kliknite na link u njemu da potvrdite nalog, pa se prijavite.')
    }
  }

  async function oauth(provider) {
    haptic('tap'); setErr(null); setOauthBusy(provider)
    const native = Capacitor.isNativePlatform()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: native ? 'rs.lumen.klijent://auth-callback' : undefined,
        skipBrowserRedirect: native,
      },
    })
    if (error) { setOauthBusy(null); setErr(poruka(error)); haptic('warning'); return }
    // Na native app-u, Supabase NE preusmerava sam — mi otvaramo sistemski
    // brauzer rucno (Browser.open), a povratak (deep link) hvata App.jsx.
    if (native && data?.url) {
      await Browser.open({ url: data.url })
    }
    // Na webu: brauzer se sam preusmerava, stranica se ponovo ucitava.
  }

  function switchMode() {
    haptic('tap'); setErr(null); setInfo(null); setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="auth-screen">
      <motion.div className="auth-card"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mark">{salon?.name || 'Salon'}</div>
        <h1>Prijava</h1>

        <div className="stack">
          <button type="button" className="oauth-btn dark" disabled={!!oauthBusy} onClick={() => oauth('apple')}>
            <AppleMark />
            <span>{oauthBusy === 'apple' ? 'Sačekajte…' : 'Nastavi sa Apple nalogom'}</span>
          </button>
          <button type="button" className="oauth-btn" disabled={!!oauthBusy} onClick={() => oauth('google')}>
            <GoogleMark />
            <span>{oauthBusy === 'google' ? 'Sačekajte…' : 'Nastavi sa Google nalogom'}</span>
          </button>
          {!showEmailForm && (
            <button type="button" className="oauth-btn" onClick={() => { haptic('tap'); setShowEmailForm(true) }}>
              <GmailMark />
              <span>Nastavi sa Gmail nalogom</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {err && (
            <motion.p className="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} style={{ marginTop: 10 }}>{err}</motion.p>
          )}
          {info && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} style={{ marginTop: 10, color: 'var(--rouge)', fontSize: 13.5, lineHeight: 1.5 }}>{info}</motion.p>
          )}
        </AnimatePresence>

        {showEmailForm && (
          <AnimatePresence mode="wait">
            <motion.form key={mode} onSubmit={submit} className="stack"
              initial={{ opacity: 0, x: mode === 'signup' ? 14 : -14 }}
              animate={{ opacity: 1, x: shake % 2 === 1 ? [0, -8, 8, -5, 5, 0] : 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -14 : 14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: 16 }}
            >
              <input className="f" type="email" placeholder="Email" value={email} autoComplete="email"
                     onChange={e => setEmail(e.target.value)} required />
              <div className="f-pass-wrap">
                <input className="f" type={showPass ? 'text' : 'password'} placeholder="Lozinka" value={pass}
                       autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                       onChange={e => setPass(e.target.value)} required minLength={6} />
                <button type="button" className="f-pass-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? 'Sakrij' : 'Prikaži'}
                </button>
              </div>
              <button className="btn" disabled={busy}>
                {busy ? 'Sačekajte…' : mode === 'login' ? 'Prijavi se' : 'Napravi nalog'}
              </button>
              <button type="button" className="link" onClick={switchMode} style={{ marginTop: 2 }}>
                {mode === 'login' ? 'Nemate nalog? Registrujte se' : 'Već imate nalog? Prijavite se'}
              </button>
            </motion.form>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}

function GmailMark() {
  return (
    <svg width="18" height="14" viewBox="0 0 24 18">
      <path fill="#EA4335" d="M2 1h20a2 2 0 0 1 2 2v1.2L12 12 0 4.2V3a2 2 0 0 1 2-2z"/>
      <path fill="#C5221F" d="M0 4.2v11.6C0 17 1 18 2.2 18H4V7.8L0 4.2z"/>
      <path fill="#C5221F" d="M24 4.2v11.6c0 1.2-1 2.2-2.2 2.2H20V7.8l4-3.6z"/>
      <path fill="#4285F4" d="M4 7.8V18h16V7.8L12 15 4 7.8z"/>
      <path fill="#FBBC04" d="M4 7.8 0 4.2v11.6c0 .77.36 1.45.92 1.9L4 15V7.8z"/>
      <path fill="#34A853" d="M20 7.8 24 4.2v11.6c0 .77-.36 1.45-.92 1.9L20 15V7.8z"/>
    </svg>
  )
}
function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/>
    </svg>
  )
}
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18"><g fill="none" fillRule="evenodd">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.26h2.92C16.6 14.14 17.64 11.9 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.11-.28-1.72s.1-1.18.28-1.72V4.95H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </g></svg>
  )
}
function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="#fff">
      <path d="M13.1 9.5c0-1.46.67-2.55 2-3.27-.77-1.1-1.94-1.7-3.5-1.82-1.47-.12-2.72.86-3.44.86-.75 0-1.9-.83-3.15-.8-1.64.02-3.15 1-3.98 2.53C-.76 9.9-.01 15.2 1.62 17.3c.78 1 1.7 2.13 2.92 2.08 1.16-.04 1.6-.75 3.02-.75 1.4 0 1.8.75 3.03.73 1.25-.02 2.07-1.05 2.85-2.06.85-1.13 1.2-2.22 1.22-2.28-.03-.01-2.34-.9-2.36-3.55l-.2.02zM10.6 3.05C11.24 2.27 11.68 1.18 11.55 0 10.5.06 9.23.7 8.55 1.5c-.6.68-1.1 1.79-.96 2.9 1.14.09 2.32-.57 3.01-1.35z"/>
    </svg>
  )
}

function poruka(error) {
  if (error.message.includes('Invalid login credentials')) return 'Pogrešan email ili lozinka.'
  if (error.message.includes('already registered')) return 'Nalog sa ovim mejlom već postoji.'
  if (error.message.includes('Password should be')) return 'Lozinka mora imati bar 6 karaktera.'
  return error.message
}