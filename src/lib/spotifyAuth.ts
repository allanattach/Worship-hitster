import type { SpotifyTokens } from '../types'
import { clearPkceVerifier, loadPkceVerifier, savePkceVerifier } from './storage'

const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
]

export function getRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

export async function beginSpotifyLogin(clientId: string): Promise<void> {
  const verifier = randomString(96)
  savePkceVerifier(verifier)
  const challenge = await generateCodeChallenge(verifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES.join(' '),
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

function toTokens(data: TokenResponse, fallbackRefreshToken: string): SpotifyTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? fallbackRefreshToken,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  }
}

/** Checks the current URL for a Spotify OAuth redirect (?code=...) and, if
 * present, exchanges it for tokens. Cleans the query string afterwards. */
export async function consumeAuthRedirect(clientId: string): Promise<SpotifyTokens | null> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  if (!code && !error) return null

  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')
  window.history.replaceState({}, '', url.toString())

  if (error || !code) {
    clearPkceVerifier()
    throw new Error(error ?? 'Spotify login blev afbrudt')
  }

  const verifier = loadPkceVerifier()
  if (!verifier) throw new Error('Manglende PKCE verifier - prøv at forbinde igen')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  clearPkceVerifier()
  if (!res.ok) throw new Error('Kunne ikke hente Spotify-token')
  const data: TokenResponse = await res.json()
  return toTokens(data, '')
}

export async function refreshSpotifyToken(clientId: string, refreshToken: string): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Kunne ikke forny Spotify-token')
  const data: TokenResponse = await res.json()
  return toTokens(data, refreshToken)
}
