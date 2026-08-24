import { useState } from 'react'
import { supabase } from './lib/supabase'
 
// ============================================================
// Ekran za prijavu / registraciju.
// Mejl + lozinka sad; Google/Apple dugmad se dodaju kasnije —
// isti poziv, samo signInWithOAuth({ provider: 'google' }).
// ============================================================
export default function AuthScreen() {
  const [mode, setMode] = useState('login')   // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
 
  async function submit(e) {
    e.preventDefault()
    setErr(null); setBusy(true)
    const { error } = mode === 'login'
  ? await supabase.auth.signInWithPassword({ email, password: pass })
  : await supabase.auth.signUp({ email, password: pass })
    setBusy(false)
    if (error) setErr(poruka(error))
  }
 
  return (
    <div className="phone">
      <div className="auth">
        <div className="mark">Salon lepote · Beograd</div>
        <h1>Lumen</h1>
        <form onSubmit={submit} className="stack">
          <input className="f" type="email" placeholder="Email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
          <input className="f" type="password" placeholder="Lozinka" value={pass}
                 onChange={e => setPass(e.target.value)} required minLength={6} />
          {err && <p className="err">{err}</p>}
          <button className="btn" disabled={busy}>
            {busy ? 'Sačekajte…' : mode === 'login' ? 'Prijavi se' : 'Napravi nalog'}
          </button>
        </form>
        <button className="link" onClick={() => { setErr(null); setMode(mode === 'login' ? 'signup' : 'login') }}>
          {mode === 'login' ? 'Nemate nalog? Registrujte se' : 'Već imate nalog? Prijavite se'}
        </button>
      </div>
      <style>{`
        .phone{max-width:430px;margin:0 auto;min-height:100vh;display:flex;align-items:center;
          background:#17131C;color:#fff;font-family:Inter,system-ui,sans-serif}
        .auth{width:100%;padding:32px 26px}
        .mark{font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#BCAEB8}
        h1{font-family:Georgia,serif;font-size:44px;margin:8px 0 24px}
        .stack{display:flex;flex-direction:column;gap:10px}
        .f{padding:14px;border-radius:12px;border:1px solid #3B3244;background:#231D29;color:#fff;font:inherit}
        .btn{padding:15px;border-radius:14px;border:0;background:#A8324F;color:#fff;font-weight:700;font-size:16px}
        .btn:disabled{opacity:.6}
        .link{margin-top:14px;background:none;border:0;color:#F0A9BC;font-size:13.5px}
        .err{color:#F0A9BC;font-size:13px;margin:0}
      `}</style>
    </div>
  )
}
 
function poruka(error) {
  if (error.message.includes('Invalid login credentials')) return 'Pogrešan email ili lozinka.'
  if (error.message.includes('already registered')) return 'Nalog sa ovim mejlom već postoji.'
  if (error.message.includes('Password should be')) return 'Lozinka mora imati bar 6 karaktera.'
  return error.message
}
 