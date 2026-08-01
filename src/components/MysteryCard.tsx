import type { GamePhase, PlacedCard, Player, RoundResult } from '../types'

interface MysteryCardProps {
  phase: GamePhase
  currentCard: PlacedCard | null
  lastResult: RoundResult | null
  currentPlayerName: string
  challenger: Player | null
  challengers: Player[]
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
  onClaimToken: () => void
  onStartChallenge: (playerId: string) => void
  onAbortChallenge: () => void
}

export function MysteryCard({
  phase,
  currentCard,
  lastResult,
  currentPlayerName,
  challenger,
  challengers,
  spotifyConnected,
  spotifyReady,
  isPaused,
  playbackError,
  unplayable,
  onDraw,
  onTogglePlay,
  onRedraw,
  onNext,
  onClaimToken,
  onStartChallenge,
  onAbortChallenge,
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

        <div className="mystery-actions">
          {spotifyConnected && (
            <button type="button" className="btn btn-secondary btn-small" onClick={onTogglePlay} disabled={!spotifyReady}>
              {isPaused ? '▶ Afspil' : '⏸ Pause'}
            </button>
          )}
          <button
            type="button"
            className={`btn btn-small ${unplayable ? 'btn-primary' : 'btn-secondary'}`}
            onClick={onRedraw}
          >
            ↻ Nyt kort
          </button>
        </div>

        {playbackError && (
          <p className="mystery-error">
            {playbackError}
            {unplayable && ' Træk et nyt kort i stedet.'}
          </p>
        )}
      </div>
    )
  }

  if (phase === 'challenge' && currentCard && challenger) {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">
          <span className="vinyl" aria-hidden="true" />
        </div>
        <p className="challenge-banner">
          {challenger.name} byder ind og har betalt en brik
        </p>
        <p className="mystery-hint">
          Placér sangen på {challenger.name}s egen tidslinje. Rammer {challenger.name} rigtigt, vindes kortet –
          ellers er brikken tabt.
        </p>
        <button type="button" className="btn btn-secondary btn-small" onClick={onAbortChallenge}>
          Fortryd budet
        </button>
      </div>
    )
  }

  if ((phase === 'reveal' || phase === 'gameover') && currentCard && lastResult) {
    const stolen = lastResult.challengerCorrect === true
    const challengeFailed = lastResult.challengerId != null && lastResult.challengerCorrect === false
    return (
      <div className="mystery-card">
        <div
          className={`mystery-card-face mystery-card-face--reveal ${
            lastResult.correct || stolen ? 'mystery-card-face--correct' : 'mystery-card-face--wrong'
          }`}
        >
          {currentCard.albumImageUrl && <img className="reveal-art" src={currentCard.albumImageUrl} alt="" />}
          <span className="reveal-year">{currentCard.year}</span>
          <span className="reveal-title">{currentCard.title}</span>
          <span className="reveal-artist">{currentCard.artist}</span>
        </div>

        <p className={lastResult.correct ? 'result-correct' : 'result-wrong'}>
          {lastResult.correct ? '✓ Rigtig placeret!' : '✗ Forkert placering'}
        </p>

        {stolen && <p className="result-correct">✓ Kortet blev snuppet af den der bød ind!</p>}
        {challengeFailed && <p className="result-wrong">✗ Budet ramte også forkert – brikken er tabt.</p>}

        {phase === 'reveal' && !lastResult.tokenAwarded && (
          <button type="button" className="btn btn-secondary btn-small token-btn" onClick={onClaimToken}>
            ● Kunne også titel og kunstner → giv {currentPlayerName} en brik
          </button>
        )}
        {lastResult.tokenAwarded && <p className="token-awarded">● {currentPlayerName} fik en brik</p>}

        {phase === 'reveal' && challengers.length > 0 && (
          <div className="challenge-offer">
            <p className="challenge-offer-label">Ved en anden hvornår sangen er fra? Byd ind for én brik:</p>
            <div className="mystery-actions">
              {challengers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => onStartChallenge(p.id)}
                >
                  {p.name} ({p.tokens}●)
                </button>
              ))}
            </div>
          </div>
        )}

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
