import { useState } from 'react'
import { supabase } from './lib/supabase'
import { motion } from 'framer-motion'
import { haptic } from './lib/haptic'

// ============================================================
// Prikazuje se JEDNOM, posle prve prijave, ako klijent u bazi
// još nema red (ili red postoji ali nema broj telefona).
// Kad se sačuva, App.jsx ponovo učita klijenta i ovaj ekran nestaje.
// ============================================================
export default function CompleteProfile({ salonId, userId, email, onDone }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(null); setBusy(true)
    const { error } = await supabase.from('clients').upsert(
      { auth_user_id: userId, salon_id: salonId, name, phone, email },
      { onConflict: 'auth_user_id' }
    )
    setBusy(false)
    if (error) { setErr(error.message); haptic('warning'); return }
    haptic('success')
    onDone()
  }

  return (
    <div className="auth-screen">
      <motion.div className="auth-card"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Još jedan korak</h1>
        <p className="tiny" style={{ marginBottom: 20 }}>Ime i broj telefona su nam potrebni da salon zna ko dolazi na termin.</p>
        <form onSubmit={submit} className="stack">
          <input className="f" placeholder="Ime i prezime" value={name}
                 onChange={e => setName(e.target.value)} required />
          <input className="f" type="tel" placeholder="Broj telefona (npr. 064 123 4567)" value={phone}
                 onChange={e => setPhone(e.target.value)} required />
          {err && <p className="err">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Sačekajte…' : 'Nastavi'}</button>
        </form>
      </motion.div>
    </div>
  )
}