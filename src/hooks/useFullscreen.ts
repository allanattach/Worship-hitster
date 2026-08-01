import { useCallback, useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        // fullscreen not permitted in this context; ignore
      })
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
