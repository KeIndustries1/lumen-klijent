import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { CATEGORY, catFor, initials } from './images'
import { useLang } from './lib/i18n'
import { SkeletonWorkerGrid, SkeletonRows } from './Skeleton'
import { haptic } from './lib/haptic'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { createPortal } from 'react-dom'

const din = v => v.toLocaleString('sr-RS') + ' din'
const dur = m => m>=60 ? (m%60 ? Math.floor(m/60)+'h '+(m%60)+'min' : Math.floor(m/60)+'h') : m+'min'

export default function Services({ salon, openWorkerId, onBookWith, onActiveChange }) {
  const { t } = useLang()
  const [workers, setWorkers] = useState(null)
  const [active, setActive] = useState(null)
  useEffect(() => { onActiveChange?.(!!active) }, [active])

  useEffect(() => {
    supabase.from('workers').select('*').eq('salon_id', salon.id).eq('active', true).order('sort')
      .then(({ data }) => setWorkers(data || []))
  }, [salon.id])

  useEffect(() => {
    if (openWorkerId && workers && workers.length) setActive(workers.find(w => w.id === openWorkerId) || null)
  }, [openWorkerId, workers])

  if (workers === null) {
    return (
      <div className="anim-in" style={{ padding: 16 }}>
        <div className="pagehead"><h2>{t('servicesTitle')}</h2><p>{t('servicesSub')}</p></div>
        <SkeletonWorkerGrid />
      </div>
    )
  }

  return (
    <LayoutGroup>
      <AnimatePresence mode="popLayout">
        {active ? (
          <PriceList key="pricelist" worker={active} onBack={() => setActive(null)} onBookWith={onBookWith} />
        ) : (
          <motion.div key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ padding: 16 }}
          >
            <div className="pagehead"><h2>{t('servicesTitle')}</h2><p>{t('servicesSub')}</p></div>
            <div className="wpick-grid">
              {workers.map(w => {
                const c = catFor(w.role_sr)
                return (
                  <button key={w.id} className="wpick-card person"
                    onClick={() => { haptic('tap'); setActive(w) }}>
                    {w.name ? (
                      <motion.div layoutId={`avatar-${w.id}`} className="person-head"
                        transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 } }}
                        style={w.photo_url ? undefined : { background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>
                        {w.photo_url ? <img src={w.photo_url} alt="" /> : initials(w.name)}
                      </motion.div>
                    ) : (
                      <motion.div layoutId={`avatar-${w.id}`} className="person-head skel"
                        transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 } }} />
                    )}
                    <div className="person-body"
                      style={{ background: `linear-gradient(180deg, ${c.from}55 0%, var(--card) 70%)` }}>
                      {w.name ? (
                        <>
                          <span className="name">{w.name}</span>
                          <span className="person-role">{w.role_sr}</span>
                        </>
                      ) : (
                        <>
                          <span className="skel" style={{ display: 'block', height: 12, width: '70%', borderRadius: 4, margin: '0 auto 8px' }} />
                          <span className="skel" style={{ display: 'block', height: 10, width: '50%', borderRadius: 4, margin: '0 auto' }} />
                        </>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}

function PriceList({ worker, onBack, onBookWith }) {
  const [services, setServices] = useState(null)
  const [multi, setMulti] = useState(false)
  const [chosen, setChosen] = useState([])
  const c = catFor(worker.role_sr)

  useEffect(() => {
    supabase.from('services').select('*').eq('worker_id', worker.id).eq('active', true).eq('is_vip', false).order('sort')
      .then(({ data }) => setServices(data || []))
  }, [worker.id])

  function toggle(id) { setChosen(x => x.includes(id) ? x.filter(v=>v!==id) : [...x, id]) }
  function toggleMulti() { setMulti(m => !m); setChosen([]) }

  const total = services ? chosen.reduce((a,id) => a + services.find(s=>s.id===id).price_rsd, 0) : 0

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ padding: 16, paddingBottom: chosen.length ? 90 : 16 }}
    >
      <button className="backbtn" onClick={onBack}>‹ Nazad</button>

      <div className="pagehead" style={{ marginBottom: 14 }}><h2>Usluge i cene</h2></div>

      <div className="card row" style={{ marginBottom: 14 }}>
        {worker.name ? (
          <>
            <motion.div layoutId={`avatar-${worker.id}`} className="wthumb-avatar"
              transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 } }}
              style={worker.photo_url ? undefined : { background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>
              {worker.photo_url ? <img src={worker.photo_url} alt="" className="wthumb-photo" /> : initials(worker.name)}
            </motion.div>
            <span className="grow">
              <span className="name">{worker.name}</span><br/>
              <span className="tiny">{worker.role_sr}</span>
            </span>
          </>
        ) : (
          <>
            <motion.div layoutId={`avatar-${worker.id}`} className="wthumb-avatar skel"
              transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 } }} />
            <span className="grow">
              <span className="skel" style={{ display: 'block', height: 13, width: '50%', borderRadius: 4, marginBottom: 5 }} />
              <span className="skel" style={{ display: 'block', height: 10, width: '35%', borderRadius: 4 }} />
            </span>
          </>
        )}
        <button className={'multitoggle' + (multi ? ' on' : '')} onClick={toggleMulti}>
          {multi ? 'Poništi' : 'Izaberi više'}
        </button>
      </div>

      {services === null ? <SkeletonRows /> : services.length === 0 ? (
        <div className="stack">
          {[0, 1].map(i => (
            <div key={i} className="svcrow">
              <div className="svcicon skel" />
              <span className="grow">
                <span className="skel" style={{ display: 'block', height: 12, width: '60%', borderRadius: 4, marginBottom: 5 }} />
                <span className="skel" style={{ display: 'block', height: 9, width: '30%', borderRadius: 4 }} />
              </span>
              <span className="skel" style={{ display: 'block', height: 12, width: 44, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stack">
          {services.map(s => {
            const sel = chosen.includes(s.id)
            return (
              <div key={s.id} className={'svcrow' + (sel ? ' sel' : '')}>
                <div className="svcicon" style={s.image_url ? undefined : { background: `linear-gradient(150deg, ${c.from}, ${c.to})` }}>
                  {s.image_url ? <img src={s.image_url} alt="" className="svcicon-photo" /> : c.icon}
                </div>
                <span className="grow svc-text">
                  <span className="name">{s.name_sr}</span>
                  <span className="svc-meta">{dur(s.duration_min)}</span>
                  <span className="svc-price">{din(s.price_rsd)}</span>
                </span>
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

      {multi && chosen.length > 0 && createPortal((
        <div className="selectbar">
          <span>{chosen.length} {chosen.length===1?'usluga':'usluge'}</span>
          <b className="grow" style={{textAlign:'right', marginRight:12}}>{din(total)}</b>
          <button className="btn" style={{width:'auto', padding:'12px 20px'}} onClick={() => onBookWith(worker, chosen)}>
            Nastavi
          </button>
        </div>
      ), document.body)}
    </motion.div>
  )
}