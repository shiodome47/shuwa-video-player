import { useEffect, useState } from 'react'

/**
 * CSS メディアクエリにマッチするかどうかをリアクティブに返す。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // SSR 対応のため window の存在を確認
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/** モバイル（< 768px = Tailwind md ブレークポイント）かどうかを返す。 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
