import { Settings as Gear } from 'lucide-react'
// ============================================================
// Skeleton loading blokovi — zamena za "Učitavanje…" tekst.
// Svaki blok je siva kartica koja "pulsira" (shimmer) dok se
// pravi sadržaj ne učita. Koristi se svuda gde je ranije stajao
// samo tekst "Učitavanje…".
// ============================================================

export function SkeletonLine({ w = '100%', h = 14, r = 6, style }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="card skel-card">
      <SkeletonLine w="60%" h={16} style={{ marginBottom: 10 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} w={i === lines - 1 ? '40%' : '85%'} style={{ marginBottom: 6 }} />
      ))}
    </div>
  )
}

// Grid skeleton za izbor radnika (2 kolone, kao wpick-grid)
export function SkeletonWorkerGrid({ count = 4 }) {
  return <GearLoader />
}

// Lista skeleton redova (za usluge, termine, itd.)
export function SkeletonRows({ count = 3 }) {
  return <GearLoader />
}

// Mali zupcanik koji se okrece dok se sadrzaj ucitava.
export function GearLoader() {
  return (
    <div className="gear-loader" role="status" aria-label="Učitavanje">
      <Gear size={26} strokeWidth={1.75} />
    </div>
  )
}