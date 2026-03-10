import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { VideoControls } from '../types'
import { usePlayerStore } from '../store'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * プレイヤーのキーボードショートカット。
 *
 * - Space        : 再生 / 一時停止
 * - ArrowLeft    : 5秒戻す
 * - ArrowRight   : 5秒進む
 * - j / J        : 10秒戻す
 * - l / L        : 10秒進む
 * - [ / ]        : 再生速度を下げる / 上げる
 * - a / A        : A地点を現在位置に設定
 * - b / B        : B地点を現在位置に設定（A設定済みかつ B > A の場合のみ）
 * - Escape       : A-B リピートを解除
 *
 * input / textarea / select / contentEditable / dialog 内ではすべて無効化する。
 */
export function usePlayerShortcuts(
  videoRef: RefObject<HTMLVideoElement>,
  controls: VideoControls,
) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // フォームや IME 入力中は無視
      const el = e.target as HTMLElement
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable ||
        el.closest('[role="dialog"]') !== null
      ) {
        return
      }

      const video = videoRef.current

      switch (e.key) {
        case ' ':
          e.preventDefault()
          controls.togglePlayPause()
          break

        case 'ArrowLeft':
          e.preventDefault()
          controls.skip(-5)
          break

        case 'ArrowRight':
          e.preventDefault()
          controls.skip(5)
          break

        case 'j':
        case 'J':
          e.preventDefault()
          controls.skip(-10)
          break

        case 'l':
        case 'L':
          e.preventDefault()
          controls.skip(10)
          break

        case '[': {
          e.preventDefault()
          const { playbackRate, setPlaybackRate } = usePlayerStore.getState()
          const idx = SPEEDS.indexOf(playbackRate)
          if (idx > 0) {
            const next = SPEEDS[idx - 1]
            setPlaybackRate(next)
            if (video) video.playbackRate = next
          }
          break
        }

        case ']': {
          e.preventDefault()
          const { playbackRate, setPlaybackRate } = usePlayerStore.getState()
          const idx = SPEEDS.indexOf(playbackRate)
          if (idx < SPEEDS.length - 1) {
            const next = SPEEDS[idx + 1]
            setPlaybackRate(next)
            if (video) video.playbackRate = next
          }
          break
        }

        case 'a':
        case 'A': {
          e.preventDefault()
          const t = video?.currentTime ?? 0
          usePlayerStore.getState().setAbA(t)
          break
        }

        case 'b':
        case 'B': {
          e.preventDefault()
          const { abA } = usePlayerStore.getState()
          const t = video?.currentTime ?? 0
          if (abA !== null && t > abA) {
            usePlayerStore.getState().setAbB(t)
          }
          break
        }

        case 'Escape': {
          const { abA, abB } = usePlayerStore.getState()
          if (abA !== null || abB !== null) {
            e.preventDefault()
            usePlayerStore.getState().clearAB()
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // controls は NativePlayer の useMemo で安定、videoRef も安定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
