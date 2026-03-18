import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAutoHideOptions {
  /** フェードアウトまでの秒数（デフォルト: 3） */
  delay?: number
  /** true の場合、タイマーを停止して常時表示にする */
  pinned?: boolean
  /** 再生中かどうか。一時停止中は常時表示。 */
  isPlaying?: boolean
}

interface UseAutoHideReturn {
  /** true = UI を表示、false = フェードアウト */
  visible: boolean
  /** ユーザー操作があったときに呼ぶ（タイマーリセット） */
  poke: () => void
  /** コンテナに設定するイベントハンドラ */
  containerProps: {
    onMouseMove: () => void
    onMouseDown: () => void
    onTouchStart: () => void
  }
}

/**
 * シアターモードの auto-hide 制御フック。
 *
 * - ユーザー操作（マウス移動、タッチ、クリック）で表示
 * - 一定時間無操作でフェードアウト
 * - pinned=true の場合は常時表示（ドロワー開中など）
 * - isPlaying=false の場合は常時表示（一時停止中）
 */
export function useAutoHide({
  delay = 3,
  pinned = false,
  isPlaying = true,
}: UseAutoHideOptions = {}): UseAutoHideReturn {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, delay * 1000)
  }, [clearTimer, delay])

  const poke = useCallback(() => {
    setVisible(true)
    if (!pinned && isPlaying) {
      startTimer()
    }
  }, [pinned, isPlaying, startTimer])

  // pinned または一時停止中は常時表示
  useEffect(() => {
    if (pinned || !isPlaying) {
      clearTimer()
      setVisible(true)
    } else {
      // 再生開始時 or pinned 解除時にタイマー開始
      startTimer()
    }
  }, [pinned, isPlaying, clearTimer, startTimer])

  // クリーンアップ
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const containerProps = {
    onMouseMove: poke,
    onMouseDown: poke,
    onTouchStart: poke,
  }

  return { visible, poke, containerProps }
}
