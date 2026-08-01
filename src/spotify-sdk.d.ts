interface SpotifyPlayerInstance {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: string, callback: (state: unknown) => void): void
  removeListener(event: string): void
  togglePlay(): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
}

interface SpotifyPlayerOptions {
  name: string
  getOAuthToken: (callback: (token: string) => void) => void
  volume?: number
}

interface SpotifyNamespace {
  Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance
}

interface Window {
  onSpotifyWebPlaybackSDKReady?: () => void
  Spotify?: SpotifyNamespace
}
