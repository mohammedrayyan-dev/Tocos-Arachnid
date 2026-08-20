import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * Resets window scroll position to the top (0,0) whenever the route path or query changes.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname, search])

  return null
}

export default ScrollToTop
