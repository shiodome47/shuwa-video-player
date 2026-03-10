import { useEffect } from 'react'
import type { RefObject } from 'react'
import { usePlayerStore } from '../store'

/**
 * A-B リピートのループ処理。
 *
 * video 要素の timeupdate に直接リスナーを追加する。
 * usePlayerStore.getState() を使うことで stale closure を回避する。
 * videoRef は安定しているのでマウント時に一度だけ登録する。
 */
export function useABRepeat(videoRef: RefObject<HTMLVideoElement>) {
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const check = () => {
      const { abA, abB } = usePlayerStore.getState()
      if (abA === null || abB === null) return
      if (v.currentTime >= abB) {
        v.currentTime = abA
      }
    }

    v.addEventListener('timeupdate', check)
    return () => v.removeEventListener('timeupdate', check)
    // videoRef は ref オブジェクトで安定しているため deps は空で正しい
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
