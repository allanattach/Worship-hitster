import { useState } from 'react'
import { HAS_BUILT_IN_CLIENT_ID } from '../config'
import { getRedirectUri } from '../lib/spotifyAuth'

interface SpotifyConnectProps {
  clientId: string | null
  connected: boolean
  busy: boolean
  error: string | null
  onConnect: (clientId?: string) => void
  onDisconnect: () => void
}

export function SpotifyConnect({ clientId, connected, busy, error, onConnect, onDisconnect }: SpotifyConnectProps) {
  const [inputId, setInputId] = useState(clientId ?? '')
  // With an ID baked into the build there is nothing to configure, so the
  // dashboard instructions stay hidden behind an opt-in for self-hosters.
  const [showOwnApp, setShowOwnApp] = useState(!HAS_BUILT_IN_CLIENT_ID)

  if (connected) {
    return (
      <div className="spotify-connect spotify-connect--connected">
        <span className="spotify-status-dot" aria-hidden="true" />
        <span>Forbundet til Spotify</span>
        <button type="button" className="btn btn-secondary btn-small" onClick={onDisconnect}>
          Log ud
        </button>
      </div>
    )
  }

  return (
    <div className="spotify-connect">
      <div className="spotify-connect-header">
        <span className="spotify-status-dot spotify-status-dot--off" aria-hidden="true" />
        <span>Ikke forbundet til Spotify</span>
      </div>

      {HAS_BUILT_IN_CLIENT_ID && !showOwnApp && (
        <>
          <p className="spotify-setup-hint">
            Log ind med din egen Spotify-konto for at høre sangene. Kun den enhed der afspiller musikken skal
            logge ind – og kun én gang, forbindelsen huskes bagefter.
          </p>
          <button type="button" className="btn btn-primary btn-small" disabled={busy} onClick={() => onConnect()}>
            {busy ? 'Forbinder...' : 'Log ind med Spotify'}
          </button>
          <p className="spotify-setup-note">Kræver Spotify Premium for afspilning i browseren.</p>
          {error && <p className="mystery-error">{error}</p>}
          <button type="button" className="link-btn link-btn--inline" onClick={() => setShowOwnApp(true)}>
            Brug min egen Spotify-app
          </button>
        </>
      )}

      {showOwnApp && (
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
          {HAS_BUILT_IN_CLIENT_ID && (
            <button type="button" className="link-btn link-btn--inline" onClick={() => setShowOwnApp(false)}>
              Tilbage
            </button>
          )}
        </div>
      )}
    </div>
  )
}
