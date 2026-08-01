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

export async function findTrack(accessToken: string, song: Song): Promise<CachedTrack | null> {
  const cached = loadTrackCache()[song.id]
  if (cached) return cached

  const query = `track:${song.title} artist:${song.artist}`
  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return null
  const data = await res.json()
  const track: SpotifyTrack | undefined = data.tracks?.items?.[0]
  if (!track) return null

  const entry: CachedTrack = { uri: track.uri, albumImageUrl: pickAlbumImage(track) }
  saveTrackCacheEntry(song.id, entry)
  return entry
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
