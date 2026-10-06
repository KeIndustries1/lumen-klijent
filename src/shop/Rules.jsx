// Pravila i uslovi poručivanja: duži tekst iz kreatora (svaki red posebno).
// Red VELIKIM SLOVIMA je naslov, red koji počinje sa "•" je stavka, prazan red je razmak.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { haptic } from '../lib/haptic'

const isHead = l => l.length < 70 && /[A-ZŠĐČĆŽ]/.test(l) && l === l.toUpperCase()

export function RulesText({ lines }) {
  const out = []
  let list = []
  const flush = k => { if (list.length) { out.push(<ul key={'u' + k} className="rules-ul">{list}</ul>); list = [] } }
  ;(lines || []).forEach((raw, k) => {
    const l = String(raw || '').trim()
    if (/^[•\-–]\s*/.test(l) && l.length > 1) { list.push(<li key={k}>{l.replace(/^[•\-–]\s*/, '')}</li>); return }
    flush(k)
    if (!l) return
    out.push(isHead(l) ? <h4 key={k} className="rules-h">{l}</h4> : <p key={k} className="rules-p">{l}</p>)
  })
  flush('end')
  return <div className="rules-text">{out}</div>
}

export const hasRules = shop => (shop.order?.rules || []).some(x => String(x || '').trim())

export function RulesSheet({ shop, lang, onClose }) {
  const L = (sr, en) => (lang === 'en' ? en : sr)
  return createPortal(
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal rules-modal" role="dialog" aria-modal="true" aria-label={L('Pravila i uslovi poručivanja', 'Ordering terms')} onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <b>{L('Pravila i uslovi', 'Terms')}</b>
          <button className="sheet-close" onClick={onClose} aria-label={L('Zatvori', 'Close')}>✕</button>
        </div>
        <RulesText lines={shop.order?.rules} />
      </div>
    </div>,
    document.body,
  )
}

// Dugme koje otvara pravila (početna strana)
export function RulesButton({ shop, lang }) {
  const [open, setOpen] = useState(false)
  if (!hasRules(shop)) return null
  return (
    <>
      <button className="rules-btn" onClick={() => { haptic('tap'); setOpen(true) }}>
        <span>{lang === 'en' ? 'Ordering terms' : 'Pravila i uslovi poručivanja'}</span><span aria-hidden>›</span>
      </button>
      {open && <RulesSheet shop={shop} lang={lang} onClose={() => setOpen(false)} />}
    </>
  )
}
