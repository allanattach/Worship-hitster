/**
 * Spotify Client ID that ships with the deployed app.
 *
 * This is safe to commit. The app authenticates with the Authorization Code
 * flow with PKCE, which is designed for public clients that have no backend:
 * there is no client secret, and a Client ID on its own grants nothing. Each
 * player logs in with their own Spotify account and their token stays in their
 * own browser.
 *
 * Set this to the Client ID of the Spotify app whose Redirect URI is the
 * deployed URL, and players never have to see the developer dashboard.
 * A `VITE_SPOTIFY_CLIENT_ID` build variable overrides it if present, so a fork
 * can point at its own Spotify app without editing code.
 */
const BUILT_IN_CLIENT_ID = '1703d11cb4124bcb8b0fe8a62799c60c'

export const DEFAULT_SPOTIFY_CLIENT_ID = (
  import.meta.env.VITE_SPOTIFY_CLIENT_ID || BUILT_IN_CLIENT_ID
).trim()

export const HAS_BUILT_IN_CLIENT_ID = DEFAULT_SPOTIFY_CLIENT_ID.length > 0
