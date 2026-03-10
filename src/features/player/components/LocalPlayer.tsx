import { FolderOpen, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCourseStore } from '../../../features/courses/store'
import { getFileHandle, saveFileHandle, queryReadPermission, requestReadPermission } from '../../../storage/fileHandleStore'
import type { VideoSource } from '../../../types'
import { NativePlayer } from './NativePlayer'

interface LocalPlayerProps {
  lessonId: string
  source: VideoSource
  onEnded?: () => void
}

type LocalStatus =
  | { kind: 'loading' }
  | { kind: 'no-handle' }
  | { kind: 'need-permission'; handle: FileSystemFileHandle }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; objectUrl: string }

/**
 * ローカルファイル（type === 'local'）のプレイヤー。
 * File System Access API でファイルを選択・関連付けし、blob URL を NativePlayer に渡す。
 *
 * 状態遷移:
 * 1. loading    — DB からハンドルを取得中
 * 2. no-handle  — ハンドル未保存 → ファイル選択を促す
 * 3. need-permission — ハンドルあるが許可切れ → ユーザーに許可を求める
 * 4. error      — ファイル消失など → 再選択を促す
 * 5. ready      — blob URL 取得済み → NativePlayer へ
 */
export function LocalPlayer({ lessonId, source, onEnded }: LocalPlayerProps) {
  const [status, setStatus] = useState<LocalStatus>({ kind: 'loading' })
  const objectUrlRef = useRef<string | null>(null)
  // reloadCount を増やすと useEffect が再実行される
  const [reloadCount, setReloadCount] = useState(0)
  // 最新の source を useEffect の中から参照するための ref
  const sourceRef = useRef(source)
  sourceRef.current = source

  // ── ファイル読み込み ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    // 前の blob URL を破棄
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    const key = sourceRef.current.localFileHandleKey

    if (!key) {
      setStatus({ kind: 'no-handle' })
      return
    }

    setStatus({ kind: 'loading' })

    void (async () => {
      const handle = await getFileHandle(key)
      if (cancelled) return

      if (!handle) {
        setStatus({ kind: 'no-handle' })
        return
      }

      const perm = await queryReadPermission(handle)
      if (cancelled) return

      if (perm !== 'granted') {
        setStatus({ kind: 'need-permission', handle })
        return
      }

      try {
        const file = await handle.getFile()
        if (cancelled) return
        const url = URL.createObjectURL(file)
        objectUrlRef.current = url
        setStatus({ kind: 'ready', objectUrl: url })
      } catch {
        if (!cancelled) {
          setStatus({ kind: 'error', message: 'ファイルを開けませんでした。ファイルが移動・削除された可能性があります。' })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [reloadCount]) // sourceRef.current は常に最新のため deps に含めない

  // アンマウント時に blob URL を解放
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  // ── ファイル選択 ─────────────────────────────────────────────
  const handlePickFile = async () => {
    type PickerFn = (options?: {
      types?: Array<{ description?: string; accept: Record<string, string[]> }>
      multiple?: boolean
      excludeAcceptAllOption?: boolean
    }) => Promise<FileSystemFileHandle[]>

    const picker = (window as Window & { showOpenFilePicker?: PickerFn }).showOpenFilePicker

    if (!picker) {
      setStatus({
        kind: 'error',
        message: 'ファイル選択は Chrome / Edge が必要です（このブラウザは未対応）',
      })
      return
    }

    try {
      setStatus({ kind: 'loading' })
      const [handle] = await picker({
        types: [
          {
            description: '動画ファイル',
            accept: { 'video/*': ['.mp4', '.webm', '.mkv', '.mov', '.avi', '.m4v', '.3gp'] },
          },
        ],
        multiple: false,
        excludeAcceptAllOption: false,
      })

      const key = sourceRef.current.id
      await saveFileHandle(key, handle)
      await useCourseStore.getState().updateVideoSource(sourceRef.current.id, {
        localFileHandleKey: key,
        displayName: handle.name,
      })
      // source.localFileHandleKey が変わると reloadCount を増やしてロードを再実行
      setReloadCount((c) => c + 1)
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        // ユーザーがキャンセル — 直前の状態に戻す
        setReloadCount((c) => c + 1)
      } else {
        setStatus({ kind: 'error', message: 'ファイルの選択に失敗しました' })
      }
    }
  }

  // ── 権限リクエスト ────────────────────────────────────────────
  const handleRequestPermission = async (handle: FileSystemFileHandle) => {
    try {
      const result = await requestReadPermission(handle)
      if (result === 'granted') {
        setReloadCount((c) => c + 1)
      } else {
        // ユーザーが拒否 — 現状維持（ボタンを再度押せる）
      }
    } catch {
      setStatus({ kind: 'error', message: '権限の取得に失敗しました' })
    }
  }

  // ── 状態に応じたUI ───────────────────────────────────────────
  if (status.kind === 'loading') {
    return (
      <div
        className="flex w-full items-center justify-center bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
      </div>
    )
  }

  if (status.kind === 'no-handle') {
    return (
      <LocalStateScreen
        icon={<FolderOpen className="h-10 w-10" />}
        title="動画ファイルを選択してください"
        description="ローカル動画はこのブラウザ内でのみ再生できます。別のブラウザ・端末では再選択が必要です。"
        action={
          <button onClick={handlePickFile} className={actionBtnClass}>
            <FolderOpen className="h-3.5 w-3.5" />
            ファイルを選択
          </button>
        }
      />
    )
  }

  if (status.kind === 'need-permission') {
    return (
      <LocalStateScreen
        icon={<ShieldAlert className="h-10 w-10 text-amber-500" />}
        title="ファイルへのアクセス許可が必要です"
        description={`「${source.displayName ?? 'ファイル'}」を再生するには、ブラウザの許可が必要です。`}
        action={
          <>
            <button
              onClick={() => handleRequestPermission(status.handle)}
              className={actionBtnClass}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              許可する
            </button>
            <button onClick={handlePickFile} className={secondaryBtnClass}>
              別のファイルを選択
            </button>
          </>
        }
      />
    )
  }

  if (status.kind === 'error') {
    return (
      <LocalStateScreen
        icon={<AlertCircle className="h-10 w-10 text-red-400" />}
        title="ファイルを開けませんでした"
        description={status.message}
        action={
          <button onClick={handlePickFile} className={actionBtnClass}>
            <FolderOpen className="h-3.5 w-3.5" />
            ファイルを再選択
          </button>
        }
      />
    )
  }

  // ready — NativePlayer に blob URL を渡す
  return (
    <NativePlayer
      lessonId={lessonId}
      source={{ ...source, src: status.objectUrl }}
      onEnded={onEnded}
    />
  )
}

// ── 共通スタイル ─────────────────────────────────────────────────

const actionBtnClass =
  'flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700'

const secondaryBtnClass =
  'rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-300'

// ── 状態画面の共通レイアウト ─────────────────────────────────────

function LocalStateScreen({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 bg-black"
      style={{ aspectRatio: '16/9' }}
    >
      <div className="text-neutral-600">{icon}</div>
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      <p className="max-w-xs text-center text-xs leading-relaxed text-neutral-600">
        {description}
      </p>
      <div className="mt-1 flex items-center gap-2">{action}</div>
    </div>
  )
}
