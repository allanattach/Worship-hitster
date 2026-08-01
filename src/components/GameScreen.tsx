import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'
import { findTrackUri, playTrackUri } from '../lib/spotifyApi'
import { MysteryCard } from './MysteryCard'
import { PlayerSwitcher } from './PlayerSwitcher'
import { Timeline } from './Timeline'
import { WinnerScreen } from './WinnerScreen'

interface GameScreenProps {
  state: GameState
  onDraw: () => void
  onPlace: (insertIndex: number) => void
  onNext: () => void
  onViewPlayer: (index: number) => void
  onNewGame: () => void
  spotifyConnected: boolean
  getValidAccessToken: () => Promise<string | null>
  spotifyDeviceId: string | null
  spotifyReady: boolean
  isPaused: boolean
  playbackError: string | null
  togglePlay: () => void
  activateElement: () => Promise<void>
}

export function GameScreen({
  state,
  onDraw,
  onPlace,
  onNext,
  onViewPlayer,
  onNewGame,
  spotifyConnected,
  getValidAccessToken,
  spotifyDeviceId,
  spotifyReady,
  isPaused,
  playbackError,
  togglePlay,
  activateElement,
}: GameScreenProps) {
  const { players, currentPlayerIndex, viewingPlayerIndex, phase, currentCard, lastResult, targetCards } = state
  const currentPlayer = players[currentPlayerIndex]
  const viewingPlayer = players[viewingPlayerIndex]
  const isOwnTurn = viewingPlayerIndex === currentPlayerIndex
  const [trackError, setTrackError] = useState<string | null>(null)
  const lastPlayedCardId = useRef<string | null>(null)

  // Unlock audio while we are still inside the click event, then draw. The
  // play request itself fires from an effect a few async hops later, which
  // mobile browsers would otherwise treat as autoplay and silently block.
  const handleDraw = () => {
    if (spotifyConnected) void activateElement()
    onDraw()
  }

  useEffect(() => {
    if (!currentCard || state.currentCardRevealed) return
    if (lastPlayedCardId.current === currentCard.id) return
    lastPlayedCardId.current = currentCard.id
    if (!spotifyConnected || !spotifyDeviceId) return

    let cancelled = false
    setTrackError(null)
    ;(async () => {
      const token = await getValidAccessToken()
      if (!token || cancelled) return
      const uri = await findTrackUri(token, currentCard)
      if (!uri) {
        if (!cancelled) setTrackError('Kunne ikke finde sangen på Spotify.')
        return
      }
      try {
        await playTrackUri(token, spotifyDeviceId, uri)
      } catch (e) {
        if (!cancelled) setTrackError(e instanceof Error ? e.message : 'Afspilning fejlede.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentCard, state.currentCardRevealed, spotifyConnected, spotifyDeviceId, getValidAccessToken])

  if (phase === 'gameover' && state.winnerId) {
    const winner = players.find((p) => p.id === state.winnerId)
    if (winner) return <WinnerScreen winner={winner} onNewGame={onNewGame} />
  }

  return (
    <div className="game-screen">
      <div className="turn-banner">
        <span className="turn-banner-label">Nu er det</span>
        <span className="turn-banner-name">{currentPlayer.name}s tur</span>
        {!isOwnTurn && <span className="viewing-badge">Du kigger på {viewingPlayer.name}s bræt</span>}
      </div>

      <PlayerSwitcher
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        viewingPlayerIndex={viewingPlayerIndex}
        onView={onViewPlayer}
        targetCards={targetCards}
      />

      <section className="board-section">
        <h3 className="board-heading">{viewingPlayer.name}s tidslinje</h3>
        <Timeline
          board={viewingPlayer.board}
          interactive={isOwnTurn && phase === 'placing'}
          onSelectGap={onPlace}
          lastResult={isOwnTurn ? lastResult : null}
        />
      </section>

      <section className="mystery-section">
        <MysteryCard
          phase={phase}
          currentCard={currentCard}
          lastResult={lastResult}
          currentPlayerName={currentPlayer.name}
          spotifyConnected={spotifyConnected}
          spotifyReady={spotifyReady}
          isPaused={isPaused}
          playbackError={playbackError ?? trackError}
          onDraw={handleDraw}
          onTogglePlay={togglePlay}
          onNext={onNext}
        />
      </section>
    </div>
  )
}
