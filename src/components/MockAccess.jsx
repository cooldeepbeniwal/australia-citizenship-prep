import Account from './Account'

export default function MockAccess({ user, syncStatus, onRefreshProgress, hasAccess, accessStatus, message, busy, onCheckout, onCheckAccess, onStart, onHome }) {
  return <main className="mock-access-page">
    <button type="button" className="back-link" onClick={onHome}>← Back to practice</button>
    <section className="intro-card mock-access-card">
      <p className="eyebrow">FULL MOCK TEST</p>
      <h1>{hasAccess ? 'Your mock test is ready' : 'Unlock the full mock test'}</h1>
      <p>Practise with 20 questions, including 5 Australian values questions. See your score and review answers afterwards.</p>
      {!hasAccess && <p className="mock-price"><strong>A$4.99</strong> once per account · No subscription · Ad-free</p>}
      {!user && <p>Sign in below so your purchase can be linked to your account.</p>}
      {user && !hasAccess && <>
        <button type="button" className="next-button" onClick={onCheckout} disabled={busy || accessStatus === 'checking'}>Unlock for A$4.99</button>
        <button type="button" className="secondary-button" onClick={onCheckAccess} disabled={busy || accessStatus === 'checking'}>Already paid? Check access</button>
      </>}
      {user && hasAccess && <button type="button" className="next-button" onClick={onStart}>Start full mock test →</button>}
      {accessStatus === 'checking' && user && <p role="status">Checking your account…</p>}
      {accessStatus === 'error' && user && <p role="alert">Could not check your access. Try again when you are online.</p>}
      {message && <p role="status">{message}</p>}
      <p className="small-text">Values practice, study questions, topic practice and review remain free.</p>
    </section>
    {!user && <Account user={user} syncStatus={syncStatus} onRefresh={onRefreshProgress} />}
  </main>
}
