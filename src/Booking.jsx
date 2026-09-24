import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { catFor, initials } from './images'
import { haptic } from './lib/haptic'
import { useLang } from './lib/i18n'
import { sname, niceDate } from './lib/sname'

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    ;[[880, 0], [1318.5, 0.09]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.type = 'sine'; osc.frequency.value = freq
      osc.connect(gain); gain.connect(ctx.destination)
      const t = now + delay
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.start(t); osc.stop(t + 0.55)
    })
  } catch {}
}

const MON = {
  sr: ['januar','februar','mart','april','maj','jun','jul','avgust','septembar','oktobar','novembar','decembar'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
}
const DOW = {
  sr: ['pon','uto','sre','čet','pet','sub','ned'],
  en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
}

const din  = v => v.toLocaleString('sr-RS') + ' din'
const fmt  = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
const dur  = m => m>=60 ? (m%60 ? Math.floor(m/60)+'h '+(m%60)+'min' : Math.floor(m/60)+'h') : m+'min'
const iso  = d => { const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0') }
const todayISO = iso(new Date())

// worker: red iz workers, serviceIds: niz izabranih usluga (iz Services.jsx)
export default function Booking({ salon, client, worker, serviceIds, onDone, onBack }) {
  const { lang } = useLang()
  const L = (sr, en) => lang === 'en' ? en : sr
  const [step, setStep] = useState(1)   // 1 datum+vreme (jedna strana) · 2 potvrda · 3 uspeh
  const [services, setServices] = useState([])
  const [date, setDate] = useState(todayISO)
  const [time, setTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    supabase.from('services').select('*').eq('worker_id', worker.id).in('id', serviceIds)
      .then(({ data }) => setServices(data || []))
  }, [worker.id])

  // učitaj slobodne termine čim znamo trajanje usluga (uključujući prvi ulazak, za danas)
  useEffect(() => { if (services.length) pickDate(date) }, [services.length])

  const totalDur = () => services.reduce((a,s) => a + s.duration_min, 0)
  const totalPrice = () => services.reduce((a,s) => a + s.price_rsd, 0)

  function pickDate(ds) {
    setDate(ds); setTime(null); setSlots([])
    supabase.rpc('available_slots', { p_worker: worker.id, p_date: ds, p_duration: totalDur() })
      .then(({ data, error }) => { if (!error) setSlots(data.map(r => r.start_min)) })
  }

  async function confirm() {
    setSaving(true); setErr(null)
    const { data: appt, error } = await supabase.from('appointments').insert({
      salon_id: salon.id, worker_id: worker.id, client_id: client.id,
      kind: 'appt', appt_date: date, start_min: time, duration_min: totalDur(),
      note: note.trim() || null,
    }).select().single()
    if (error) {
      setSaving(false)
      setErr(error.code === '23P01'
        ? L('Taj termin je upravo zauzet — izaberite drugo vreme.', 'That time was just taken — please pick another.')
        : error.message)
      haptic('warning')
      if (error.code === '23P01') { setTime(null); pickDate(date) }
      return
    }
    await supabase.from('appointment_services').insert(
      services.map(s => ({ appointment_id: appt.id, service_id: s.id, price_rsd: s.price_rsd, duration_min: s.duration_min }))
    )
    setSaving(false)
    haptic('success')
    playChime()
    setStep(3)
  }

  if (step === 3) return <SuccessScreen onDone={onDone} lang={lang} />

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <button className="ghost" style={{ marginBottom: 12 }} onClick={step===1 ? onBack : () => setStep(1)}>← {L('Nazad', 'Back')}</button>

      <div className="card row" style={{ marginBottom: 14 }}>
        <div className="wthumb-avatar" style={{ background: `linear-gradient(150deg, ${catFor(worker.role_sr).from}, ${catFor(worker.role_sr).to})` }}>
          {initials(worker.name)}
        </div>
        <span className="grow">
          <span className="name">{worker.name}</span><br/>
          <span className="tiny">{services.map(s => sname(s, lang)).join(' + ')}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {step===1 && (
            <div>
              <div className="pagehead">
                <h2>{L('Datum i vreme', 'Date & time')}</h2>
                <p>{L('Trajanje', 'Duration')}: {dur(totalDur())}</p>
              </div>
              <Calendar selected={date} onPick={pickDate} lang={lang} />
              <div className="hr" style={{ margin: '18px 0' }}/>
              {slots.length===0
                ? <p className="tiny">{L('Nema slobodnog termina tog dana — izaberite drugi datum gore.', 'No free times that day — pick another date above.')}</p>
                : <div className="slots">{slots.map(t => <button key={t} className={'slot'+(time===t?' on':'')} onClick={()=>setTime(t)}>{fmt(t)}</button>)}</div>}
              {time!==null && <button className="btn" onClick={()=>setStep(2)}>{L('Dalje', 'Continue')}</button>}
            </div>
          )}

          {step===2 && (
            <div>
              <div className="pagehead">
                <h2>{L('Potvrda', 'Review')}</h2>
                <p>{L('Proverite detalje', 'Check your booking details')}</p>
              </div>
              <div className="card">
                {services.map(s => (
                  <div key={s.id} className="row" style={{ justifyContent:'space-between', padding:'4px 0' }}>
                    <span>{sname(s, lang)}</span><span className="price">{din(s.price_rsd)}</span>
                  </div>
                ))}
                <div className="hr"/>
                <div className="row" style={{ justifyContent:'space-between' }}>
                  <b>{niceDate(date, lang)} · {fmt(time)}–{fmt(time+totalDur())}</b>
                  <b className="price" style={{ fontSize:18 }}>{din(totalPrice())}</b>
                </div>
              </div>
              <div className="eyebrow">{L('Poruka za radnika (opciono)', 'Note for your stylist (optional)')}</div>
              <textarea className="notefield"
                placeholder={L('npr. alergija, želja u vezi boje, poseban zahtev…', 'e.g. allergies, colour preferences, special requests…')}
                value={note} onChange={e => setNote(e.target.value)} rows={3} />
              {err && <p style={{ color:'#A8324F' }}>{err}</p>}
              <button className="btn" disabled={saving} onClick={confirm}>
                {saving ? L('Zakazujem…', 'Booking…') : L('Potvrdi termin', 'Confirm booking')}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function SuccessScreen({ onDone, lang }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700)
    return () => clearTimeout(t)
  }, [])

  return createPortal((
    <div className="success-screen" onClick={onDone}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="success-circle"
      >
        <svg viewBox="0 0 52 52" width="52" height="52">
          <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#fff" strokeWidth="2.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }} />
          <motion.path d="M14 27l7 7 17-17" fill="none" stroke="#fff" strokeWidth="3.2"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.4, ease: 'easeOut' }} />
        </svg>
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        {lang === 'en' ? 'Appointment booked' : 'Termin je zakazan'}
      </motion.p>
    </div>
  ), document.body)
}

function Calendar({ selected, onPick, lang }) {
  const [cal, setCal] = useState(() => { const d=new Date(); d.setDate(1); return d })
  const y = cal.getFullYear(), m = cal.getMonth()
  const startIdx = (new Date(y,m,1).getDay()+6)%7
  const dim = new Date(y, m+1, 0).getDate()
  const cells = [...Array(startIdx).fill(null), ...Array.from({length:dim},(_,i)=>i+1)]
  const touchX = { current: null }
  const l = lang === 'en' ? 'en' : 'sr'

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 45) {
      if (dx < 0) setCal(new Date(y, m+1, 1))   // swipe levo → sledeći mesec
      else setCal(new Date(y, m-1, 1))          // swipe desno → prethodni mesec
    }
    touchX.current = null
  }

  return (
    <div className="cal" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence mode="wait">
        <motion.div key={`${y}-${m}`}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
          <div className="calhead">
            <b className="grow">{MON[l][m]} {y}</b>
          </div>
          <div className="cg">
            {DOW[l].map(d=><div key={d} className="dow">{d}</div>)}
            {cells.map((d,i) => {
              if (d===null) return <div key={i}/>
              const ds = iso(new Date(y,m,d))
              const disabled = ds < todayISO || new Date(y,m,d).getDay()===0
              return <button key={i} className={'cell'+(ds===selected?' on':disabled?' none':'')} disabled={disabled} onClick={()=>onPick(ds)}>{d}</button>
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}