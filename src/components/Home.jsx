import { CATEGORIES } from '../data/questions'

export default function Home({ stats, questionCount, onStartMock, onStartValues, onStartAll, onStartCategory, onStartMissed }) {
  const accuracy = stats.attempts ? Math.round(stats.correct / stats.attempts * 100) : 0
  const modes = [
    ['Full Mock Test', '20 questions · 5 values · 75% to pass', '20', onStartMock],
    ['Australian Values', 'Practise every values question', '★', onStartValues],
    ['Study All Questions', `Explore all ${questionCount} questions`, '∞', onStartAll],
    ['Review Missed Questions', `${stats.missedIds.length} saved for review`, '↻', onStartMissed]
  ]
  return <main>
    <header className="hero"><div className="brand-mark">CB</div><div><p className="eyebrow">CITIZENSHIP TEST TRAINER</p><h1>Common Bond</h1><p className="hero-subtitle">Study with confidence, one question at a time.</p></div></header>
    <section className="intro-card"><p>Practise with independent questions based on the testable topics in <em>Australian Citizenship: Our Common Bond</em>.</p><p className="small-text">The real test has 20 questions. Pass by answering at least 15 correctly, including all 5 Australian values questions.</p></section>
    <section className="stats-grid" aria-label="Practice statistics"><div className="stat-card"><span>Answers</span><strong>{stats.attempts}</strong></div><div className="stat-card"><span>Accuracy</span><strong>{accuracy}%</strong></div><div className="stat-card"><span>Best mock</span><strong>{stats.bestMockPct == null ? '—' : `${stats.bestMockPct}%`}</strong></div></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">PRACTISE</p><h2>Choose a mode</h2></div><div className="mode-list">{modes.map(([label, detail, icon, action], index) => <button key={label} type="button" className={`mode-card ${index === 0 ? 'primary' : ''}`} onClick={action} disabled={index === 3 && !stats.missedIds.length}><span className="mode-icon">{icon}</span><span className="mode-content"><strong>{label}</strong><small>{detail}</small></span><span className="arrow" aria-hidden="true">→</span></button>)}</div></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">TOPICS</p><h2>Study by category</h2></div><div className="category-grid">{CATEGORIES.map(category => <button type="button" className="category-button" key={category} onClick={() => onStartCategory(category)}><span>{category}</span><span aria-hidden="true">→</span></button>)}</div></section>
    <footer className="home-footer">Independent practice tool. Check the <a href="https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond" target="_blank" rel="noreferrer">official booklet</a> before your test.</footer>
  </main>
}
