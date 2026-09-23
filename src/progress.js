export const DEFAULT_STATS = { attempts: 0, correct: 0, bestMockPct: null, missedIds: [] }
export const GUEST_KEY = 'common-bond-stats'
const importKey = (userId) => `common-bond-guest-import-${userId}`

export function readGuestStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(GUEST_KEY) || 'null')
    if (saved && typeof saved.attempts === 'number') return { ...DEFAULT_STATS, ...saved }
  } catch (error) {
    console.warn('Could not read guest progress.', error)
  }
  return { ...DEFAULT_STATS }
}

export function guestImportEvent(userId) {
  const stats = readGuestStats()
  if (!stats.attempts) return null
  let id = localStorage.getItem(importKey(userId))
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(importKey(userId), id)
  }
  return { id, kind: 'import', stats }
}

export function progressFromEvents(events) {
  const stats = { ...DEFAULT_STATS, missedIds: [] }
  const missed = new Set()
  for (const event of events) {
    const data = event.payload || event
    if (data.kind === 'import') {
      stats.attempts += data.stats.attempts || 0
      stats.correct += data.stats.correct || 0
      if (data.stats.bestMockPct != null) stats.bestMockPct = Math.max(stats.bestMockPct ?? 0, data.stats.bestMockPct)
      for (const id of data.stats.missedIds || []) missed.add(id)
    } else if (data.kind === 'quiz') {
      stats.attempts += data.total
      stats.correct += data.correct
      if (data.mode === 'mock') stats.bestMockPct = Math.max(stats.bestMockPct ?? 0, data.percentage)
      for (const answer of data.answers) {
        if (answer.correct) missed.delete(answer.id)
        else missed.add(answer.id)
      }
    }
  }
  stats.missedIds = [...missed]
  return stats
}

export function pendingKey(userId) { return `common-bond-pending-${userId}` }
export function cacheKey(userId) { return `common-bond-cache-${userId}` }

export function readPending(userId) {
  try { return JSON.parse(localStorage.getItem(pendingKey(userId)) || '[]') }
  catch { return [] }
}

export function appendPending(userId, event) {
  const pending = readPending(userId)
  pending.push(event)
  localStorage.setItem(pendingKey(userId), JSON.stringify(pending))
}
