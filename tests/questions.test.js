import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTIONS, CATEGORIES } from '../src/data/questions.js'

test('bank supports a full 20 question mock with 5 values questions', () => {
  assert.equal(QUESTIONS.length, 102)
  assert.deepEqual(QUESTIONS.map(q => q.id), Array.from({ length: 102 }, (_, i) => i + 1))
  assert.ok(QUESTIONS.filter(q => q.category === 'Australian values').length >= 5)
  assert.ok(QUESTIONS.filter(q => q.category !== 'Australian values').length >= 15)
  assert.equal(CATEGORIES.length, 4)
})

test('every question is answerable and has a distinct set of choices', () => {
  for (const question of QUESTIONS) {
    assert.ok([1, 2, 3, 4].includes(question.part), `part ${question.id}`)
    assert.ok(CATEGORIES.includes(question.category), `category ${question.id}`)
    assert.ok(question.q.trim(), `prompt ${question.id}`)
    assert.equal(question.options.length, 4, `choices ${question.id}`)
    assert.equal(new Set(question.options).size, 4, `unique choices ${question.id}`)
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `answer ${question.id}`)
    assert.ok(question.explain.trim(), `explanation ${question.id}`)
  }
})
