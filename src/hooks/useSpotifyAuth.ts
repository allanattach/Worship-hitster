import { useCallback, useEffect, useRef, useState } from 'react'
import { beginSpotifyLogin, consumeAuthRedirect, refreshSpotifyToken } from '../lib/spotifyAuth'
import {
  clearSpotifyTokens,
  loadSpotifyClientId,
  loadSpotifyTokens,
  saveSpotifyClientId,
  saveSpotifyTokens,
} from '../lib/storage'
import { DEFAULT_SPOTIFY_CLIENT_ID } from '../config'
import type { SpotifyTokens } from '../types'

/** A Client ID the player entered themselves wins over the one baked into the
 * build, so a self-hosted copy can still point at its own Spotify app. */
function resolveClientId(): string | null {
  return loadSpotifyClientId() ?? (DEFAULT_SPOTIFY_CLIENT_ID || null)
}

export function useSpotifyAuth() {
  const [clientId, setClientId] = useState<string | null>(resolveClientId)
  const [tokens, setTokens] = useState<SpotifyTokens | null>(() => loadSpotifyTokens())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const tokensRef = useRef(tokens)
  tokensRef.current = tokens

  // Handle the redirect back from Spotify's login page, once, on mount.
  useEffect(() => {
    const id = resolveClientId()
    if (!id) return
    if (!window.location.search.includes('code=') && !window.location.search.includes('error=')) return
    setBusy(true)
    consumeAuthRedirect(id)
      .then((result) => {
        if (result) {
          saveSpotifyTokens(result)
          setTokens(result)
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false))
  }, [])

  /** Starts login. Called with no argument it uses the Client ID that ships
   * with the build, so players just press the button. */
  const connect = useCallback(async (id?: string) => {
    setError(null)
    const entered = id?.trim() ?? ''
    const effectiveId = entered || DEFAULT_SPOTIFY_CLIENT_ID
    if (!effectiveId) {
      setError('Der mangler et Spotify Client ID.')
      return
    }
    // Only remember an ID the player typed in; the built-in one is part of the build.
    if (entered) saveSpotifyClientId(entered)
    setClientId(effectiveId)
    try {
      await beginSpotifyLogin(effectiveId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunne ikke starte Spotify-login')
    }
  }, [])

  const disconnect = useCallback(() => {
    clearSpotifyTokens()
    setTokens(null)
  }, [])

  /** Returns a currently-valid access token, refreshing it first if it has
   * expired (or is close to expiring). Returns null if not connected. */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    const current = tokensRef.current
    if (!current || !clientId) return null
    if (Date.now() < current.expiresAt) return current.accessToken
    try {
      const refreshed = await refreshSpotifyToken(clientId, current.refreshToken)
      saveSpotifyTokens(refreshed)
      setTokens(refreshed)
      return refreshed.accessToken
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunne ikke forny Spotify-forbindelsen')
      clearSpotifyTokens()
      setTokens(null)
      return null
    }
  }, [clientId])

  return {
    clientId,
    connected: !!tokens,
    busy,
    error,
    connect,
    disconnect,
    getValidAccessToken,
    clearError: () => setError(null),
  }
}
