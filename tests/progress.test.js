import test from 'node:test'
import assert from 'node:assert/strict'
import { progressFromEvents } from '../src/progress.js'

test('guest import and attempts combine while a correct retry clears a missed question', () => {
  const stats = progressFromEvents([
    { payload: { kind: 'import', stats: { attempts: 10, correct: 7, bestMockPct: 70, missedIds: [3, 4] } } },
    { payload: { kind: 'quiz', mode: 'mock', total: 2, correct: 1, percentage: 50, answers: [{ id: 3, correct: true }, { id: 5, correct: false }] } }
  ])
  assert.deepEqual(stats, { attempts: 12, correct: 8, bestMockPct: 70, missedIds: [4, 5] })
})
