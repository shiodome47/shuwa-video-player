import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { useCourseStore } from '../../courses/store'
import { useLearningStore } from '../store'
import { cn } from '../../../utils/cn'

/**
 * レッスンの進捗セクション。
 * - 完了チェック（Lesson.isCompleted と Progress を同期）
 * - 累積視聴時間の表示
 */
export function ProgressSection({ lessonId }: { lessonId: string }) {
  const lesson = useCourseStore((s) => s.lessons.find((l) => l.id === lessonId))
  const { progress, toggleCompletion } = useLearningStore()

  if (!lesson) return null

  const watchedSeconds = progress?.totalWatchedSeconds ?? 0
  const watchedDisplay = formatWatchTime(watchedSeconds)

  const handleToggle = () => {
    void toggleCompletion(lesson.id, lesson.courseId)
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {/* 完了チェック */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
          lesson.isCompleted
            ? 'bg-accent-900/40 text-accent-300 hover:bg-accent-900/60'
            : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300',
        )}
        title={lesson.isCompleted ? '完了を取り消す' : 'このレッスンを完了にする'}
      >
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-400" />
        ) : (
          <Circle className="h-3.5 w-3.5" />
        )}
        {lesson.isCompleted ? '完了済み' : '未完了'}
      </button>

      {/* 視聴時間 */}
      {watchedSeconds > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-neutral-600">
          <Clock className="h-3 w-3" />
          <span>{watchedDisplay}</span>
        </div>
      )}
    </div>
  )
}

function formatWatchTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}秒`
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m < 60) return s > 0 ? `${m}分${s}秒` : `${m}分`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}時間${rm}分`
}
