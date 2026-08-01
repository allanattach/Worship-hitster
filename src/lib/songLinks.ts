import type { PlacedCard } from '../types'

export interface SongLink {
  label: string
  href: string
}

/** Web address for a spotify:track:ID URI, or null if there is no usable URI. */
function spotifyWebUrl(uri?: string): string | null {
  const match = uri?.match(/^spotify:track:([A-Za-z0-9]+)$/)
  return match ? `https://open.spotify.com/track/${match[1]}` : null
}

function wikipediaSearch(query: string): string {
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`
}

/**
 * Where to read more about a revealed card: the recording and the artist on
 * Spotify, and the song's own history on Wikipedia.
 *
 * Traditional songs are searched by title alone. Their credited "artist" is an
 * author or a description such as "Irsk hymne, ca. 8. årh.", which only muddies
 * the query — whereas the bare title lands on the article itself.
 *
 * Hymnary would be the better source for hymn publication history, but its
 * search endpoint refuses requests, so it is not linked.
 */
export function songLinks(card: PlacedCard): SongLink[] {
  const links: SongLink[] = []

  const spotify = spotifyWebUrl(card.spotifyUri)
  if (spotify) links.push({ label: 'Åbn i Spotify', href: spotify })

  links.push({
    label: card.traditional ? 'Læs om salmen' : 'Læs om sangen',
    href: wikipediaSearch(card.traditional ? card.title : `${card.title} ${card.artist}`),
  })

  return links
}
