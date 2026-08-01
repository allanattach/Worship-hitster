import { useCallback, useEffect, useRef, useState } from 'react'
import { beginSpotifyLogin, consumeAuthRedirect, refreshSpotifyToken } from '../lib/spotifyAuth'
import {
  clearSpotifyTokens,
  loadSpotifyClientId,
  loadSpotifyTokens,
  saveSpotifyClientId,
  saveSpotifyTokens,
} from '../lib/storage'
import type { SpotifyTokens } from '../types'

export function useSpotifyAuth() {
  const [clientId, setClientId] = useState<string | null>(() => loadSpotifyClientId())
  const [tokens, setTokens] = useState<SpotifyTokens | null>(() => loadSpotifyTokens())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const tokensRef = useRef(tokens)
  tokensRef.current = tokens

  // Handle the redirect back from Spotify's login page, once, on mount.
  useEffect(() => {
    const id = loadSpotifyClientId()
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

  const connect = useCallback(async (id: string) => {
    setError(null)
    saveSpotifyClientId(id)
    setClientId(id)
    try {
      await beginSpotifyLogin(id)
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
