import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { supabase } from './supabase'

// app: 'klijent' ili 'workin'
export async function initPush(app) {
  if (!Capacitor.isNativePlatform()) return   // u browseru ne radi ništa

  let perm = await PushNotifications.checkPermissions()
  if (perm.receive === 'prompt') perm = await PushNotifications.requestPermissions()
  if (perm.receive !== 'granted') return

  await PushNotifications.removeAllListeners()

  PushNotifications.addListener('registration', async ({ value }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('push_tokens').upsert({
      token: value, user_id: user.id, app, updated_at: new Date().toISOString(),
    })
  })

  PushNotifications.addListener('registrationError', e => console.error('Push greška:', e))

  // Android ne prikazuje notifikaciju dok je aplikacija otvorena (iOS to radi sam,
  // preko presentationOptions). Zato je ovde prikazujemo kao lokalnu notifikaciju.
  if (Capacitor.getPlatform() === 'android') {
    try { await LocalNotifications.requestPermissions() } catch (e) { /* ignorisi */ }
    PushNotifications.addListener('pushNotificationReceived', async (n) => {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Date.now() % 2147483647),
            title: n.title || '',
            body: n.body || '',
          }],
        })
      } catch (e) { console.error('Lokalna notifikacija greška:', e) }
    })
  }

  await PushNotifications.register()
}
