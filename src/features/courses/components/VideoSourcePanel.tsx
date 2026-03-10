import { ExternalLink, Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { cn } from '../../../utils/cn'
import type { VideoSource } from '../../../types'
import { selectVideoSourcesByLesson, useCourseStore } from '../store'
import { VideoSourceCrudDialog } from './VideoSourceCrudDialog'

/**
 * レッスンの動画ソース管理パネル。
 * LearningView の「詳細」タブ内で使用する。
 */
export function VideoSourcePanel({ lessonId }: { lessonId: string }) {
  const videoSources = useCourseStore((s) => selectVideoSourcesByLesson(s, lessonId))
  const { deleteVideoSource } = useCourseStore()

  const [addOpen, setAddOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<VideoSource | null>(null)
  const [deletingSource, setDeletingSource] = useState<VideoSource | null>(null)

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
          動画ソース
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
        >
          <Plus className="h-3 w-3" />
          追加
        </button>
      </div>

      {videoSources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 py-4 text-center">
          <p className="text-xs text-neutral-700">動画が登録されていません</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-1.5 text-[11px] text-accent-600 hover:text-accent-400"
          >
            動画を追加する
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {videoSources.map((vs) => (
            <VideoSourceRow
              key={vs.id}
              source={vs}
              onEdit={() => setEditingSource(vs)}
              onDelete={() => setDeletingSource(vs)}
            />
          ))}
        </div>
      )}

      <VideoSourceCrudDialog isOpen={addOpen} onClose={() => setAddOpen(false)} lessonId={lessonId} />
      <VideoSourceCrudDialog
        isOpen={editingSource !== null}
        onClose={() => setEditingSource(null)}
        lessonId={lessonId}
        videoSource={editingSource ?? undefined}
      />
      <ConfirmDialog
        isOpen={deletingSource !== null}
        onClose={() => setDeletingSource(null)}
        onConfirm={async () => {
          if (deletingSource) {
            await deleteVideoSource(deletingSource.id)
            setDeletingSource(null)
          }
        }}
        title="動画ソースを削除"
        description={`「${deletingSource?.displayName ?? deletingSource?.src}」を削除しますか？この操作は取り消せません。`}
      />
    </div>
  )
}

// ─── 動画ソース行 ───────────────────────────────────────────────

const TYPE_LABELS: Record<VideoSource['type'], string> = {
  local: 'ローカル',
  remote: '外部 URL',
  youtube: 'YouTube',
}

const TYPE_COLORS: Record<VideoSource['type'], string> = {
  local: 'bg-neutral-800 text-neutral-400',
  remote: 'bg-blue-950/60 text-blue-400',
  youtube: 'bg-red-950/60 text-red-400',
}

function VideoSourceRow({
  source,
  onEdit,
  onDelete,
}: {
  source: VideoSource
  onEdit: () => void
  onDelete: () => void
}) {
  const label = source.displayName ?? source.src

  const handleOpenExternal = () => {
    if (source.type === 'youtube' || source.type === 'remote') {
      window.open(source.src, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-2.5 py-1.5">
      <span
        className={cn(
          'flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
          TYPE_COLORS[source.type],
        )}
      >
        {TYPE_LABELS[source.type]}
      </span>
      <span className="flex-1 truncate text-xs text-neutral-500" title={label}>
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        {(source.type === 'youtube' || source.type === 'remote') && (
          <button
            onClick={handleOpenExternal}
            title="ブラウザで開く"
            className="rounded p-0.5 text-neutral-700 transition-colors hover:text-neutral-400"
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={onEdit}
          title="編集"
          className="rounded p-0.5 text-neutral-700 transition-colors hover:text-neutral-400"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          title="削除"
          className="rounded p-0.5 text-neutral-700 transition-colors hover:text-red-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
