export default function Results({
  result,
  onHome,
  onRetry
}) {
  const isMock =
    result.mode === 'mock'

  const verdict =
    result.passed
      ? 'You passed'
      : 'Keep practising'

  const missed =
    result.questions.filter(
      question => {
        const answer =
          result.answers.find(
            item =>
              item.questionId ===
              question.id
          )

        return !answer?.correct
      }
    )

  return (
    <main className="app-shell">
      <section className="results-header">
        <p className="eyebrow">
          RESULTS
        </p>

        <h1>
          {verdict}
        </h1>

        <p>
          {isMock
            ? 'Here is how you performed on your mock test.'
            : 'Here is how you performed in this practice session.'}
        </p>
      </section>

      <section className="score-card">
        <div
          className={`score-ring ${
            result.passed
              ? 'score-pass'
              : 'score-fail'
          }`}
        >
          <div className="score-inner">
            <strong>
              {result.percentage}%
            </strong>

            <span>
              {result.correct}/
              {result.total}
            </span>
          </div>
        </div>

        {isMock && (
          <div className="values-result">
            <div>
              <span>
                Australian values
              </span>

              <strong>
                {result.valuesCorrect}/
                {result.valuesTotal}
              </strong>
            </div>

            <div
              className={
                result.valuesCorrect ===
                result.valuesTotal
                  ? 'result-good'
                  : 'result-bad'
              }
            >
              {result.valuesCorrect ===
              result.valuesTotal
                ? 'All values questions correct'
                : 'You need all values questions correct'}
            </div>
          </div>
        )}
      </section>

      <section className="result-summary">
        <div>
          <span>
            Correct
          </span>

          <strong>
            {result.correct}
          </strong>
        </div>

        <div>
          <span>
            Incorrect
          </span>

          <strong>
            {result.total -
              result.correct}
          </strong>
        </div>

        <div>
          <span>
            Score
          </span>

          <strong>
            {result.percentage}%
          </strong>
        </div>
      </section>

      {missed.length > 0 && (
        <section className="missed-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                REVIEW
              </p>

              <h2>
                Questions to revisit
              </h2>
            </div>
          </div>

          <div className="missed-list">
            {missed.map(
              question => (
                <div
                  className="missed-card"
                  key={question.id}
                >
                  <span className="missed-number">
                    {question.id}
                  </span>

                  <p>
                    {question.q}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      <section className="result-actions">
        <button
          className="next-button"
          onClick={onRetry}
        >
          Try again
          <span>
            ↻
          </span>
        </button>

        <button
          className="secondary-button"
          onClick={onHome}
        >
          Back to home
        </button>
      </section>

      <footer className="home-footer">
        <p>
          Common Bond is an independent
          preparation tool. Always check
          the current official Department of
          Home Affairs material before your
          test.
        </p>
      </footer>
    </main>
  )
}
