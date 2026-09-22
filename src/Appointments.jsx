import { useLang } from './lib/i18n'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonRows } from './Skeleton'
import { haptic } from './lib/haptic'

const fmt = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
const iso = d => { const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0') }
const todayISO = iso(new Date())

export default function Appointments({ client }) {
  const { t } = useLang()
  const [rows, setRows] = useState(null)
  const [tab, setTab] = useState('up')   // 'up' predstojeći · 'past' prošli
  const [idx, setIdx] = useState(0)      // koji termin gledamo u tekućem podtabu

  function load() {
    supabase.from('appointments')
      .select('id, appt_date, start_min, duration_min, status, workers(name), appointment_services(price_rsd, services(name_sr))')
      .eq('client_id', client.id).order('appt_date', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }
  useEffect(load, [client.id])

  async function cancel(id) {
    haptic('tap')
    const prev = rows
    // Optimistic UI: ekran se ažurira ODMAH, pre nego što server odgovori
    setRows(rows.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (error) { haptic('warning'); setRows(prev) }   // vrati nazad ako je greška
  }

  function switchTab(t) { haptic('tap'); setTab(t); setIdx(0) }

  const up = rows ? rows.filter(a => a.appt_date >= todayISO && a.status !== 'cancelled')
    .sort((a,b) => a.appt_date.localeCompare(b.appt_date)) : []
  const past = rows ? rows.filter(a => a.appt_date < todayISO || a.status === 'cancelled') : []
  const list = tab === 'up' ? up : past
  const current = list[Math.min(idx, Math.max(list.length - 1, 0))]

  useEffect(() => { if (idx > list.length - 1 && list.length > 0) setIdx(list.length - 1) }, [list.length])

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('apptsTitle')}</h2></div>

      <div className="subtabs">
        <button className={tab==='up'?'on':''} onClick={()=>switchTab('up')}>Predstojeći</button>
        <button className={tab==='past'?'on':''} onClick={()=>switchTab('past')}>Prošli</button>
      </div>

      {rows === null ? <SkeletonRows count={3} /> : list.length === 0 ? (
        <div className="card"><p className="tiny">{tab==='up' ? 'Nemate zakazanih termina.' : 'Nema prošlih termina.'}</p></div>
      ) : (
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={tab + idx}
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              <Card a={current} active={tab==='up'} onCancel={cancel} />
            </motion.div>
          </AnimatePresence>

          {list.length > 1 && (
            <div className="apptnav">
              <button className="ghost" disabled={idx===0}
                onClick={() => { haptic('tap'); setIdx(i => i-1) }}>‹ Previous</button>
              <span className="tiny">{idx+1} / {list.length}</span>
              <button className="ghost" disabled={idx===list.length-1}
                onClick={() => { haptic('tap'); setIdx(i => i+1) }}>Next ›</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Card({ a, active, onCancel }) {
  return (
    <div className="card" style={{ opacity: active ? 1 : 0.7, borderLeft: active ? '2px solid var(--rouge)' : '1px solid var(--line)' }}>
      <div className="name">{a.appointment_services.map(x=>x.services.name_sr).join(' + ')}</div>
      <div className="tiny">{a.workers.name} · {a.appt_date} · {fmt(a.start_min)}–{fmt(a.start_min+a.duration_min)}</div>
      <div style={{ marginTop: 8 }}>
        <span className={'tag' + (active ? ' g' : ' n')}>{a.status==='cancelled' ? 'Otkazano' : active ? 'Potvrđeno' : 'Završeno'}</span>
      </div>
      {active && <button className="ghost" style={{ marginTop: 10 }} onClick={() => onCancel(a.id)}>Otkaži termin</button>}
    </div>
  )
}