import { useCallback, useEffect, useRef } from 'react'
import type { VideoSource } from '../../../types'
import { extractYouTubeId } from '../../../utils/url'
import { registerPlayerSeek, unregisterPlayerSeek, usePlayerStore } from '../store'
import { ABRepeatControls } from './ABRepeatControls'

// YouTube IFrame API の最小型宣言
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: () => void
            onStateChange?: (e: { data: number }) => void
          }
        }
      ) => YTPlayer
    }
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface YTPlayer {
  getCurrentTime(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  destroy(): void
}

interface YouTubePlayerProps {
  source: VideoSource
  onEnded?: () => void
}

/**
 * YouTube 埋め込みプレイヤー（YT.Player API 使用）。
 *
 * YT.Player API を使い A-B リピートに対応する。
 * setInterval 100ms でポーリングし、currentTime >= abB なら abA へシーク。
 * containerRef 内に placeholder div を動的に生成し、YT.Player に渡す。
 */
export function YouTubePlayer({ source, onEnded }: YouTubePlayerProps) {
  const videoId = extractYouTubeId(source.src)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  // onEnded が毎レンダーで変わっても setInterval 内から最新版を参照できるよう ref に保持
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  const { abA, abB, duration, setAbA, setAbB, clearAbB, clearAB, adjustAbA, adjustAbB } = usePlayerStore()

  // YT.Player を初期化する。container 内に placeholder div を作り直してから渡す
  const initPlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return
    playerRef.current?.destroy()
    containerRef.current.innerHTML = ''
    const placeholder = document.createElement('div')
    containerRef.current.appendChild(placeholder)
    playerRef.current = new window.YT.Player(placeholder, {
      videoId,
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          const { pendingSeekTarget, clearPendingSeekTarget } = usePlayerStore.getState()
          if (pendingSeekTarget !== null) {
            playerRef.current?.seekTo(pendingSeekTarget, true)
            clearPendingSeekTarget()
          }
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === 0) onEndedRef.current?.()
        },
      },
    })
  }, [videoId])

  // YT API スクリプト読み込みと Player 初期化
  useEffect(() => {
    if (!videoId) return

    if (window.YT?.Player) {
      // API はすでに読み込み済み
      initPlayer()
    } else {
      // スクリプト未ロード → 挿入（複数コンポーネントで重複挿入を防ぐ）
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, initPlayer])

  // seekPlayer() 登録: ブックマーク等からの外部シークを受け付ける
  useEffect(() => {
    registerPlayerSeek((t: number) => {
      playerRef.current?.seekTo(t, true)
    })
    return () => unregisterPlayerSeek()
  }, [])

  // 100ms ポーリング: currentTime をストアに同期 & A-B リピート
  useEffect(() => {
    const id = setInterval(() => {
      if (!playerRef.current) return
      const t = playerRef.current.getCurrentTime()
      usePlayerStore.getState().setCurrentTime(t)

      const { abA: a, abB: b } = usePlayerStore.getState()
      if (a !== null && b !== null && t >= b) {
        playerRef.current.seekTo(a, true)
      }
    }, 100)
    return () => clearInterval(id)
  }, [])

  const handleToggleA = useCallback(() => {
    const { abA: currentAbA } = usePlayerStore.getState()
    if (currentAbA !== null) {
      clearAB()
    } else {
      setAbA(playerRef.current?.getCurrentTime() ?? 0)
    }
  }, [setAbA, clearAB])

  const handleToggleB = useCallback(() => {
    const { abA: currentAbA, abB: currentAbB, duration: dur } = usePlayerStore.getState()
    if (currentAbB !== null) {
      clearAbB()
    } else if (currentAbA !== null) {
      const t = playerRef.current?.getCurrentTime() ?? 0
      const bTime = t > currentAbA ? t : Math.min(currentAbA + 0.1, dur || Infinity)
      setAbB(bTime)
    }
  }, [setAbB, clearAbB])

  const handleAdjustA = useCallback((delta: number) => {
    adjustAbA(delta, duration)
  }, [adjustAbA, duration])

  const handleAdjustB = useCallback((delta: number) => {
    adjustAbB(delta, duration)
  }, [adjustAbB, duration])

  if (!videoId) {
    return (
      <div
        className="flex w-full items-center justify-center bg-black text-sm text-neutral-500"
        style={{ aspectRatio: '16/9' }}
      >
        無効な YouTube URL です
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-black">
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <div ref={containerRef} className="h-full w-full [&>iframe]:block [&>iframe]:h-full [&>iframe]:w-full" />
      </div>
      <div className="bg-neutral-950">
        <ABRepeatControls
          abA={abA}
          abB={abB}
          onToggleA={handleToggleA}
          onToggleB={handleToggleB}
          onAdjustA={handleAdjustA}
          onAdjustB={handleAdjustB}
          onClear={clearAB}
        />
      </div>
    </div>
  )
}
