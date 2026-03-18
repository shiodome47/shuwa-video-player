import { useEffect, useRef } from 'react'
import { useUIStore } from '../../../stores/ui'

/**
 * シアターモード時に Fullscreen API と orientation lock を
 * progressive enhancement として追加するフック。
 *
 * - enterTheater 時: requestFullscreen() を試行。失敗しても続行。
 * - exitTheater 時: exitFullscreen() を試行。
 * - ブラウザ側で Esc 等で fullscreen を抜けた場合: theater も解除。
 * - orientation lock は対応環境（主に Chrome Android）でのみ試行。
 *
 * いずれの API も前提条件にせず、利用できる場合のみ補助的に使用する。
 */
export function useTheaterFullscreen(containerRef: React.RefObject<HTMLElement | null>) {
  const layoutMode = useUIStore((s) => s.layoutMode)
  const exitTheater = useUIStore((s) => s.exitTheater)
  const isTheater = layoutMode === 'theater'

  // exitTheater のクリーンアップ中に呼ばれないよう ref で持つ
  const exitTheaterRef = useRef(exitTheater)
  exitTheaterRef.current = exitTheater

  // ── fullscreen enter / exit ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    if (isTheater) {
      // Fullscreen を試行（ユーザージェスチャーの延長で呼ばれる場合のみ成功）
      void enterFullscreen(containerRef.current)
      void lockLandscape()
    } else {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
      void unlockOrientation()
    }
  }, [isTheater, containerRef])

  // ── ブラウザ側で fullscreen が解除された場合の同期 ──────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      // fullscreen が外れて、まだ theater 中なら theater を解除
      if (!document.fullscreenElement && useUIStore.getState().layoutMode === 'theater') {
        exitTheaterRef.current()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
}

// ─── ヘルパー ─────────────────────────────────────────────────

async function enterFullscreen(el: HTMLElement) {
  try {
    await el.requestFullscreen?.()
  } catch {
    // ユーザージェスチャー外 or API 非対応 → 無視
  }
}

async function lockLandscape() {
  try {
    // screen.orientation.lock は Chrome Android でのみ動作
    // TypeScript の lib.dom.d.ts には lock/unlock が定義されていない環境があるため
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (screen.orientation as any)?.lock?.('landscape')
  } catch {
    // 非対応（デスクトップ, Firefox, Safari）→ 無視
  }
}

async function unlockOrientation() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(screen.orientation as any)?.unlock?.()
  } catch {
    // 無視
  }
}
