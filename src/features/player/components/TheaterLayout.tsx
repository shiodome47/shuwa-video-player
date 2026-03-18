import { useCallback, useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../../courses/store'
import { usePlayerStore } from '../store'
import type { VideoSource } from '../../../types'
import { useAutoHide } from '../hooks/useAutoHide'
import { useTheaterFullscreen } from '../hooks/useTheaterFullscreen'
import { VideoPlayer } from './VideoPlayer'
import { TheaterOverlay } from './TheaterOverlay'
import { TheaterDrawer } from './TheaterDrawer'
import type { DrawerTab } from './TheaterOverlay'
import { useUIStore } from '../../../stores/ui'

interface TheaterLayoutProps {
  lessonId: string
  sources: VideoSource[]
  activeIndex: number
  onSelectIndex: (i: number) => void
}

/**
 * シアターモード用レイアウト。
 * 動画を画面いっぱいに表示し、コントロールはオーバーレイで表示する。
 *
 * 構成:
 * - VideoPlayer (overlay=true) — 動画 + 下部コントロール
 * - TheaterOverlay — 上部バー + 右 ActionRail + auto-hide
 * - TheaterDrawer — 右スライドインパネル（LessonTabs 再利用）
 */
export function TheaterLayout({
  lessonId,
  sources,
  activeIndex,
  onSelectIndex,
}: TheaterLayoutProps) {
  const exitTheater = useUIStore((s) => s.exitTheater)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const lesson = useCourseStore((s) => s.lessons.find((l) => l.id === lessonId))
  const lessonTitle = lesson?.title ?? ''
  const containerRef = useRef<HTMLDivElement>(null)

  // Progressive Enhancement: Fullscreen API + orientation lock
  useTheaterFullscreen(containerRef)

  // ドロワー状態
  const [drawerTab, setDrawerTab] = useState<DrawerTab | null>(null)
  const isDrawerOpen = drawerTab !== null

  const { visible, containerProps } = useAutoHide({
    delay: 3,
    pinned: isDrawerOpen,
    isPlaying,
  })

  const handleOpenDrawer = useCallback((tab: DrawerTab) => {
    setDrawerTab((prev) => (prev === tab ? null : tab))
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerTab(null)
  }, [])

  // ── Esc キー: ドロワー閉 → theater 解除 の優先順位 ────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // input / textarea / dialog 内では無視（既存ショートカットと同じ判定）
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return
      if ((e.target as HTMLElement).closest('dialog')) return

      // A-B リピートが設定中なら、既存の usePlayerShortcuts が処理するので何もしない
      const { abA, abB } = usePlayerStore.getState()
      if (abA !== null || abB !== null) return

      // fullscreen 中は Esc でブラウザが fullscreen を抜け、
      // fullscreenchange 経由で exitTheater() が呼ばれるため、ここでは何もしない
      if (document.fullscreenElement) return

      e.preventDefault()
      if (drawerTab !== null) {
        setDrawerTab(null)
      } else {
        exitTheater()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerTab, exitTheater])

  return (
    <div ref={containerRef} className="relative flex h-full bg-black" {...containerProps}>
      {/* 動画コンテナ: 全幅全高 */}
      <div className="flex-1 overflow-hidden">
        <VideoPlayer
          lessonId={lessonId}
          sources={sources}
          activeIndex={activeIndex}
          onSelectIndex={onSelectIndex}
          overlay
        />
      </div>

      {/* オーバーレイ UI（上部 + ActionRail） */}
      <TheaterOverlay
        visible={visible}
        lessonTitle={lessonTitle}
        onExit={exitTheater}
        onOpenDrawer={handleOpenDrawer}
        activeDrawerTab={drawerTab}
      />

      {/* 右ドロワー */}
      <TheaterDrawer
        activeTab={drawerTab}
        onClose={handleCloseDrawer}
        lessonId={lessonId}
      />
    </div>
  )
}
