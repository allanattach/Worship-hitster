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

/**
 * A round runs: playing → placing → bidding (⇄ bidPlacing) → reveal.
 *
 * Nothing about the song is shown until `reveal`. Bids are placed blind, which
 * is the whole point — seeing the year first would make bidding free.
 */
export type GamePhase =
  | 'setup'
  | 'playing'
  | 'placing'
  | 'bidding'
  | 'bidPlacing'
  | 'reveal'
  | 'gameover'

/** Another player's blind guess at where the card belongs on their own board. */
export interface Bid {
  playerId: string
  insertIndex: number
}

export interface ResolvedBid extends Bid {
  correct: boolean
}

export interface RoundResult {
  song: PlacedCard
  /** Whether the player in turn placed it correctly. */
  correct: boolean
  insertIndex: number
  bids: ResolvedBid[]
  /** The bidder who ended up taking the card, if any. */
  wonByBidderId?: string
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
  /** Oldest year allowed in the deck. 0 means no limit. */
  minYear: number
  /** Where the player in turn put the card, kept face down until the reveal. */
  pendingPlacement: number | null
  /** Blind bids taken so far this round. */
  bids: Bid[]
  /** The player currently choosing a slot for their bid. */
  activeBidderId: string | null
}

export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type Theme = 'light' | 'dark'
