import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as CapacitorApp } from '@capacitor/app'
import { supabase } from './lib/supabase'
import App from './App.jsx'

// Kad se Google/Apple login vrati u app preko lumen:// adrese
// (umesto kroz obican brauzer), Capacitor javlja to preko ovog
// dogadjaja. Izvucemo token iz adrese i rucno ulogujemo korisnika.
CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  if (url.includes('access_token')) {
    const hashPart = url.split('#')[1]
    if (!hashPart) return
    const params = new URLSearchParams(hashPart)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token })
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)