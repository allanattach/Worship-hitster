import { songLinks } from '../lib/songLinks'
import type { GamePhase, PlacedCard, Player, RoundResult } from '../types'

interface MysteryCardProps {
  phase: GamePhase
  currentCard: PlacedCard | null
  lastResult: RoundResult | null
  currentPlayerName: string
  players: Player[]
  /** The player choosing a slot for their bid, during bidPlacing. */
  activeBidder: Player | null
  /** Who could still bid this round. */
  bidders: Player[]
  bidCount: number
  spotifyConnected: boolean
  spotifyReady: boolean
  isPaused: boolean
  playbackError: string | null
  /** True once we know this track cannot be played, so the redraw is offered up front. */
  unplayable: boolean
  onDraw: () => void
  onTogglePlay: () => void
  onRedraw: () => void
  onReveal: () => void
  onNext: () => void
  onClaimToken: () => void
  onStartBid: (playerId: string) => void
  onCancelBid: () => void
}

export function MysteryCard({
  phase,
  currentCard,
  lastResult,
  currentPlayerName,
  players,
  activeBidder,
  bidders,
  bidCount,
  spotifyConnected,
  spotifyReady,
  isPaused,
  playbackError,
  unplayable,
  onDraw,
  onTogglePlay,
  onRedraw,
  onReveal,
  onNext,
  onClaimToken,
  onStartBid,
  onCancelBid,
}: MysteryCardProps) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '?'

  const faceDown = (
    <div className="mystery-card-face mystery-card-face--back">
      <span className={`vinyl ${spotifyConnected && !isPaused ? 'vinyl--spinning' : ''}`} aria-hidden="true" />
    </div>
  )

  const playbackControls = (
    <div className="mystery-actions">
      {spotifyConnected && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onTogglePlay} disabled={!spotifyReady}>
          {isPaused ? '▶ Afspil' : '⏸ Pause'}
        </button>
      )}
    </div>
  )

  if (phase === 'playing') {
    return (
      <div className="mystery-card">
        <div className="mystery-card-face mystery-card-face--back">
          <span className="vinyl" aria-hidden="true" />
        </div>
        <div className="mystery-body">
          <button type="button" className="btn btn-primary btn-lg" onClick={onDraw}>
            Afspil sang
          </button>
          {!spotifyConnected && <p className="mystery-hint">Forbind til Spotify for at høre sangene under spillet.</p>}
        </div>
      </div>
    )
  }

  if (phase === 'placing' && currentCard) {
    return (
      <div className="mystery-card">
        {faceDown}
        <div className="mystery-body">
          <p className="mystery-hint">
            Placér sangen på {currentPlayerName}s tidslinje – tryk på et af <strong>+</strong>-felterne, hvor du tror
            den hører til.
          </p>
          <div className="mystery-actions">
            {spotifyConnected && (
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onTogglePlay}
                disabled={!spotifyReady}
              >
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
      </div>
    )
  }

  // Bidding happens with the card still face down — nobody has seen the year.
  if (phase === 'bidding' && currentCard) {
    return (
      <div className="mystery-card">
        {faceDown}
        <div className="mystery-body">
          <p className="mystery-hint">
            {currentPlayerName} har lagt kortet med bagsiden op. Inden det vendes, kan de andre byde ind – uden at
            kende årstallet.
          </p>
          {playbackControls}

          {bidders.length > 0 && (
            <div className="challenge-offer">
              <p className="challenge-offer-label">Tror du at vide hvornår sangen er fra? Byd ind for én brik:</p>
              <div className="mystery-actions">
                {bidders.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => onStartBid(p.id)}
                  >
                    {p.name} ({p.tokens}●)
                  </button>
                ))}
              </div>
            </div>
          )}

          {bidCount > 0 && (
            <p className="bid-count">
              {bidCount} bud afgivet – lagt med bagsiden op på {bidCount === 1 ? 'egen tidslinje' : 'egne tidslinjer'}
            </p>
          )}

          <button type="button" className="btn btn-primary btn-lg" onClick={onReveal}>
            Vend kortet
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'bidPlacing' && currentCard && activeBidder) {
    return (
      <div className="mystery-card">
        {faceDown}
        <div className="mystery-body">
          <p className="challenge-banner">{activeBidder.name} byder ind og har betalt en brik</p>
          <p className="mystery-hint">
            Placér sangen på {activeBidder.name}s egen tidslinje. Kortet er stadig ikke vendt – buddet er et blindt
            gæt, ligesom for {currentPlayerName}.
          </p>
          {playbackControls}
          <button type="button" className="btn btn-secondary btn-small" onClick={onCancelBid}>
            Fortryd budet
          </button>
        </div>
      </div>
    )
  }

  if ((phase === 'reveal' || phase === 'gameover') && currentCard && lastResult) {
    const bids = lastResult.bids ?? []
    const stolenBy = lastResult.wonByBidderId
    return (
      <div className="mystery-card">
        <div
          className={`mystery-card-face mystery-card-face--reveal ${
            lastResult.correct || stolenBy ? 'mystery-card-face--correct' : 'mystery-card-face--wrong'
          }`}
        >
          {currentCard.albumImageUrl && <img className="reveal-art" src={currentCard.albumImageUrl} alt="" />}
          <span className="reveal-year">{currentCard.year}</span>
          <span className="reveal-title">{currentCard.title}</span>
          <span className="reveal-artist">{currentCard.artist}</span>
        </div>

        <div className="mystery-body">
          <p className={lastResult.correct ? 'result-correct' : 'result-wrong'}>
            {lastResult.correct
              ? `✓ ${currentPlayerName} placerede rigtigt!`
              : `✗ ${currentPlayerName} placerede forkert`}
          </p>

          {bids.length > 0 && (
            <ul className="bid-results">
              {bids.map((bid) => (
                <li key={bid.playerId} className={bid.playerId === stolenBy ? 'bid-result--won' : undefined}>
                  {bid.playerId === stolenBy
                    ? `✓ ${nameOf(bid.playerId)} bød ind og snuppede kortet!`
                    : bid.correct
                      ? `• ${nameOf(bid.playerId)} bød rigtigt, men ${currentPlayerName} havde kortet først`
                      : `✗ ${nameOf(bid.playerId)} bød forkert – brikken er tabt`}
                </li>
              ))}
            </ul>
          )}

          <div className="song-links">
            {songLinks(currentCard).map((link) => (
              <a key={link.href} className="song-link" href={link.href} target="_blank" rel="noreferrer">
                {link.label} ↗
              </a>
            ))}
          </div>

          {phase === 'reveal' && !lastResult.tokenAwarded && (
            <button type="button" className="btn btn-secondary btn-small token-btn" onClick={onClaimToken}>
              ● Kunne også titel og kunstner → giv {currentPlayerName} en brik
            </button>
          )}
          {lastResult.tokenAwarded && <p className="token-awarded">● {currentPlayerName} fik en brik</p>}

          {phase === 'reveal' && (
            <button type="button" className="btn btn-primary btn-lg" onClick={onNext}>
              Næste spiller
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
