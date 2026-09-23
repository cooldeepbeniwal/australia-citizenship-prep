import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scoreQuiz } from '../src/score.js'

const answers = (valuesCorrect, otherCorrect) => [
  ...Array.from({ length: 5 }, (_, i) => ({ question: { category: 'Australian values' }, isCorrect: i < valuesCorrect })),
  ...Array.from({ length: 15 }, (_, i) => ({ question: { category: 'Government and the law' }, isCorrect: i < otherCorrect }))
]

test('mock requires 15 correct and all five values', () => {
  assert.equal(scoreQuiz(answers(5, 10), true).passed, true)
  assert.equal(scoreQuiz(answers(5, 9), true).passed, false)
  assert.equal(scoreQuiz(answers(4, 15), true).passed, false)
  assert.equal(scoreQuiz(answers(5, 9).slice(1), true).passed, false)
})

test('practice score uses its own question count', () => {
  assert.equal(scoreQuiz(answers(4, 0).slice(0, 5), false).percentage, 80)
  assert.equal(scoreQuiz([], false).passed, false)
})
