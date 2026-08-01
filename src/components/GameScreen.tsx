import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'
import { eligibleBidders } from '../lib/gameLogic'
import { findTrack, playTrackUri } from '../lib/spotifyApi'
import { CardDetails } from './CardDetails'
import { MysteryCard } from './MysteryCard'
import { PlayerSwitcher } from './PlayerSwitcher'
import { CARD_WIDTH_BASE, Timeline } from './Timeline'
import { WinnerScreen } from './WinnerScreen'
import { ZoomControls } from './ZoomControls'

interface GameScreenProps {
  state: GameState
  onDraw: () => void
  onRedraw: () => void
  onAttachMeta: (songId: string, meta: { uri?: string; albumImageUrl?: string }) => void
  onPlace: (insertIndex: number) => void
  onNext: () => void
  onViewPlayer: (index: number) => void
  onNewGame: () => void
  onRematch: () => void
  standings: { name: string; wins: number }[]
  onUndo: () => void
  canUndo: boolean
  onClaimToken: () => void
  onReveal: () => void
  onStartBid: (playerId: string) => void
  onCancelBid: () => void
  onPlaceBid: (insertIndex: number) => void
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
  onRedraw,
  onAttachMeta,
  onPlace,
  onNext,
  onViewPlayer,
  onNewGame,
  onRematch,
  standings,
  onUndo,
  canUndo,
  onClaimToken,
  onReveal,
  onStartBid,
  onCancelBid,
  onPlaceBid,
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
  const activeBidder = players.find((p) => p.id === state.activeBidderId) ?? null
  const bidders = eligibleBidders(state)

  // While a bid is being placed, the board on screen belongs to the bidder and
  // it is their guess the taps record.
  const isBidderBoard = phase === 'bidPlacing' && activeBidder?.id === viewingPlayer.id
  const boardInteractive = (isOwnTurn && phase === 'placing') || isBidderBoard
  const handleGap = isBidderBoard ? onPlaceBid : onPlace

  // Face-down markers: the player in turn has a hidden placement from the
  // moment they commit, and each bidder has one once they have bid.
  const pendingIndex =
    isOwnTurn && state.pendingPlacement !== null && (phase === 'bidding' || phase === 'bidPlacing')
      ? state.pendingPlacement
      : (state.bids.find((b) => b.playerId === viewingPlayer.id)?.insertIndex ?? null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [fit, setFit] = useState(true)
  const [resolvedWidth, setResolvedWidth] = useState(CARD_WIDTH_BASE)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const lastHandledCardId = useRef<string | null>(null)

  // Unlock audio while still inside the click, then draw. The play request
  // fires from the effect below, which mobile browsers would block as autoplay.
  const handleDraw = () => {
    if (spotifyConnected) void activateElement()
    setTrackError(null)
    onDraw()
  }

  const handleRedraw = () => {
    if (spotifyConnected) void activateElement()
    setTrackError(null)
    onRedraw()
  }

  useEffect(() => {
    if (!currentCard || state.currentCardRevealed) return
    if (lastHandledCardId.current === currentCard.id) return
    lastHandledCardId.current = currentCard.id
    if (!spotifyConnected || !spotifyDeviceId) return

    let cancelled = false
    setTrackError(null)
    ;(async () => {
      const token = await getValidAccessToken()
      if (!token || cancelled) return
      const track = await findTrack(token, currentCard)
      if (cancelled) return
      if (!track) {
        setTrackError('Sangen findes ikke på Spotify.')
        return
      }
      // Cover art is worth keeping even if playback then fails.
      onAttachMeta(currentCard.id, { uri: track.uri, albumImageUrl: track.albumImageUrl })
      try {
        await playTrackUri(token, spotifyDeviceId, track.uri)
      } catch (e) {
        if (!cancelled) setTrackError(e instanceof Error ? e.message : 'Sangen kunne ikke afspilles.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentCard, state.currentCardRevealed, spotifyConnected, spotifyDeviceId, getValidAccessToken, onAttachMeta])

  // A fold-out belongs to one board in one situation; close it when either moves
  // on, so it never describes a card that is no longer under it.
  useEffect(() => {
    setSelectedCardIndex(null)
  }, [viewingPlayerIndex, phase])

  if (phase === 'gameover' && state.winnerId) {
    const winner = players.find((p) => p.id === state.winnerId)
    if (winner) {
      return (
        <WinnerScreen
          winner={winner}
          standings={standings}
          onRematch={onRematch}
          onNewGame={onNewGame}
          onUndo={onUndo}
          canUndo={canUndo}
        />
      )
    }
  }

  const combinedError = trackError ?? playbackError

  return (
    <div className="game-screen">
      <div className="turn-banner">
        <span className="turn-banner-label">Nu er det</span>
        <span className="turn-banner-name">{currentPlayer.name}s tur</span>
        {!isOwnTurn && (
          <button type="button" className="viewing-badge" onClick={() => onViewPlayer(currentPlayerIndex)}>
            Du kigger på {viewingPlayer.name}s bræt – tilbage til {currentPlayer.name}
          </button>
        )}
      </div>

      <PlayerSwitcher
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        viewingPlayerIndex={viewingPlayerIndex}
        onView={onViewPlayer}
        targetCards={targetCards}
      />

      <section className="board-section">
        <div className="board-header">
          <h3 className="board-heading">
            {isBidderBoard ? `${viewingPlayer.name}s tidslinje – byder ind` : `${viewingPlayer.name}s tidslinje`}
            <span className="board-count">
              {viewingPlayer.board.length} / {targetCards}
            </span>
          </h3>
          <ZoomControls
            zoom={zoom}
            fit={fit}
            resolvedWidth={resolvedWidth}
            onZoomChange={setZoom}
            onFitChange={setFit}
          />
        </div>
        <Timeline
          board={viewingPlayer.board}
          onSelectCard={(index) => setSelectedCardIndex((prev) => (prev === index ? null : index))}
          selectedCardIndex={selectedCardIndex}
          interactive={boardInteractive}
          onSelectGap={handleGap}
          lastResult={isOwnTurn ? lastResult : null}
          zoom={zoom}
          fit={fit}
          onResolvedWidth={setResolvedWidth}
          pendingIndex={pendingIndex}
        />
        {selectedCardIndex !== null && viewingPlayer.board[selectedCardIndex] && (
          <CardDetails
            card={viewingPlayer.board[selectedCardIndex]}
            onClose={() => setSelectedCardIndex(null)}
          />
        )}
      </section>

      <section className="mystery-section">
        <MysteryCard
          phase={phase}
          currentCard={currentCard}
          lastResult={lastResult}
          currentPlayerName={currentPlayer.name}
          players={players}
          activeBidder={activeBidder}
          bidders={bidders}
          bidCount={state.bids.length}
          spotifyConnected={spotifyConnected}
          spotifyReady={spotifyReady}
          isPaused={isPaused}
          playbackError={combinedError}
          unplayable={!!combinedError}
          onDraw={handleDraw}
          onTogglePlay={togglePlay}
          onRedraw={handleRedraw}
          onReveal={onReveal}
          onNext={onNext}
          onClaimToken={onClaimToken}
          onStartBid={onStartBid}
          onCancelBid={onCancelBid}
        />
      </section>
    </div>
  )
}
