import { useState } from 'react'

export default function Quiz({ questions, title, mode, onFinish, onExit }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const question = questions[index]
  if (!question) return null
  const answered = selected !== null
  const isCorrect = answered && selected === question.answer
  const isMock = mode === 'mock'
  function next() {
    if (!answered) return
    const nextAnswers = [...answers, { question, selected, isCorrect }]
    if (index + 1 === questions.length) onFinish(nextAnswers)
    else { setAnswers(nextAnswers); setIndex(index + 1); setSelected(null) }
  }
  return <main className="quiz-shell">
    <header className="quiz-header"><button type="button" className="icon-button" onClick={onExit} aria-label="Exit quiz">←</button><div className="quiz-progress"><div className="progress-track" role="progressbar" aria-label="Quiz progress" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}><div className="progress-fill" style={{ width: `${(index + 1) / questions.length * 100}%` }} /></div><span>{index + 1}/{questions.length}</span></div></header>
    <section className="question-card"><p className="eyebrow">{title.toUpperCase()}</p><div className="question-meta"><span className="question-category">{question.category}</span>{question.category === 'Australian values' && <span className="values-badge">VALUES</span>}</div><h1 className="question-text">{question.q}</h1><div className="answers">{question.options.map((option, choice) => {
      const correct = answered && choice === question.answer
      const incorrect = answered && choice === selected && !isCorrect
      return <button type="button" key={choice} className={`answer-button ${!isMock && correct ? 'correct' : ''} ${!isMock && incorrect ? 'incorrect' : ''}`} disabled={answered} aria-pressed={answered && selected === choice} onClick={() => setSelected(choice)}><span className="answer-letter">{String.fromCharCode(65 + choice)}</span><span className="answer-text">{option}</span><span className="answer-status" aria-hidden="true">{!isMock && correct ? '✓' : !isMock && incorrect ? '×' : answered && selected === choice ? '●' : ''}</span></button>
    })}</div>{answered && !isMock && <div className={`explanation ${isCorrect ? 'explanation-correct' : 'explanation-incorrect'}`} role="status"><p className="explanation-title">{isCorrect ? 'Correct' : `Correct answer: ${question.options[question.answer]}`}</p><p>{question.explain}</p></div>}{answered && <button type="button" className="next-button" onClick={next}>{index + 1 === questions.length ? 'See results' : 'Next question'}<span aria-hidden="true">→</span></button>}</section>
  </main>
}
