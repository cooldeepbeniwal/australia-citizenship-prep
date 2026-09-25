import { useEffect, useState } from 'react'

import Home from './components/Home'
import Quiz from './components/Quiz'
import Results from './components/Results'
import Account from './components/Account'
import MockAccess from './components/MockAccess'
import { QUESTIONS } from './data/questions'
import { scoreQuiz } from './score'
import { supabase } from './supabase'
import { appendPending, cacheKey, guestImportEvent, GUEST_KEY, pendingKey, progressFromEvents, readGuestStats, readPending } from './progress'

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function App() {
  const [screen, setScreen] = useState('home')
  const [stats, setStats] = useState(readGuestStats)
  const [user, setUser] = useState(null)
  const [syncStatus, setSyncStatus] = useState('')
  const [queue, setQueue] = useState([])
  const [quizTitle, setQuizTitle] = useState('')
  const [quizMode, setQuizMode] = useState('')
  const [result, setResult] = useState(null)
  const [mockAccessUserId, setMockAccessUserId] = useState(null)
  const [accessStatus, setAccessStatus] = useState('checking')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const hasMockAccess = Boolean(user && mockAccessUserId === user.id && accessStatus === 'ready')

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getUser().then(({ data }) => { if (active) setUser(data.user) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function checkMockAccess(account = user) {
    if (!account || !supabase) return
    setAccessStatus('checking')
    const { data, error } = await supabase.from('mock_access').select('status')
      .eq('user_id', account.id).maybeSingle()
    if (error) {
      setAccessStatus('error')
      return
    }
    setMockAccessUserId(data?.status === 'paid' ? account.id : null)
    setAccessStatus('ready')
  }

  useEffect(() => {
    setMockAccessUserId(null)
    if (!user) { setAccessStatus('ready'); return }
    let active = true
    setAccessStatus('checking')
    supabase.from('mock_access').select('status').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        setMockAccessUserId(!error && data?.status === 'paid' ? user.id : null)
        setAccessStatus(error ? 'error' : 'ready')
      })
    return () => { active = false }
  }, [user?.id])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout') !== 'success') return
    setScreen('paywall')
    setCheckoutMessage('Payment submitted. Checking for your purchase confirmation…')
    if (!user) return
    let attempts = 0
    const timer = setInterval(async () => {
      attempts += 1
      const { data } = await supabase.from('mock_access').select('status')
        .eq('user_id', user.id).maybeSingle()
      if (data?.status === 'paid') {
        setMockAccessUserId(user.id)
        setAccessStatus('ready')
        setCheckoutMessage('Payment confirmed. Your mock test is unlocked.')
        clearInterval(timer)
      } else if (attempts >= 15) {
        setCheckoutMessage('Still waiting for confirmation. Use “Already paid? Check access” in a moment.')
        clearInterval(timer)
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [user?.id])

  async function beginCheckout() {
    if (!user || accessStatus !== 'ready' || hasMockAccess || checkoutBusy) return
    setCheckoutBusy(true)
    setCheckoutMessage('')
    try {
      const { data, error } = await supabase.functions.invoke('create-mock-checkout')
      if (error || !data?.url) throw error || new Error('Checkout is unavailable.')
      const target = new URL(data.url)
      if (target.protocol !== 'https:' || !target.hostname.endsWith('.stripe.com')) throw new Error('Invalid checkout destination.')
      window.location.assign(target.href)
    } catch (error) {
      setCheckoutMessage(error?.message || 'Could not start checkout. Please try again.')
      setCheckoutBusy(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setStats(readGuestStats())
      setSyncStatus('')
      return
    }
    let active = true
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey(user.id)) || '[]')
      setStats(progressFromEvents([...cached, ...readPending(user.id)]))
    } catch (error) { console.warn('Could not read cached progress.', error) }
    async function sync() {
      setSyncStatus('Syncing progress…')
      try {
        const imported = guestImportEvent(user.id)
        if (imported) appendPendingOnce(user.id, imported)
        const pending = readPending(user.id)
        if (pending.length) {
          const { error } = await supabase.from('progress_events').upsert(
            pending.map(({ id, ...payload }) => ({ id, user_id: user.id, payload })),
            { onConflict: 'id', ignoreDuplicates: true }
          )
          if (error) throw error
          localStorage.setItem(pendingKey(user.id), '[]')
        }
        const { data, error } = await supabase.from('progress_events').select('id, payload, created_at').eq('user_id', user.id).order('created_at', { ascending: true }).order('id', { ascending: true })
        if (error) throw error
        if (active) {
          try { localStorage.setItem(cacheKey(user.id), JSON.stringify(data)) }
          catch (error) { console.warn('Could not cache progress.', error) }
          setStats(progressFromEvents(data))
          setSyncStatus('Progress synced.')
        }
      } catch (error) {
        if (active) {
          try {
            const cached = JSON.parse(localStorage.getItem(cacheKey(user.id)) || '[]')
            setStats(progressFromEvents([...cached, ...readPending(user.id)]))
          } catch (cacheError) { console.warn('Could not read cached progress.', cacheError) }
          setSyncStatus('Could not sync. Your practice is saved on this device; try Sync now when online.')
          console.warn('Progress sync failed.', error)
        }
      }
    }
    sync()
    const onOnline = () => sync()
    window.addEventListener('online', onOnline)
    return () => { active = false; window.removeEventListener('online', onOnline) }
  }, [user])

  function refreshProgress() {
    if (user) setUser({ ...user })
  }

  function appendPendingOnce(userId, event) {
    if (!readPending(userId).some((item) => item.id === event.id)) appendPending(userId, event)
  }

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
    if (!hasMockAccess) { setScreen('paywall'); return }
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
    const isMock = quizMode === 'mock'
    const { total, correct, percentage, valuesTotal, valuesCorrect, passed } = scoreQuiz(answeredQuestions, isMock)

    const missedIds = answeredQuestions
      .filter((item) => !item.isCorrect)
      .map((item) => item.question.id)

    if (user) {
      const event = {
        id: crypto.randomUUID(), kind: 'quiz', mode: quizMode,
        total, correct, percentage,
        answers: answeredQuestions.map((item) => ({ id: item.question.id, correct: item.isCorrect }))
      }
      try {
        appendPending(user.id, event)
        setStats((previous) => progressFromEvents([{ kind: 'import', stats: previous }, event]))
        setSyncStatus('Saved on this device. Syncing…')
        refreshProgress()
      } catch (error) {
        setSyncStatus('Could not save progress on this device. Please check available storage.')
        console.warn('Could not save progress.', error)
      }
    } else setStats((previous) => {
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

      try { localStorage.setItem(GUEST_KEY, JSON.stringify(nextStats)) }
      catch (error) { console.warn('Could not save guest progress.', error) }
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

    if (result.mode === 'mock' && !hasMockAccess) { setScreen('paywall'); return }
    startQuiz(
      result.questions.map((item) => item.question),
      result.title,
      result.mode
    )
  }

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <><Home
          stats={stats}
          questionCount={QUESTIONS.length}
          onStartMock={startMock}
          onStartValues={startValues}
          onStartAll={startAll}
          onStartCategory={startCategory}
          onStartMissed={startMissed}
        /><Account user={user} syncStatus={syncStatus} onRefresh={refreshProgress} /></>
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

      {screen === 'paywall' && <MockAccess
        user={user}
        syncStatus={syncStatus}
        onRefreshProgress={refreshProgress}
        hasAccess={hasMockAccess}
        accessStatus={accessStatus}
        message={checkoutMessage}
        busy={checkoutBusy}
        onCheckout={beginCheckout}
        onCheckAccess={() => checkMockAccess()}
        onStart={startMock}
        onHome={goHome}
      />}

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
