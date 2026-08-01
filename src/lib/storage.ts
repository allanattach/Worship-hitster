import { START_TOKENS } from './gameLogic'
import type { GameResult, GameState, SpotifyTokens, Theme } from '../types'

const KEYS = {
  game: 'wh_game_state_v1',
  theme: 'wh_theme_v1',
  spotifyTokens: 'wh_spotify_tokens_v1',
  spotifyClientId: 'wh_spotify_client_id_v1',
  pkceVerifier: 'wh_spotify_pkce_verifier_v1',
  trackCache: 'wh_spotify_track_cache_v1',
  minYear: 'wh_min_year_v1',
  results: 'wh_results_v1',
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

/** Fills in fields added after a game was saved, so a game in progress from an
 * older version keeps working instead of ending up with NaN tokens. */
export function loadGameState(): GameState | null {
  const saved = read<GameState>(KEYS.game)
  if (!saved) return null
  return {
    ...saved,
    gameId: saved.gameId ?? `legacy-${saved.players?.[0]?.id ?? 'game'}`,
    minYear: saved.minYear ?? 0,
    pendingPlacement: saved.pendingPlacement ?? null,
    bids: saved.bids ?? [],
    activeBidderId: saved.activeBidderId ?? null,
    players: (saved.players ?? []).map((player) => ({
      ...player,
      tokens: typeof player.tokens === 'number' ? player.tokens : START_TOKENS,
    })),
  }
}

/** The oldest-year setting is remembered across games, so a group that always
 * plays from a given decade does not have to pick it every time. */
export function loadMinYear(): number {
  return read<number>(KEYS.minYear) ?? 0
}

export function saveMinYear(minYear: number) {
  write(KEYS.minYear, minYear)
}

/**
 * Finished games, one entry per game id.
 *
 * Keying on the game id rather than incrementing a counter keeps recording
 * idempotent, so a re-render cannot double count, and makes a win removable
 * again if the deciding move is undone.
 */
export function loadResults(): GameResult[] {
  const raw = read<GameResult[]>(KEYS.results)
  if (!Array.isArray(raw)) return []
  return raw.filter((r) => r && typeof r.gameId === 'string' && typeof r.winnerName === 'string')
}

export function recordResult(gameId: string, winnerName: string) {
  const results = loadResults()
  if (results.some((r) => r.gameId === gameId)) return
  write(KEYS.results, [...results, { gameId, winnerName }])
}

export function removeResult(gameId: string) {
  const results = loadResults()
  if (!results.some((r) => r.gameId === gameId)) return
  write(KEYS.results, results.filter((r) => r.gameId !== gameId))
}

export function clearResults() {
  localStorage.removeItem(KEYS.results)
}

/** Wins per player name, matched case-insensitively but shown as first seen. */
export function winsByName(): { name: string; wins: number }[] {
  const tally = new Map<string, { name: string; wins: number }>()
  for (const { winnerName } of loadResults()) {
    const key = winnerName.trim().toLowerCase()
    const entry = tally.get(key)
    if (entry) entry.wins += 1
    else tally.set(key, { name: winnerName.trim(), wins: 1 })
  }
  return [...tally.values()].sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name, 'da'))
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
