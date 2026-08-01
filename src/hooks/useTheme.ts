import { useCallback, useEffect, useState } from 'react'
import { loadTheme, saveTheme } from '../lib/storage'
import type { Theme } from '../types'

function getPreferredTheme(): Theme {
  const stored = loadTheme()
  if (stored) return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
