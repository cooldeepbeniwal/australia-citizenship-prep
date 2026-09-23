export default function Results({ result, onHome, onRetry }) {
  const isMock = result.mode === 'mock'
  const missed = result.questions.filter(item => !item.isCorrect)
  return <main>
    <section className="results-header"><p className="eyebrow">RESULTS</p><h1>{result.passed ? (isMock ? 'You passed' : 'Great work') : 'Keep practising'}</h1><p>{isMock ? 'Here is how you performed on your mock test.' : 'Here is how you performed in this practice session.'}</p></section>
    <section className="score-card"><div className={`score-ring ${result.passed ? 'score-pass' : 'score-fail'}`} style={{ '--score': result.percentage }} role="img" aria-label={`Score ${result.percentage} percent`}><div className="score-inner"><strong>{result.percentage}%</strong><span>{result.correct}/{result.total}</span></div></div>{isMock && <div className="values-result"><div><span>Australian values</span><strong>{result.valuesCorrect}/{result.valuesTotal}</strong></div><div className={result.valuesCorrect === 5 ? 'result-good' : 'result-bad'}>{result.valuesCorrect === 5 ? 'All values questions correct' : 'You need all 5 values questions correct'}</div></div>}</section>
    <section className="result-summary"><div><span>Correct</span><strong>{result.correct}</strong></div><div><span>Incorrect</span><strong>{result.total - result.correct}</strong></div><div><span>Score</span><strong>{result.percentage}%</strong></div></section>
    {missed.length > 0 && <section className="missed-section"><div className="section-heading"><p className="eyebrow">REVIEW</p><h2>Questions to revisit</h2></div><div className="missed-list">{missed.map(({ question, selected }) => <article className="missed-card" key={question.id}><span className="missed-number">{question.id}</span><div><p>{question.q}</p><small>Your answer: {question.options[selected]}<br />Correct: {question.options[question.answer]}<br />{question.explain}</small></div></article>)}</div></section>}
    <section className="result-actions"><button type="button" className="next-button" onClick={onRetry}>Try again <span aria-hidden="true">↻</span></button><button type="button" className="secondary-button" onClick={onHome}>Back to home</button></section>
    <footer className="home-footer">Common Bond is an independent preparation tool. Check the current official Department of Home Affairs material before your test.</footer>
  </main>
}
