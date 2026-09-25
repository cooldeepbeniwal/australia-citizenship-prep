import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQuizAnswers, createQuizSession, quizSessionReducer } from '../src/quizSession.js'
import { scoreQuiz } from '../src/score.js'

test('choices can change before Next and survive back and forward navigation', () => {
  let state = createQuizSession(3)
  const act = action => { state = quizSessionReducer(state, action) }
  act({ type: 'select', choice: 0 })
  act({ type: 'select', choice: 2 })
  act({ type: 'next' })
  assert.equal(state.index, 1)
  // Going back also works before answering the next question.
  act({ type: 'previous' })
  assert.equal(state.selections[0], 2)
  act({ type: 'select', choice: 1 })
  act({ type: 'next' })
  act({ type: 'select', choice: 3 })
  act({ type: 'previous' })
  act({ type: 'next' })
  assert.deepEqual(state.selections, [1, 3, null])
})

test('navigation cannot skip unanswered questions or move outside the quiz', () => {
  let state = createQuizSession(1)
  state = quizSessionReducer(state, { type: 'previous' })
  assert.equal(state.index, 0)
  assert.equal(quizSessionReducer(state, { type: 'next' }), state)
  state = quizSessionReducer(state, { type: 'select', choice: 0 })
  state = quizSessionReducer(state, { type: 'next' })
  assert.equal(state.index, 0)
})

test('revisiting a values question scores only the latest choice without duplicate answers', () => {
  const questions = Array.from({ length: 20 }, (_, id) => ({
    id, answer: 0, category: id < 5 ? 'Australian values' : 'Australia and its people'
  }))
  let state = createQuizSession(20)
  for (let i = 0; i < 20; i++) {
    state = quizSessionReducer(state, { type: 'select', choice: 0 })
    state = quizSessionReducer(state, { type: 'next' })
  }
  for (let i = 0; i < 19; i++) state = quizSessionReducer(state, { type: 'previous' })
  state = quizSessionReducer(state, { type: 'select', choice: 1 })
  const answers = buildQuizAnswers(questions, state.selections)
  assert.equal(answers.length, 20)
  assert.equal(new Set(answers.map(item => item.question.id)).size, 20)
  const score = scoreQuiz(answers, true)
  assert.equal(score.correct, 19)
  assert.equal(score.valuesCorrect, 4)
  assert.equal(score.passed, false)
})
