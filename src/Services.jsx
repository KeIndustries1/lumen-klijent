import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { CATEGORY, catFor, WORKER_LEVEL, initials } from './images'
import { useLang } from './lib/i18n'

const din = v => v.toLocaleString('sr-RS') + ' din'
const dur = m => m>=60 ? (m%60 ? Math.floor(m/60)+'h '+(m%60)+'min' : Math.floor(m/60)+'h') : m+'min'

export default function Services({ salon, openWorkerId, onBookWith }) {
  const { t } = useLang()
  const [workers, setWorkers] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    supabase.from('workers').select('*').eq('salon_id', salon.id).eq('active', true).order('sort')
      .then(({ data }) => setWorkers(data || []))
  }, [salon.id])

  useEffect(() => {
    if (openWorkerId && workers.length) setActive(workers.find(w => w.id === openWorkerId) || null)
  }, [openWorkerId, workers])

  if (active) {
    return <PriceList worker={active} onBack={() => setActive(null)} onBookWith={onBookWith} />
  }

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('servicesTitle')}</h2><p>{t('servicesSub')}</p></div>
      <div className="wpick-grid">
        {workers.map(w => {
          const c = catFor(w.role_sr)
          return (
            <button key={w.id} className="wpick-card" onClick={() => setActive(w)}>
              <div className="wpick-avatar" style={{ background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>
                {initials(w.name)}
              </div>
              <div className="wpick-info">
                <span className="wpick-level">{WORKER_LEVEL[w.name] || w.role_sr}</span>
                <span className="name">{w.name}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PriceList({ worker, onBack, onBookWith }) {
  const [services, setServices] = useState(null)
  const [multi, setMulti] = useState(false)
  const [chosen, setChosen] = useState([])
  const c = catFor(worker.role_sr)

  useEffect(() => {
    supabase.from('services').select('*').eq('worker_id', worker.id).eq('active', true).order('sort')
      .then(({ data }) => setServices(data || []))
  }, [worker.id])

  function toggle(id) { setChosen(x => x.includes(id) ? x.filter(v=>v!==id) : [...x, id]) }
  function toggleMulti() { setMulti(m => !m); setChosen([]) }

  const total = services ? chosen.reduce((a,id) => a + services.find(s=>s.id===id).price_rsd, 0) : 0

  return (
    <div className="anim-in" style={{ padding: 16, paddingBottom: chosen.length ? 90 : 16 }}>
      <button className="ghost" style={{ marginBottom: 12 }} onClick={onBack}>← Nazad</button>

      <div className="card row" style={{ marginBottom: 14 }}>
        <div className="wthumb-avatar" style={{ background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>
          {initials(worker.name)}
        </div>
        <span className="grow">
          <span className="name">{worker.name}</span><br/>
          <span className="tiny">{WORKER_LEVEL[worker.name] || worker.role_sr}</span>
        </span>
        <button className={'multitoggle' + (multi ? ' on' : '')} onClick={toggleMulti}>
          {multi ? 'Poništi' : 'Izaberi više'}
        </button>
      </div>

      {services === null ? <p className="tiny">Učitavanje…</p> : (
        <div className="stack">
          {services.map(s => {
            const sel = chosen.includes(s.id)
            return (
              <div key={s.id} className={'svcrow' + (sel ? ' sel' : '')}>
                <div className="svcicon" style={{ background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>{c.icon}</div>
                <span className="grow">
                  <span className="name">{s.name_sr}</span><br/>
                  <span className="tiny">{dur(s.duration_min)}</span>
                </span>
                <span className="price">{din(s.price_rsd)}</span>
                {multi ? (
                  <button className={'chk-round' + (sel ? ' sel' : '')} onClick={() => toggle(s.id)}>{sel ? '✓' : ''}</button>
                ) : (
                  <button className="svcrow-btn" onClick={() => onBookWith(worker, [s.id])}>Rezerviši</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {multi && chosen.length > 0 && (
        <div className="selectbar">
          <span>{chosen.length} {chosen.length===1?'usluga':'usluge'}</span>
          <b className="grow" style={{textAlign:'right', marginRight:12}}>{din(total)}</b>
          <button className="btn" style={{width:'auto', padding:'12px 20px'}} onClick={() => onBookWith(worker, chosen)}>
            Nastavi
          </button>
        </div>
      )}
    </div>
  )
}