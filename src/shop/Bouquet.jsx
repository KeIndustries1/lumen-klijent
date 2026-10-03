// Živi crtež buketa / kutije / priveska. ISTI fajl je u kreatoru, klijentu i WorkIn-u.
import { drawing } from './engine'

const A = { position: 'absolute' }

export default function Bouquet({ shop, design, size = 300, keychain = false, style }) {
  const g = drawing(shop, design || {}, { keychain })
  const k = size / 300
  const wrapBack = keychain
    ? { left: 92, top: 146, width: 116, height: 92 }
    : { left: 36, top: 124, width: 228, height: 166 }
  const wrapFront = keychain
    ? { left: 106, top: 166, width: 88, height: 76 }
    : { left: 64, top: 172, width: 172, height: 124 }
  const sheen = 'linear-gradient(100deg,rgba(0,0,0,.07),rgba(255,255,255,.3) 42%,rgba(0,0,0,.09)),'
  const box = g.kind !== 'wrap'
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', ...style }} aria-hidden>
      <div style={{ ...A, left: 0, top: 0, width: 300, height: 300, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        {keychain && (
          <svg style={{ ...A, left: 128, top: 40 }} width="44" height="70" viewBox="0 0 44 70">
            <circle cx="22" cy="16" r="13" fill="none" stroke="#D9B45A" strokeWidth="4" />
            <path d="M22 29 V40 M22 44 V54 M22 58 V68" stroke="#D9B45A" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}

        {g.kind === 'wrap' && <div style={{ ...A, ...wrapBack, background: sheen + g.paper, filter: 'brightness(.9)', clipPath: 'polygon(0 0,100% 0,62% 100%,38% 100%)' }} />}
        {g.kind === 'box-round' && <div style={{ ...A, left: 38, top: 30, width: 224, height: 224, borderRadius: '50%', background: g.paper, boxShadow: `inset 0 0 0 10px ${g.paperDark}, 0 12px 26px rgba(0,0,0,.35)` }} />}
        {g.kind === 'box-square' && <div style={{ ...A, left: 44, top: 34, width: 212, height: 212, borderRadius: 18, background: g.paper, boxShadow: `inset 0 0 0 10px ${g.paperDark}, 0 12px 26px rgba(0,0,0,.35)` }} />}
        {g.kind === 'box-heart' && (
          <svg style={{ ...A, left: 0, top: 0, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.35))' }} width="300" height="300" viewBox="0 0 300 300">
            <path d="M150 284 C 46 214 6 150 30 92 C 52 40 118 34 150 84 C 182 34 248 40 270 92 C 294 150 254 214 150 284 Z" fill={g.paper} stroke={g.paperDark} strokeWidth="12" />
          </svg>
        )}

        {g.heads.map((h, i) => (
          <div key={i} style={{ ...A, left: h.x, top: h.y, width: h.w, height: h.h, borderRadius: h.rad, background: h.bg, boxShadow: '0 2px 5px rgba(0,0,0,.32)' }} />
        ))}
        {g.glitter.map((p, i) => (
          <div key={'g' + i} style={{ ...A, left: p.x, top: p.y, width: 5, height: 5, borderRadius: '50%', background: p.c, boxShadow: '0 0 6px 2px rgba(255,236,170,.9)' }} />
        ))}

        {g.kind === 'wrap' && <div style={{ ...A, ...wrapFront, background: sheen + g.paper, clipPath: 'polygon(0 0,100% 0,58% 100%,42% 100%)' }} />}

        {g.text && (
          <div style={{ ...A, left: box ? 70 : 72, top: box ? 236 : 196, width: box ? 160 : 156, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
            font: 'italic 600 17px Fraunces, Georgia, serif', color: box ? '#fff' : g.textColor,
            ...(box ? { background: 'rgba(0,0,0,.45)', borderRadius: 10, padding: '2px 0' } : {}) }}>{g.text}</div>
        )}
        {g.letters && (
          <div style={{ ...A, left: 150, top: box ? 196 : 246, transform: 'translateX(-50%)', padding: '2px 12px', borderRadius: 10, background: 'linear-gradient(180deg,#F6D98A,#D9A93A)',
            color: '#3A2430', font: '700 22px Fraunces, Georgia, serif', letterSpacing: 2, boxShadow: '0 4px 10px rgba(0,0,0,.3)', whiteSpace: 'nowrap' }}>{g.letters}</div>
        )}
        {g.bow && (
          <svg style={{ ...A, left: box ? 196 : 118, top: box ? 214 : 238 }} width="64" height="40" viewBox="0 0 64 40">
            <path d="M32 18 C20 2 4 6 8 18 C4 30 20 32 32 20 C44 32 60 30 56 18 C60 6 44 2 32 18Z" fill={g.bow} />
            <path d="M30 20 L22 40 M34 20 L42 40" stroke={g.bow} strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {g.crown && (
          <svg style={{ ...A, left: 126, top: box ? 22 : 14 }} width="48" height="32" viewBox="0 0 48 32">
            <path d="M4 28 L8 8 L18 18 L24 4 L30 18 L40 8 L44 28 Z" fill="#E5B74C" stroke="#B88A2A" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
        {g.butterflies && (
          <>
            <svg style={{ ...A, left: 30, top: 44 }} width="40" height="32" viewBox="0 0 40 32"><path d="M20 16 C12 0 0 4 4 14 C0 24 12 28 20 18 C28 28 40 24 36 14 C40 4 28 0 20 16Z" fill="#9FB8F2" stroke="#5B78C4" strokeWidth="1.2" /></svg>
            <svg style={{ ...A, left: 234, top: 30 }} width="32" height="26" viewBox="0 0 40 32"><path d="M20 16 C12 0 0 4 4 14 C0 24 12 28 20 18 C28 28 40 24 36 14 C40 4 28 0 20 16Z" fill="#F4B8CE" stroke="#C9688E" strokeWidth="1.2" /></svg>
          </>
        )}
        {g.toy && (
          <svg style={{ ...A, left: 14, top: 196 }} width="60" height="66" viewBox="0 0 60 66">
            <circle cx="14" cy="12" r="8" fill="#A97A52" /><circle cx="46" cy="12" r="8" fill="#A97A52" />
            <circle cx="30" cy="24" r="17" fill="#B98A5E" /><ellipse cx="30" cy="52" rx="20" ry="15" fill="#A97A52" />
            <ellipse cx="30" cy="29" rx="7" ry="5" fill="#E2C49E" /><circle cx="24" cy="20" r="2" fill="#2A1A12" /><circle cx="36" cy="20" r="2" fill="#2A1A12" />
            <path d="M24 44 Q30 49 36 44" stroke="#E9A3BC" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  )
}
