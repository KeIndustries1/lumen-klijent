import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
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

  await PushNotifications.register()
}