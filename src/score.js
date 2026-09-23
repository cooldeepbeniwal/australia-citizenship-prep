export function scoreQuiz(answeredQuestions, isMock) {
  const total = answeredQuestions.length
  const correct = answeredQuestions.filter(item => item.isCorrect).length
  const percentage = total ? Math.round(correct / total * 100) : 0
  const valuesQuestions = answeredQuestions.filter(item => item.question.category === 'Australian values')
  const valuesTotal = valuesQuestions.length
  const valuesCorrect = valuesQuestions.filter(item => item.isCorrect).length
  const passed = isMock
    ? total === 20 && valuesTotal === 5 && correct >= 15 && valuesCorrect === 5
    : percentage >= 75
  return { total, correct, percentage, valuesTotal, valuesCorrect, passed }
}
