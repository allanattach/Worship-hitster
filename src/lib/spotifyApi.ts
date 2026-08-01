import { loadTrackCache, saveTrackCacheEntry } from './storage'
import type { Song } from '../types'

const API_BASE = 'https://api.spotify.com/v1'

interface SpotifyTrack {
  uri: string
  name: string
  artists: { name: string }[]
}

export async function findTrackUri(accessToken: string, song: Song): Promise<string | null> {
  const cache = loadTrackCache()
  if (cache[song.id]) return cache[song.id]

  const query = `track:${song.title} artist:${song.artist}`
  const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return null
  const data = await res.json()
  const track: SpotifyTrack | undefined = data.tracks?.items?.[0]
  if (!track) return null

  saveTrackCacheEntry(song.id, track.uri)
  return track.uri
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
