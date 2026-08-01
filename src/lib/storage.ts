import type { GameState, SpotifyTokens, Theme } from '../types'

const KEYS = {
  game: 'wh_game_state_v1',
  theme: 'wh_theme_v1',
  spotifyTokens: 'wh_spotify_tokens_v1',
  spotifyClientId: 'wh_spotify_client_id_v1',
  pkceVerifier: 'wh_spotify_pkce_verifier_v1',
  trackCache: 'wh_spotify_track_cache_v1',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable or full; game continues in-memory only
  }
}

export function loadGameState(): GameState | null {
  return read<GameState>(KEYS.game)
}

export function saveGameState(state: GameState) {
  write(KEYS.game, state)
}

export function clearGameState() {
  localStorage.removeItem(KEYS.game)
}

export function loadTheme(): Theme | null {
  return read<Theme>(KEYS.theme)
}

export function saveTheme(theme: Theme) {
  write(KEYS.theme, theme)
}

export function loadSpotifyTokens(): SpotifyTokens | null {
  return read<SpotifyTokens>(KEYS.spotifyTokens)
}

export function saveSpotifyTokens(tokens: SpotifyTokens) {
  write(KEYS.spotifyTokens, tokens)
}

export function clearSpotifyTokens() {
  localStorage.removeItem(KEYS.spotifyTokens)
}

export function loadSpotifyClientId(): string | null {
  return localStorage.getItem(KEYS.spotifyClientId)
}

export function saveSpotifyClientId(clientId: string) {
  localStorage.setItem(KEYS.spotifyClientId, clientId)
}

export function savePkceVerifier(verifier: string) {
  localStorage.setItem(KEYS.pkceVerifier, verifier)
}

export function loadPkceVerifier(): string | null {
  return localStorage.getItem(KEYS.pkceVerifier)
}

export function clearPkceVerifier() {
  localStorage.removeItem(KEYS.pkceVerifier)
}

export type TrackCache = Record<string, string>

export function loadTrackCache(): TrackCache {
  return read<TrackCache>(KEYS.trackCache) ?? {}
}

export function saveTrackCacheEntry(songId: string, uri: string) {
  const cache = loadTrackCache()
  cache[songId] = uri
  write(KEYS.trackCache, cache)
}
