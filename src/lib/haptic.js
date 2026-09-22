// ============================================================
// Tanak sloj oko Vibration API-ja. Radi na Android Chrome/PWA.
// Na iPhone Safariju ne postoji podrška (Apple ograničenje) —
// poziv jednostavno ništa ne radi, bez greške.
// ============================================================
export function haptic(kind = 'tap') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  const patterns = {
    tap: 8,        // selekcija kartice, tab prelaz
    success: [10, 40, 18],   // potvrda termina
    warning: [12, 30, 12, 30, 12],  // greška / upozorenje
  }
  navigator.vibrate(patterns[kind] ?? 8)
}