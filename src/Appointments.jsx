import { useLang } from './lib/i18n'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

const fmt = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
const iso = d => { const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0') }
const todayISO = iso(new Date())

export default function Appointments({ client }) {
  const { t } = useLang()
  const [rows, setRows] = useState(null)

  function load() {
    supabase.from('appointments')
      .select('id, appt_date, start_min, duration_min, status, workers(name), appointment_services(price_rsd, services(name_sr))')
      .eq('client_id', client.id).order('appt_date', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }
  useEffect(load, [client.id])

  async function cancel(id) {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    load()
  }

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('apptsTitle')}</h2><p>Pregled zakazanih i prošlih poseta</p></div>
      {rows === null ? <p className="tiny">Učitavanje…</p> : rows.length === 0 ? (
        <div className="card"><p className="tiny">Nemate zakazanih termina.</p></div>
      ) : (
        <Body rows={rows} onCancel={cancel} />
      )}
    </div>
  )
}

function Body({ rows, onCancel }) {
  const up = rows.filter(a => a.appt_date >= todayISO && a.status !== 'cancelled')
  const past = rows.filter(a => a.appt_date < todayISO || a.status === 'cancelled')
  return (
    <div>
      {up.length>0 && <div className="eyebrow">Predstoji</div>}
      <div className="stack">{up.map(a => <Card key={a.id} a={a} active onCancel={onCancel} />)}</div>
      {past.length>0 && (
        <div>
          <div className="eyebrow">Prošli termini</div>
          <div className="stack">{past.map(a => <Card key={a.id} a={a} />)}</div>
        </div>
      )}
    </div>
  )
}

function Card({ a, active, onCancel }) {
  return (
    <div className="card" style={{ opacity: active ? 1 : 0.7 }}>
      <div className="name">{a.appointment_services.map(x=>x.services.name_sr).join(' + ')}</div>
      <div className="tiny">{a.workers.name} · {a.appt_date} · {fmt(a.start_min)}–{fmt(a.start_min+a.duration_min)}</div>
      <div style={{ marginTop: 8 }}>
        <span className={'tag' + (active ? ' g' : ' n')}>{a.status==='cancelled' ? 'Otkazano' : active ? 'Potvrđeno' : 'Završeno'}</span>
      </div>
      {active && <button className="ghost" style={{ marginTop: 10 }} onClick={() => onCancel(a.id)}>Otkaži termin</button>}
    </div>
  )
}