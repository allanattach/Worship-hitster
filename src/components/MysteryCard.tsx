import type { GamePhase, RoundResult, Song } from '../types'

interface MysteryCardProps {
  phase: GamePhase
  currentCard: Song | null
  lastResult: RoundResult | null
  currentPlayerName: string
  spotifyConnected: boolean
  spotifyReady: boolean
  isPaused: boolean
  playbackError: string | null
  onDraw: () => void
  onTogglePlay: () => void
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
  onDraw,
  onTogglePlay,
  onNext,
}: MysteryCardProps) {
  if (phase === 'playing') {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">?</div>
        <button type="button" className="btn btn-primary" onClick={onDraw}>
          Afspil sang
        </button>
        {!spotifyConnected && <p className="mystery-hint">Forbind til Spotify for at høre sangene under spillet.</p>}
      </div>
    )
  }

  if (phase === 'placing' && currentCard) {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">?</div>
        <p className="mystery-hint">
          Placér sangen på {currentPlayerName}s tidslinje – tryk på et af {'"+"'}-felterne, hvor du tror den hører til.
        </p>
        {spotifyConnected && (
          <button type="button" className="btn btn-secondary" onClick={onTogglePlay} disabled={!spotifyReady}>
            {isPaused ? '▶ Afspil' : '⏸ Pause'}
          </button>
        )}
        {playbackError && <p className="mystery-error">{playbackError}</p>}
      </div>
    )
  }

  if ((phase === 'reveal' || phase === 'gameover') && currentCard && lastResult) {
    return (
      <div className="mystery-card">
        <div className={`mystery-card-face ${lastResult.correct ? 'mystery-card-face--correct' : 'mystery-card-face--wrong'}`}>
          <span className="reveal-year">{currentCard.year}</span>
          <span className="reveal-title">{currentCard.title}</span>
          <span className="reveal-artist">{currentCard.artist}</span>
        </div>
        <p className={lastResult.correct ? 'result-correct' : 'result-wrong'}>
          {lastResult.correct ? 'Rigtig placeret!' : 'Forkert placering – kortet kasseres.'}
        </p>
        {phase === 'reveal' && (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Næste spiller
          </button>
        )}
      </div>
    )
  }

  return null
}
