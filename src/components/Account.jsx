import { useState } from 'react'
import { supabase } from '../supabase'

export default function Account({ user, syncStatus, onRefresh }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (!supabase) return null

  async function sendLink(event) {
    event.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin }
    })
    setMessage(error ? error.message : 'Check your email for a sign-in link. Open it on this device.')
    setBusy(false)
  }

  async function signOut() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(error.message)
    setBusy(false)
  }

  return <section className="account-card" aria-label="Your account">
    <h2>Your progress</h2>
    {user ? <>
      <p>Signed in as <strong>{user.email}</strong>. Your completed practice can sync across devices.</p>
      {syncStatus && <p role="status">{syncStatus}</p>}
      <div className="account-actions"><button type="button" onClick={onRefresh} disabled={busy}>Sync now</button><button type="button" onClick={signOut} disabled={busy}>Sign out</button></div>
    </> : <>
      <p>Practise free without an account, or sign in to save progress across devices. Your existing practice on this device will be added once.</p>
      <form onSubmit={sendLink} className="account-form"><label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button disabled={busy} type="submit">Email me a sign-in link</button></form>
    </>}
    {message && <p role="status">{message}</p>}
  </section>
}
