import { useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { PlayerSetup } from './components/PlayerSetup'
import { RulesModal } from './components/RulesModal'
import { SpotifyConnect } from './components/SpotifyConnect'
import { TopBar } from './components/TopBar'
import { useFullscreen } from './hooks/useFullscreen'
import { useGameState } from './hooks/useGameState'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme, toggleTheme } = useTheme()
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const {
    state,
    canUndo,
    undo,
    startGame,
    draw,
    redraw,
    attachMeta,
    place,
    next,
    claimToken,
    reveal,
    bidStart,
    bidCancel,
    bidPlace,
    viewPlayer,
    resetGame,
    rematch,
    standings,
    resetStandings,
  } = useGameState()
  const spotifyAuth = useSpotifyAuth()
  const spotifyPlayer = useSpotifyPlayer(spotifyAuth.connected, spotifyAuth.getValidAccessToken)
  const [showRules, setShowRules] = useState(false)

  function handleNewGame() {
    // Only worth warning about while a game is actually in progress — once it
    // is won there is nothing left to lose.
    const inProgress = state.phase !== 'setup' && state.phase !== 'gameover'
    if (inProgress && !window.confirm('Start et nyt spil? Det nuværende spil bliver slettet.')) {
      return
    }
    resetGame()
  }

  return (
    <div className="app-shell">
      <TopBar
        theme={theme}
        onToggleTheme={toggleTheme}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onShowRules={() => setShowRules(true)}
        onNewGame={state.phase !== 'setup' ? handleNewGame : undefined}
        onUndo={state.phase !== 'setup' ? undo : undefined}
        canUndo={canUndo}
      />

      <main className="app-main">
        {state.phase === 'setup' ? (
          <PlayerSetup onStart={startGame} standings={standings} onResetStandings={resetStandings}>
            <SpotifyConnect
              clientId={spotifyAuth.clientId}
              connected={spotifyAuth.connected}
              busy={spotifyAuth.busy}
              error={spotifyAuth.error}
              onConnect={spotifyAuth.connect}
              onDisconnect={spotifyAuth.disconnect}
            />
          </PlayerSetup>
        ) : (
          <GameScreen
            state={state}
            onDraw={draw}
            onRedraw={redraw}
            onAttachMeta={attachMeta}
            onPlace={place}
            onNext={next}
            onViewPlayer={viewPlayer}
            onNewGame={handleNewGame}
            onRematch={rematch}
            standings={standings}
            onUndo={undo}
            canUndo={canUndo}
            onClaimToken={claimToken}
            onReveal={reveal}
            onStartBid={bidStart}
            onCancelBid={bidCancel}
            onPlaceBid={bidPlace}
            spotifyConnected={spotifyAuth.connected}
            getValidAccessToken={spotifyAuth.getValidAccessToken}
            spotifyDeviceId={spotifyPlayer.deviceId}
            spotifyReady={spotifyPlayer.ready}
            isPaused={spotifyPlayer.isPaused}
            playbackError={spotifyPlayer.playbackError}
            togglePlay={spotifyPlayer.togglePlay}
            activateElement={spotifyPlayer.activateElement}
          />
        )}
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

export default App
