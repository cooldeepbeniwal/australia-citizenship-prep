export function createQuizSession(count) {
  return { index: 0, selections: Array(count).fill(null) }
}

export function quizSessionReducer(state, action) {
  switch (action.type) {
    case 'select':
      return {
        ...state,
        selections: state.selections.map((choice, index) =>
          index === state.index ? action.choice : choice)
      }
    case 'previous':
      return { ...state, index: Math.max(0, state.index - 1) }
    case 'next':
      if (state.selections[state.index] == null) return state
      return { ...state, index: Math.min(state.selections.length - 1, state.index + 1) }
    default:
      return state
  }
}

export function buildQuizAnswers(questions, selections) {
  return questions.map((question, index) => ({
    question,
    selected: selections[index],
    isCorrect: selections[index] === question.answer
  }))
}
