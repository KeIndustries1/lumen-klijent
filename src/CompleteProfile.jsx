import { useState } from 'react'
import { supabase } from './lib/supabase'
 
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
    if (error) { setErr(error.message); return }
    onDone()
  }
 
  return (
    <div className="phone">
      <div className="wrap">
        <h1>Još jedan korak</h1>
        <p className="tiny">Ime i broj telefona su nam potrebni da salon zna ko dolazi na termin.</p>
        <form onSubmit={submit} className="stack">
          <input className="f" placeholder="Ime i prezime" value={name}
                 onChange={e => setName(e.target.value)} required />
          <input className="f" type="tel" placeholder="Broj telefona (npr. 064 123 4567)" value={phone}
                 onChange={e => setPhone(e.target.value)} required />
          {err && <p className="err">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Sačekajte…' : 'Nastavi'}</button>
        </form>
      </div>
      <style>{`
        .phone{max-width:430px;margin:0 auto;min-height:100vh;display:flex;align-items:center;
          background:#F6F2F4;color:#17131C;font-family:Inter,system-ui,sans-serif}
        .wrap{width:100%;padding:32px 26px}
        h1{font-family:Georgia,serif;font-size:30px;margin:0 0 6px}
        .tiny{color:#6B6274;font-size:13.5px;margin:0 0 20px}
        .stack{display:flex;flex-direction:column;gap:10px}
        .f{padding:14px;border-radius:12px;border:1px solid #D9CED6;background:#fff;font:inherit}
        .btn{padding:15px;border-radius:14px;border:0;background:#A8324F;color:#fff;font-weight:700;font-size:16px}
        .btn:disabled{opacity:.6}
        .err{color:#A8324F;font-size:13px;margin:0}
      `}</style>
    </div>
  )
}