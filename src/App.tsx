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
  const { state, startGame, draw, redraw, attachMeta, place, next, viewPlayer, resetGame } = useGameState()
  const spotifyAuth = useSpotifyAuth()
  const spotifyPlayer = useSpotifyPlayer(spotifyAuth.connected, spotifyAuth.getValidAccessToken)
  const [showRules, setShowRules] = useState(false)

  function handleNewGame() {
    if (state.phase !== 'setup' && !window.confirm('Start et nyt spil? Det nuværende spil bliver slettet.')) {
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
      />

      <main className="app-main">
        {state.phase === 'setup' ? (
          <PlayerSetup onStart={startGame}>
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
