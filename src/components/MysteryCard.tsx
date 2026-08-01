import type { GamePhase, PlacedCard, RoundResult } from '../types'

interface MysteryCardProps {
  phase: GamePhase
  currentCard: PlacedCard | null
  lastResult: RoundResult | null
  currentPlayerName: string
  spotifyConnected: boolean
  spotifyReady: boolean
  isPaused: boolean
  playbackError: string | null
  /** True once we know this track cannot be played, so the redraw is offered up front. */
  unplayable: boolean
  onDraw: () => void
  onTogglePlay: () => void
  onRedraw: () => void
  onNext: () => void
}

export function MysteryCard({
  phase,
  currentCard,
  lastResult,
  currentPlayerName,
  spotifyConnected,
  spotifyReady,
  isPaused,
  playbackError,
  unplayable,
  onDraw,
  onTogglePlay,
  onRedraw,
  onNext,
}: MysteryCardProps) {
  if (phase === 'playing') {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">
          <span className="vinyl" aria-hidden="true" />
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onDraw}>
          Afspil sang
        </button>
        {!spotifyConnected && <p className="mystery-hint">Forbind til Spotify for at høre sangene under spillet.</p>}
      </div>
    )
  }

  if (phase === 'placing' && currentCard) {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">
          <span className={`vinyl ${spotifyConnected && !isPaused ? 'vinyl--spinning' : ''}`} aria-hidden="true" />
        </div>
        <p className="mystery-hint">
          Placér sangen på {currentPlayerName}s tidslinje – tryk på et af <strong>+</strong>-felterne, hvor du tror
          den hører til.
        </p>

        {spotifyConnected && (
          <div className="mystery-actions">
            <button type="button" className="btn btn-secondary btn-small" onClick={onTogglePlay} disabled={!spotifyReady}>
              {isPaused ? '▶ Afspil' : '⏸ Pause'}
            </button>
            <button
              type="button"
              className={`btn btn-small ${unplayable ? 'btn-primary' : 'btn-secondary'}`}
              onClick={onRedraw}
            >
              ↻ Nyt kort
            </button>
          </div>
        )}
        {!spotifyConnected && (
          <button type="button" className="btn btn-secondary btn-small" onClick={onRedraw}>
            ↻ Nyt kort
          </button>
        )}

        {playbackError && (
          <p className="mystery-error">
            {playbackError}
            {unplayable && ' Træk et nyt kort i stedet.'}
          </p>
        )}
      </div>
    )
  }

  if ((phase === 'reveal' || phase === 'gameover') && currentCard && lastResult) {
    return (
      <div className="mystery-card">
        <div
          className={`mystery-card-face mystery-card-face--reveal ${
            lastResult.correct ? 'mystery-card-face--correct' : 'mystery-card-face--wrong'
          }`}
        >
          {currentCard.albumImageUrl && (
            <img className="reveal-art" src={currentCard.albumImageUrl} alt="" />
          )}
          <span className="reveal-year">{currentCard.year}</span>
          <span className="reveal-title">{currentCard.title}</span>
          <span className="reveal-artist">{currentCard.artist}</span>
        </div>
        <p className={lastResult.correct ? 'result-correct' : 'result-wrong'}>
          {lastResult.correct ? '✓ Rigtig placeret!' : '✗ Forkert placering – kortet kasseres.'}
        </p>
        {phase === 'reveal' && (
          <button type="button" className="btn btn-primary btn-lg" onClick={onNext}>
            Næste spiller
          </button>
        )}
      </div>
    )
  }

  return null
}
