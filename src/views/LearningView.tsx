import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { selectVideoSourcesByLesson, useCourseStore } from '../features/courses/store'
import { LessonTabs } from '../features/learning/components/LessonTabs'
import { LessonHintBar } from '../components/LessonHintBar'
import { useLearningStore } from '../features/learning/store'
import { VideoPlayer } from '../features/player/components/VideoPlayer'
import { db } from '../storage/db'

/**
 * 学習ビュー（Phase 5A）。
 *
 * 変更点:
 * - LessonPanel を LessonTabs（ブックマーク・メモ・詳細）に置き換え
 * - レッスン選択時に useLearningStore.loadForLesson を呼んでデータを初期化
 * - VideoSourcePanel / 進捗は「詳細」タブ内に収容
 */
export function LearningView() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const { lessons } = useCourseStore()
  const selectedLesson = lessonId ? lessons.find((l) => l.id === lessonId) : undefined

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

// ─── 動画エリア ──────────────────────────────────────────────────

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
