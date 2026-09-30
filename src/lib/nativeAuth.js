import { SocialLogin } from '@capgo/capacitor-social-login'
import { supabase } from './supabase'

const WEB_CLIENT_ID = '1008980664202-kd6dlj3a9d3dnbb14fc0q41iilm2k77j.apps.googleusercontent.com'
const IOS_CLIENT_ID = '1008980664202-va6sk0n0f43o6fbfbviqiuamfg8qhqmq.apps.googleusercontent.com'

let ready = false
async function init() {
  if (ready) return
  await SocialLogin.initialize({
    google: { webClientId: WEB_CLIENT_ID, iOSClientId: IOS_CLIENT_ID, mode: 'online' },
    apple: {},
  })
  ready = true
}

function randomNonce() {
  const a = new Uint8Array(32)
  crypto.getRandomValues(a)
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('')
}

// provider: 'google' | 'apple'. Nativni dijalog, bez browsera.
export async function nativeSignIn(provider) {
  await init()
  const raw = randomNonce()
  const digest = await sha256Hex(raw)
  const options = provider === 'google'
    ? { scopes: ['email', 'profile'], nonce: digest }
    : { scopes: ['email', 'name'], nonce: digest }
  const res = await SocialLogin.login({ provider, options })
  const r = res?.result ?? res
  const idToken = r?.idToken
  if (!idToken) throw new Error('Prijava nije vratila token.')
  const { error } = await supabase.auth.signInWithIdToken({ provider, token: idToken, nonce: raw })
  if (error) throw error
}
