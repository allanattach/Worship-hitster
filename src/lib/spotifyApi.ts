import { loadTrackCache, saveTrackCacheEntry, type CachedTrack } from './storage'
import type { Song } from '../types'

const API_BASE = 'https://api.spotify.com/v1'

interface SpotifyTrack {
  uri: string
  name: string
  artists: { name: string }[]
  album?: { images?: { url: string; width: number; height: number }[] }
}

/** Spotify returns images largest-first. Prefer a mid-size one: big enough for
 * the reveal card, small enough not to waste bandwidth on the timeline. */
function pickAlbumImage(track: SpotifyTrack): string | undefined {
  const images = track.album?.images
  if (!images?.length) return undefined
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  return (sorted.find((i) => (i.width ?? 0) >= 300) ?? sorted[sorted.length - 1]).url
}

/**
 * Search terms to try in order, stopping at the first hit.
 *
 * Hymns and other traditional songs are credited to whoever wrote them, and no
 * recording artist is called "John Newton" — so an artist-scoped search finds
 * nothing. For those the title alone is what locates a recording, and any
 * recording will do, since the point is to hear the song and guess its year.
 */
function buildQueries(song: Song): string[] {
  const byTitle = `track:${song.title}`
  const byBoth = `${byTitle} artist:${song.artist}`
  if (song.traditional) return [byTitle, byBoth]
  // Field-scoped first for precision, then loose text, which tolerates small
  // differences in how Spotify spells a title or credits a collaboration.
  return [byBoth, `${song.title} ${song.artist}`, byTitle]
}

async function searchTrack(accessToken: string, query: string): Promise<SpotifyTrack | null> {
  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return null
  const data = await res.json()
  return data.tracks?.items?.[0] ?? null
}

export async function findTrack(accessToken: string, song: Song): Promise<CachedTrack | null> {
  const cached = loadTrackCache()[song.id]
  if (cached) return cached

  for (const query of buildQueries(song)) {
    const track = await searchTrack(accessToken, query)
    if (!track) continue
    const entry: CachedTrack = { uri: track.uri, albumImageUrl: pickAlbumImage(track) }
    saveTrackCacheEntry(song.id, entry)
    return entry
  }
  return null
}

export async function playTrackUri(accessToken: string, deviceId: string, uri: string): Promise<void> {
  const res = await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [uri] }),
  })
  if (!res.ok && res.status !== 204) {
    const body = await res.text()
    throw new Error(`Spotify afspilning fejlede (${res.status}): ${body}`)
  }
}

export async function pausePlayback(accessToken: string, deviceId: string): Promise<void> {
  await fetch(`${API_BASE}/me/player/pause?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function resumePlayback(accessToken: string, deviceId: string): Promise<void> {
  await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
