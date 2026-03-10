import { type FormEvent, useEffect, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import type { VideoSource, VideoSourceType } from '../../../types'
import { isSafeUrl, isYouTubeUrl } from '../../../utils/url'
import { useCourseStore } from '../store'
import { saveFileHandle } from '../../../storage/fileHandleStore'
import { cn } from '../../../utils/cn'

interface VideoSourceCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  /** 新規登録先のレッスン ID */
  lessonId: string
  /** undefined = 新規作成、defined = 編集 */
  videoSource?: VideoSource
}

const TYPE_OPTIONS: { value: VideoSourceType; label: string; description: string }[] = [
  {
    value: 'youtube',
    label: 'YouTube',
    description: 'YouTube の動画 URL を入力。共有・複数端末向き',
  },
  {
    value: 'remote',
    label: '外部 URL',
    description: 'mp4 等のダイレクトリンクを入力。共有・複数端末向き',
  },
  {
    value: 'local',
    label: 'ローカル',
    description: '手元の動画ファイルを使う。このブラウザ内でのみ再生可',
  },
]

type PickerFn = (options?: {
  types?: Array<{ description?: string; accept: Record<string, string[]> }>
  multiple?: boolean
}) => Promise<FileSystemFileHandle[]>

const hasPicker = typeof window !== 'undefined' && 'showOpenFilePicker' in window

async function pickVideoFile(): Promise<FileSystemFileHandle | null> {
  if (!hasPicker) return null
  const picker = (window as unknown as { showOpenFilePicker: PickerFn }).showOpenFilePicker
  try {
    const [handle] = await picker({
      types: [
        {
          description: '動画ファイル',
          accept: { 'video/*': ['.mp4', '.webm', '.mkv', '.mov', '.avi', '.m4v', '.3gp'] },
        },
      ],
    })
    return handle
  } catch (e) {
    if ((e as Error).name === 'AbortError') return null
    throw e
  }
}

export function VideoSourceCrudDialog({
  isOpen,
  onClose,
  lessonId,
  videoSource,
}: VideoSourceCrudDialogProps) {
  const isEdit = videoSource !== undefined
  const { addVideoSource, updateVideoSource } = useCourseStore()

  const [type, setType] = useState<VideoSourceType>('youtube')
  const [src, setSrc] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [srcError, setSrcError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // local タブ専用
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setType(videoSource?.type ?? 'youtube')
      setSrc(videoSource?.src ?? '')
      setDisplayName(videoSource?.displayName ?? '')
      setSrcError('')
      setIsSubmitting(false)
      setFileHandle(null)
      setPicking(false)
    }
  }, [isOpen, videoSource])

  const handleTypeChange = (newType: VideoSourceType) => {
    setType(newType)
    setSrc('')
    setSrcError('')
    setFileHandle(null)
  }

  const handlePickFile = async () => {
    setPicking(true)
    setSrcError('')
    try {
      const handle = await pickVideoFile()
      if (handle) {
        setFileHandle(handle)
        setSrc(handle.name)
      }
    } catch {
      setSrcError('ファイルの選択に失敗しました')
    } finally {
      setPicking(false)
    }
  }

  const validate = (): boolean => {
    if (type === 'local') {
      // 新規: handle が必須。編集: 既存 src があれば OK
      if (!fileHandle && !src.trim()) {
        setSrcError('動画ファイルを選択してください')
        return false
      }
      return true
    }
    if (!src.trim()) {
      setSrcError('入力してください')
      return false
    }
    if (type === 'remote' && !isSafeUrl(src.trim())) {
      setSrcError('有効な URL を入力してください（https://...）')
      return false
    }
    if (type === 'youtube' && !isYouTubeUrl(src.trim())) {
      setSrcError('有効な YouTube URL を入力してください')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isEdit) {
        await updateVideoSource(videoSource.id, {
          type,
          src: src.trim(),
          displayName: displayName.trim() || undefined,
        })
        // 編集時に新しいファイルを選び直した場合はハンドルを上書き保存
        if (type === 'local' && fileHandle) {
          await saveFileHandle(videoSource.id, fileHandle)
        }
      } else {
        const source = await addVideoSource({
          lessonId,
          type,
          src: src.trim(),
          displayName: displayName.trim() || undefined,
        })
        // local の場合はファイルハンドルをその場で保存して関連付けまで完了
        if (type === 'local' && fileHandle) {
          await saveFileHandle(source.id, fileHandle)
          await updateVideoSource(source.id, { localFileHandleKey: source.id })
        }
      }
      onClose()
    } catch {
      console.error('[VideoSourceCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '動画ソースを編集' : '動画ソースを追加'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 動画タイプ選択 */}
        <FormField label="動画の種類" required>
          <div className="flex overflow-hidden rounded-lg border border-neutral-700">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTypeChange(opt.value)}
                className={cn(
                  'flex-1 py-2 text-xs font-medium transition-colors',
                  type === opt.value
                    ? 'bg-accent-700 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-neutral-600">
            {TYPE_OPTIONS.find((o) => o.value === type)?.description}
          </p>
        </FormField>

        {/* local タブ: ファイル選択UI */}
        {type === 'local' && (
          <FormField label="動画ファイル" required error={srcError}>
            {!hasPicker ? (
              <p className="text-xs text-neutral-500">
                ローカルファイルの選択には Chrome または Edge が必要です。
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void handlePickFile()}
                  disabled={picking}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200 disabled:opacity-50"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  {picking
                    ? '選択中…'
                    : src
                      ? src
                      : 'ファイルを選択（mp4・webm 推奨）'}
                </button>
                {src && (
                  <p className="mt-1 text-[11px] text-neutral-600">
                    選択済み: <span className="text-neutral-500">{src}</span>

                    <button
                      type="button"
                      onClick={() => void handlePickFile()}
                      className="text-neutral-500 underline hover:text-neutral-300"
                    >
                      選び直す
                    </button>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-neutral-700">
                  ファイルの関連付けはこのブラウザ内にのみ保存されます。
                  別ブラウザ・別端末では再選択が必要です。
                </p>
              </>
            )}
          </FormField>
        )}

        {/* remote / youtube タブ: URL入力 */}
        {type !== 'local' && (
          <FormField
            label={type === 'youtube' ? 'YouTube URL' : '動画 URL'}
            required
            error={srcError}
          >
            <Input
              value={src}
              onChange={(e) => {
                setSrc(e.target.value)
                setSrcError('')
              }}
              placeholder={
                type === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : 'https://example.com/video.mp4'
              }
              autoFocus
            />
          </FormField>
        )}

        {/* 表示名（任意）*/}
        <FormField label="表示名" hint="省略するとファイル名 / URL から自動生成されます">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例: DVD 第1章 - おはようございます"
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : isEdit ? '保存' : '追加'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
