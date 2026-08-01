import { useState } from 'react'
import { getRedirectUri } from '../lib/spotifyAuth'

interface SpotifyConnectProps {
  clientId: string | null
  connected: boolean
  busy: boolean
  error: string | null
  onConnect: (clientId: string) => void
  onDisconnect: () => void
}

export function SpotifyConnect({ clientId, connected, busy, error, onConnect, onDisconnect }: SpotifyConnectProps) {
  const [inputId, setInputId] = useState(clientId ?? '')
  const [showSetup, setShowSetup] = useState(!clientId)

  if (connected) {
    return (
      <div className="spotify-connect spotify-connect--connected">
        <span className="spotify-status-dot" aria-hidden="true" />
        <span>Forbundet til Spotify</span>
        <button type="button" className="btn btn-secondary btn-small" onClick={onDisconnect}>
          Afbryd
        </button>
      </div>
    )
  }

  return (
    <div className="spotify-connect">
      <div className="spotify-connect-header">
        <span className="spotify-status-dot spotify-status-dot--off" aria-hidden="true" />
        <span>Ikke forbundet til Spotify</span>
        <button type="button" className="link-btn" onClick={() => setShowSetup((v) => !v)}>
          {showSetup ? 'Skjul' : 'Opsæt'}
        </button>
      </div>

      {showSetup && (
        <div className="spotify-setup">
          <p className="spotify-setup-hint">
            Opret en gratis app på{' '}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
              developer.spotify.com/dashboard
            </a>{' '}
            og tilføj denne Redirect URI:
          </p>
          <code className="redirect-uri">{getRedirectUri()}</code>
          <input
            className="player-input"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Spotify Client ID"
          />
          <button
            type="button"
            className="btn btn-primary btn-small"
            disabled={!inputId.trim() || busy}
            onClick={() => onConnect(inputId.trim())}
          >
            {busy ? 'Forbinder...' : 'Log ind med Spotify'}
          </button>
          <p className="spotify-setup-note">Kræver Spotify Premium for afspilning i browseren.</p>
          {error && <p className="mystery-error">{error}</p>}
        </div>
      )}
    </div>
  )
}
