import { VideoSourcePanel } from '../../courses/components/VideoSourcePanel'
import { useCourseStore } from '../../courses/store'
import { ProgressSection } from './ProgressSection'

/**
 * 「詳細」タブの中身。
 * レッスン情報・進捗・動画ソース管理を縦に並べる。
 */
export function LessonDetailPanel({ lessonId }: { lessonId: string }) {
  const lesson = useCourseStore((s) => s.lessons.find((l) => l.id === lessonId))
  if (!lesson) return null

  return (
    <div className="divide-y divide-neutral-800/60">
      {/* レッスン情報 */}
      <div className="px-4 py-3">
        <h1 className="text-sm font-semibold text-neutral-100">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">{lesson.description}</p>
        )}
        {lesson.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 進捗 */}
      <ProgressSection lessonId={lessonId} />

      {/* 動画ソース */}
      <VideoSourcePanel lessonId={lessonId} />
    </div>
  )
}
