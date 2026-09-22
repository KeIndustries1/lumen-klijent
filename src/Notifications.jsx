import { useLang } from './lib/i18n'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { SkeletonRows } from './Skeleton'
import { haptic } from './lib/haptic'

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'sada'
  if (s < 3600) return `pre ${Math.floor(s/60)} min`
  if (s < 86400) return `pre ${Math.floor(s/3600)}h`
  if (s < 172800) return 'juče'
  return `pre ${Math.floor(s/86400)} dana`
}

export default function Notifications({ client, salon }) {
  const { t } = useLang()
  const [tab, setTab] = useState('new')   // 'new' nove poruke · 'archive' arhiva
  const [rows, setRows] = useState(null)
  const [cursor] = useState(client.last_read_notifications_at)   // zamrznuto na trenutak otvaranja taba

  useEffect(() => {
    supabase.from('notifications').select('*').eq('salon_id', salon.id)
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setRows(data || []))
    // pomeri kursor tek POSLE ucitavanja — trenutne "nove" poruke ostaju vidljive
    // kao nove za ovu posetu, a slede'ci put ce biti u arhivi
    supabase.from('clients').update({ last_read_notifications_at: new Date().toISOString() })
      .eq('id', client.id)
  }, [])

  const list = rows === null ? null : rows.filter(n => tab === 'new' ? n.created_at > cursor : n.created_at <= cursor)

  return (
    <div className="anim-in" style={{ padding: 16 }}>
      <div className="pagehead"><h2>{t('notifTitle')}</h2></div>

      <div className="subtabs">
        <button className={tab==='new'?'on':''} onClick={() => { haptic('tap'); setTab('new') }}>Nove poruke</button>
        <button className={tab==='archive'?'on':''} onClick={() => { haptic('tap'); setTab('archive') }}>Arhiva</button>
      </div>

      {list === null ? <SkeletonRows count={3} /> : list.length === 0 ? (
        <div className="card"><p className="tiny">{tab==='new' ? 'Nemate novih poruka.' : 'Arhiva je prazna.'}</p></div>
      ) : list.map(n => (
        <div key={n.id} className={'notif' + (tab==='new' ? ' unread' : '')}>
          {tab==='new' && <span className="dot" />}
          <div className="grow">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="name">{n.title}</span>
              <span className="tiny">{timeAgo(n.created_at)}</span>
            </div>
            <div className="tiny" style={{ marginTop: 2 }}>{n.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}