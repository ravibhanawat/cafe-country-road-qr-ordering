/* ------------------------------------------------------------------
   Signed table tokens.

   Problem: a plain ?table=5 URL can be edited by a guest to order for
   another table. To make that hard, each table QR encodes a short HMAC
   signature of the table number:

       ?t=5&k=<signature>

   The app recomputes the signature with a shared secret and only accepts
   the table if it matches. A guest who edits "5" to "8" gets an invalid
   signature and is blocked.

   IMPORTANT (read me): this raises the bar against casual URL editing,
   but because the secret ships in the front-end bundle it is NOT a true
   security boundary - a determined attacker could extract it. For real
   tamper-proofing, verify the token on a SERVER before accepting an order.
   See verifyTableTokenRemote() for where to plug that in.
------------------------------------------------------------------ */

// Change this for your cafe and keep it consistent with your QR generator.
// (Move to an env var / server when you add a backend.)
const SECRET = 'CCR_ccr-2024_changeme_secret'

const enc = new TextEncoder()

async function hmac(message) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  // base64url, trimmed to keep the QR short
  const bytes = new Uint8Array(sig)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 16)
}

// Constant-time-ish compare
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Create the signature for a table number (used by the QR generator). */
export async function signTable(table) {
  return hmac('table:' + table)
}

/** Build the full ordering URL for a table, e.g. for printing QR codes. */
export async function buildTableUrl(table, base = window.location.origin + window.location.pathname) {
  const k = await signTable(table)
  return base + '?t=' + table + '&k=' + k
}

/**
 * Read + verify the table from the current URL.
 * Returns { table, status }:
 *   status = 'ok'        -> valid signed token
 *   status = 'tampered'  -> table present but signature missing/invalid
 *   status = 'none'      -> no table in the URL at all
 */
export async function verifyTableFromURL(search = window.location.search) {
  const params = new URLSearchParams(search)
  const rawT = params.get('t') || params.get('table')
  const k = params.get('k')

  if (!rawT) return { table: null, status: 'none' }

  const table = parseInt(String(rawT).replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(table) || table <= 0) return { table: null, status: 'tampered' }

  // Legacy/unsigned ?table=N is treated as tampered so it can't be abused.
  if (!k) return { table, status: 'tampered' }

  const expected = await signTable(table)
  if (safeEqual(expected, k)) return { table, status: 'ok' }
  return { table, status: 'tampered' }
}

/**
 * Placeholder for the real fix: verify the token on your server before
 * accepting an order. Wire this to your backend when you add one.
 *
 *   const ok = await verifyTableTokenRemote(table, k)
 */
export async function verifyTableTokenRemote(/* table, k */) {
  // e.g. const r = await fetch('/api/verify-table?t='+table+'&k='+k)
  //      return (await r.json()).valid
  return null // not configured
}
