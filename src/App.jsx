import { useEffect, useState } from 'react'

import Home from './components/Home'
import Quiz from './components/Quiz'
import Results from './components/Results'
import { QUESTIONS } from './data/questions'

const DEFAULT_STATS = {
  attempts: 0,
  correct: 0,
  bestMockPct: null,
  missedIds: []
}

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function loadStats() {
  try {
    const saved = localStorage.getItem('common-bond-stats')

    if (saved) {
      return {
        ...DEFAULT_STATS,
        ...JSON.parse(saved)
      }
    }
  } catch (error) {
    console.warn('Could not load saved statistics.', error)
  }

  return DEFAULT_STATS
}

function App() {
  const [screen, setScreen] = useState('home')
  const [stats, setStats] = useState(loadStats)
  const [queue, setQueue] = useState([])
  const [quizTitle, setQuizTitle] = useState('')
  const [quizMode, setQuizMode] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(
        'common-bond-stats',
        JSON.stringify(stats)
      )
    } catch (error) {
      console.warn('Could not save statistics.', error)
    }
  }, [stats])

  function startQuiz(questionList, title, mode) {
    if (!questionList || questionList.length === 0) {
      return
    }

    setQueue(shuffle(questionList))
    setQuizTitle(title)
    setQuizMode(mode)
    setResult(null)
    setScreen('quiz')
  }

  function startMock() {
    const values = QUESTIONS.filter(
      (question) => question.category === 'Australian values'
    )

    const nonValues = QUESTIONS.filter(
      (question) => question.category !== 'Australian values'
    )

    const selectedValues = shuffle(values).slice(0, 5)
    const selectedNonValues = shuffle(nonValues).slice(0, 15)

    startQuiz(
      [...selectedValues, ...selectedNonValues],
      'Full Mock Test',
      'mock'
    )
  }

  function startValues() {
    const values = QUESTIONS.filter(
      (question) => question.category === 'Australian values'
    )

    startQuiz(values, 'Australian Values', 'values')
  }

  function startAll() {
    startQuiz(
      QUESTIONS,
      'Study All Questions',
      'all'
    )
  }

  function startCategory(category) {
    const categoryQuestions = QUESTIONS.filter(
      (question) => question.category === category
    )

    startQuiz(
      categoryQuestions,
      category,
      'category'
    )
  }

  function startMissed() {
    const missedQuestions = QUESTIONS.filter(
      (question) => stats.missedIds.includes(question.id)
    )

    startQuiz(
      missedQuestions,
      'Review Missed Questions',
      'missed'
    )
  }

  function finishQuiz(answeredQuestions) {
    const total = answeredQuestions.length

    const correct = answeredQuestions.filter(
      (item) => item.isCorrect
    ).length

    const percentage =
      total > 0
        ? Math.round((correct / total) * 100)
        : 0

    const valuesQuestions = answeredQuestions.filter(
      (item) => item.question.category === 'Australian values'
    )

    const valuesCorrect = valuesQuestions.filter(
      (item) => item.isCorrect
    ).length

    const valuesTotal = valuesQuestions.length

    const isMock = quizMode === 'mock'

    const valuesPassed =
      !isMock || valuesCorrect === valuesTotal

    const passed =
      percentage >= 75 && valuesPassed

    const missedIds = answeredQuestions
      .filter((item) => !item.isCorrect)
      .map((item) => item.question.id)

    setStats((previous) => {
      const existingMissed = previous.missedIds || []

      const newlyMissed = [
        ...new Set([
          ...existingMissed,
          ...missedIds
        ])
      ]

      const answeredCorrectly = answeredQuestions
        .filter((item) => item.isCorrect)
        .map((item) => item.question.id)

      const cleanedMissed = newlyMissed.filter(
        (id) => !answeredCorrectly.includes(id)
      )

      const nextStats = {
        ...previous,
        attempts: previous.attempts + total,
        correct: previous.correct + correct,
        missedIds: cleanedMissed
      }

      if (
        isMock &&
        (
          previous.bestMockPct === null ||
          percentage > previous.bestMockPct
        )
      ) {
        nextStats.bestMockPct = percentage
      }

      return nextStats
    })

    setResult({
      title: quizTitle,
      mode: quizMode,
      total,
      correct,
      percentage,
      passed,
      valuesCorrect,
      valuesTotal,
      questions: answeredQuestions
    })

    setScreen('results')
  }

  function goHome() {
    setScreen('home')
    setQueue([])
    setResult(null)
  }

  function retryQuiz() {
    if (!result || !result.questions) {
      return
    }

    startQuiz(
      result.questions.map((item) => item.question),
      result.title,
      result.mode
    )
  }

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <Home
          stats={stats}
          questionCount={QUESTIONS.length}
          onStartMock={startMock}
          onStartValues={startValues}
          onStartAll={startAll}
          onStartCategory={startCategory}
          onStartMissed={startMissed}
        />
      )}

      {screen === 'quiz' && (
        <Quiz
          questions={queue}
          title={quizTitle}
          mode={quizMode}
          onFinish={finishQuiz}
          onExit={goHome}
        />
      )}

      {screen === 'results' && result && (
        <Results
          result={result}
          onRetry={retryQuiz}
          onHome={goHome}
        />
      )}
    </div>
  )
}

export default App
