import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { selectVideoSourcesByLesson, useCourseStore } from '../features/courses/store'
import { LessonTabs } from '../features/learning/components/LessonTabs'
import { LessonHintBar } from '../components/LessonHintBar'
import { useLearningStore } from '../features/learning/store'
import { TheaterLayout } from '../features/player/components/TheaterLayout'
import { VideoPlayer } from '../features/player/components/VideoPlayer'
import { useUIStore } from '../stores/ui'
import { db } from '../storage/db'

/**
 * 学習ビュー。
 *
 * layoutMode に応じて 2 つのレイアウトを切り替える:
 * - normal: 縦レイアウト（動画 + ヒント + タブパネル）
 * - theater: 動画を全画面風に表示（TheaterLayout に委譲）
 */
export function LearningView() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const { lessons } = useCourseStore()
  const selectedLesson = lessonId ? lessons.find((l) => l.id === lessonId) : undefined
  const layoutMode = useUIStore((s) => s.layoutMode)

  const loadForLesson = useLearningStore((s) => s.loadForLesson)

  // レッスンが変わったら学習データをロード
  useEffect(() => {
    if (lessonId) {
      void loadForLesson(lessonId)
    }
  }, [lessonId, loadForLesson])

  if (!selectedLesson) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Play />}
          title="レッスンを選んでください"
          description="左のサイドバーからレッスンを選ぶと動画が表示されます"
        />
      </div>
    )
  }

  if (layoutMode === 'theater') {
    return <VideoAreaTheater lessonId={selectedLesson.id} />
  }

  return (
    <div className="flex h-full flex-col">
      {/* 動画エリア */}
      <VideoAreaWrapper lessonId={selectedLesson.id} />

      {/* 使い方ヒント（初回のみ表示） */}
      <LessonHintBar />

      {/* タブパネル（ブックマーク / メモ / 詳細）*/}
      <div className="flex-1 overflow-hidden border-t border-neutral-800">
        <LessonTabs lessonId={selectedLesson.id} />
      </div>
    </div>
  )
}

// ─── 動画エリア（通常モード） ─────────────────────────────────────

function VideoAreaWrapper({ lessonId }: { lessonId: string }) {
  const videoSources = useCourseStore((s) => selectVideoSourcesByLesson(s, lessonId))
  const [activeIndex, setActiveIndex] = useState(0)

  // レッスン切り替え時: 先頭にリセットしてから最後に見ていたソースを復元する
  useEffect(() => {
    setActiveIndex(0)
    void db.playbackStates.get(lessonId).then((state) => {
      if (!state?.activeSourceId) return
      const idx = videoSources.findIndex((s) => s.id === state.activeSourceId)
      if (idx > 0) setActiveIndex(idx)
    })
    // videoSources は lessonId と同期して更新されるため deps に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  return (
    <VideoPlayer
      lessonId={lessonId}
      sources={videoSources}
      activeIndex={activeIndex}
      onSelectIndex={setActiveIndex}
    />
  )
}

// ─── 動画エリア（シアターモード） ─────────────────────────────────

function VideoAreaTheater({ lessonId }: { lessonId: string }) {
  const videoSources = useCourseStore((s) => selectVideoSourcesByLesson(s, lessonId))
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
    void db.playbackStates.get(lessonId).then((state) => {
      if (!state?.activeSourceId) return
      const idx = videoSources.findIndex((s) => s.id === state.activeSourceId)
      if (idx > 0) setActiveIndex(idx)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  return (
    <TheaterLayout
      lessonId={lessonId}
      sources={videoSources}
      activeIndex={activeIndex}
      onSelectIndex={setActiveIndex}
    />
  )
}
