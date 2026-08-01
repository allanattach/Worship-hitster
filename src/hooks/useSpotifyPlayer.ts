import { useEffect, useRef, useState } from 'react'

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js'
let sdkLoadPromise: Promise<void> | null = null

function loadSdkScript(): Promise<void> {
  if (window.Spotify) return Promise.resolve()
  if (sdkLoadPromise) return sdkLoadPromise
  sdkLoadPromise = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    document.body.appendChild(script)
  })
  return sdkLoadPromise
}

interface PlaybackStateShape {
  paused: boolean
  track_window: { current_track: { name: string; artists: { name: string }[] } }
}

/** Loads the Spotify Web Playback SDK and connects a browser player once the
 * caller is authenticated. Requires a Spotify Premium account. */
export function useSpotifyPlayer(connected: boolean, getAccessToken: () => Promise<string | null>) {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(true)
  const playerRef = useRef<SpotifyPlayerInstance | null>(null)

  useEffect(() => {
    if (!connected) return
    let cancelled = false

    loadSdkScript().then(() => {
      if (cancelled || !window.Spotify) return
      const player = new window.Spotify.Player({
        name: 'Worship Hitster',
        getOAuthToken: (cb) => {
          getAccessToken().then((token) => {
            if (token) cb(token)
          })
        },
        volume: 0.8,
      })

      player.addListener('ready', (state) => {
        const { device_id } = state as { device_id: string }
        setDeviceId(device_id)
        setReady(true)
      })
      player.addListener('not_ready', () => setReady(false))
      player.addListener('initialization_error', (state) => {
        setPlaybackError((state as { message: string }).message)
      })
      player.addListener('authentication_error', (state) => {
        setPlaybackError((state as { message: string }).message)
      })
      player.addListener('account_error', () => {
        setPlaybackError('Spotify Premium kræves for at afspille sange i browseren.')
      })
      player.addListener('player_state_changed', (state) => {
        if (!state) return
        setIsPaused((state as PlaybackStateShape).paused)
      })

      player.connect()
      playerRef.current = player
    })

    return () => {
      cancelled = true
      playerRef.current?.disconnect()
      playerRef.current = null
      setReady(false)
      setDeviceId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  return {
    deviceId,
    ready,
    isPaused,
    playbackError,
    togglePlay: () => playerRef.current?.togglePlay(),
    pause: () => playerRef.current?.pause(),
    resume: () => playerRef.current?.resume(),
  }
}
