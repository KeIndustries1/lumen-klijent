import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { catFor, initials } from './images'

const MON  = ['januar','februar','mart','april','maj','jun','jul','avgust','septembar','oktobar','novembar','decembar']
const din  = v => v.toLocaleString('sr-RS') + ' din'
const fmt  = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
const dur  = m => m>=60 ? (m%60 ? Math.floor(m/60)+'h '+(m%60)+'min' : Math.floor(m/60)+'h') : m+'min'
const iso  = d => { const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0') }
const todayISO = iso(new Date())

// worker: red iz workers, serviceIds: niz izabranih usluga (iz Services.jsx)
export default function Booking({ salon, client, worker, serviceIds, onDone, onBack }) {
  const [step, setStep] = useState(1)   // 1 datum+vreme (jedna strana) · 2 potvrda
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
      setErr(error.code === '23P01' ? 'Taj termin je upravo zauzet — izaberite drugo vreme.' : error.message)
      if (error.code === '23P01') { setTime(null); pickDate(date) }
      return
    }
    await supabase.from('appointment_services').insert(
      services.map(s => ({ appointment_id: appt.id, service_id: s.id, price_rsd: s.price_rsd, duration_min: s.duration_min }))
    )
    setSaving(false)
    onDone()
  }

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <button className="ghost" style={{ marginBottom: 12 }} onClick={step===1 ? onBack : () => setStep(1)}>← Nazad</button>

      <div className="card row" style={{ marginBottom: 14 }}>
        <div className="wthumb-avatar" style={{ background: `linear-gradient(150deg, ${catFor(worker.role_sr).from}, ${catFor(worker.role_sr).to})` }}>
          {initials(worker.name)}
        </div>
        <span className="grow">
          <span className="name">{worker.name}</span><br/>
          <span className="tiny">{services.map(s=>s.name_sr).join(' + ')}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {step===1 && (
            <div>
              <div className="pagehead"><h2>Datum i vreme</h2><p>Blok od {dur(totalDur())}</p></div>
              <Calendar selected={date} onPick={pickDate} />
              <div className="hr" style={{ margin: '18px 0' }}/>
              {slots.length===0
                ? <p className="tiny">Nema slobodnog termina tog dana — izaberite drugi datum gore.</p>
                : <div className="slots">{slots.map(t => <button key={t} className={'slot'+(time===t?' on':'')} onClick={()=>setTime(t)}>{fmt(t)}</button>)}</div>}
              {time!==null && <button className="btn" onClick={()=>setStep(2)}>Dalje</button>}
            </div>
          )}

          {step===2 && (
            <div>
              <div className="pagehead"><h2>Potvrda</h2><p>Proverite detalje</p></div>
              <div className="card">
                {services.map(s => (
                  <div key={s.id} className="row" style={{ justifyContent:'space-between', padding:'4px 0' }}>
                    <span>{s.name_sr}</span><span className="price">{din(s.price_rsd)}</span>
                  </div>
                ))}
                <div className="hr"/>
                <div className="row" style={{ justifyContent:'space-between' }}>
                  <b>{date} · {fmt(time)}–{fmt(time+totalDur())}</b>
                  <b className="price" style={{ fontSize:18 }}>{din(totalPrice())}</b>
                </div>
              </div>
              <div className="eyebrow">Poruka za radnika (opciono)</div>
              <textarea className="notefield" placeholder="npr. alergija, želja u vezi boje, poseban zahtev…"
                value={note} onChange={e => setNote(e.target.value)} rows={3} />
              {err && <p style={{ color:'#A8324F' }}>{err}</p>}
              <button className="btn" disabled={saving} onClick={confirm}>{saving ? 'Zakazujem…' : 'Potvrdi termin'}</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Calendar({ selected, onPick }) {
  const [cal, setCal] = useState(() => { const d=new Date(); d.setDate(1); return d })
  const y = cal.getFullYear(), m = cal.getMonth()
  const startIdx = (new Date(y,m,1).getDay()+6)%7
  const dim = new Date(y, m+1, 0).getDate()
  const cells = [...Array(startIdx).fill(null), ...Array.from({length:dim},(_,i)=>i+1)]

  return (
    <div className="cal">
      <div className="calhead">
        <b className="grow">{MON[m]} {y}</b>
        <button onClick={()=>setCal(new Date(y,m-1,1))}>‹</button>
        <button onClick={()=>setCal(new Date(y,m+1,1))}>›</button>
      </div>
      <div className="cg">
        {['pon','uto','sre','čet','pet','sub','ned'].map(d=><div key={d} className="dow">{d}</div>)}
        {cells.map((d,i) => {
          if (d===null) return <div key={i}/>
          const ds = iso(new Date(y,m,d))
          const disabled = ds < todayISO || new Date(y,m,d).getDay()===0
          return <button key={i} className={'cell'+(ds===selected?' on':disabled?' none':'')} disabled={disabled} onClick={()=>onPick(ds)}>{d}</button>
        })}
      </div>
    </div>
  )
}