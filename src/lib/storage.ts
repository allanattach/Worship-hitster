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

export interface CachedTrack {
  uri: string
  albumImageUrl?: string
}

type StoredTrackCache = Record<string, CachedTrack | string>

/** Earlier versions cached a bare URI string; normalise those on read so an
 * existing cache keeps working instead of being thrown away. */
export function loadTrackCache(): Record<string, CachedTrack> {
  const raw = read<StoredTrackCache>(KEYS.trackCache) ?? {}
  const out: Record<string, CachedTrack> = {}
  for (const [id, value] of Object.entries(raw)) {
    if (typeof value === 'string') out[id] = { uri: value }
    else if (value && typeof value.uri === 'string') out[id] = value
  }
  return out
}

export function saveTrackCacheEntry(songId: string, track: CachedTrack) {
  const cache = loadTrackCache()
  cache[songId] = track
  write(KEYS.trackCache, cache)
}
