export type Genre = 'hymn' | 'gospel' | 'ccm' | 'worship' | 'rock' | 'pop'

export interface Song {
  id: string
  title: string
  artist: string
  year: number
  genre: Genre
  /** Credited to an author rather than a recording artist, so Spotify has to be
   * searched by title alone. True for hymns and older gospel standards. */
  traditional?: boolean
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
  /** Spent to bid in on another player's card, earned by naming title and artist. */
  tokens: number
}

export type GamePhase = 'setup' | 'playing' | 'placing' | 'reveal' | 'challenge' | 'gameover'

export interface RoundResult {
  correct: boolean
  song: PlacedCard
  insertIndex: number
  /** Set when the card was claimed by a player bidding in rather than by the
   * player whose turn it was. */
  challengerId?: string
  challengerCorrect?: boolean
  /** Guards the once-per-round token award from being claimed twice. */
  tokenAwarded?: boolean
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
  /** Player currently bidding in on the card, during the challenge phase. */
  challengerId: string | null
}

export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type Theme = 'light' | 'dark'
