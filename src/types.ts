export type Genre = 'hymn' | 'gospel' | 'ccm' | 'worship' | 'rock' | 'pop'

export interface Song {
  id: string
  title: string
  artist: string
  year: number
  genre: Genre
}

export interface PlacedCard extends Song {
  spotifyUri?: string
  /** Album cover from Spotify, looked up when the card is drawn. Stored on the
   * card so it survives a reload along with the rest of the game state. */
  albumImageUrl?: string
}

export interface Player {
  id: string
  name: string
  board: PlacedCard[]
}

export type GamePhase = 'setup' | 'playing' | 'placing' | 'reveal' | 'gameover'

export interface RoundResult {
  correct: boolean
  song: PlacedCard
  insertIndex: number
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentPlayerIndex: number
  viewingPlayerIndex: number
  deck: Song[]
  discard: Song[]
  currentCard: PlacedCard | null
  currentCardRevealed: boolean
  lastResult: RoundResult | null
  winnerId: string | null
  targetCards: number
}

export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type Theme = 'light' | 'dark'
