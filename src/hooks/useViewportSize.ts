import { useEffect, useState } from 'react'

function read() {
  return { width: window.innerWidth, height: window.innerHeight }
}

/** Viewport dimensions, so layout can budget vertical space rather than only
 * fitting horizontally. */
export function useViewportSize() {
  const [size, setSize] = useState(read)

  useEffect(() => {
    const onResize = () => setSize(read())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return size
}
