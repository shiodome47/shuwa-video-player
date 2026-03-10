import { AlertCircle, CheckCircle2, Download, HelpCircle, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  downloadBackupJson,
  exportBackup,
  importBackup,
  parseBackupJson,
  type ShuwaBackup,
} from '../features/backup/backupUtils'
import { clearOnboarding } from '../components/OnboardingModal'
import { clearLessonHint } from '../components/LessonHintBar'
import { useUIStore, type Theme } from '../stores/ui'
import { cn } from '../utils/cn'
import { isSafeUrl, normalizeDropboxUrlForDownload } from '../utils/url'

const LAST_BACKUP_KEY = 'shuwa-last-backup-at'
const DETAILS_SEEN_KEY = 'shuwa-settings-details-seen'

function isDetailsSeen(): boolean {
  return localStorage.getItem(DETAILS_SEEN_KEY) === '1'
}

function markDetailsSeen() {
  localStorage.setItem(DETAILS_SEEN_KEY, '1')
}

function getLastBackupAt(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY)
}

function saveLastBackupAt() {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
}

type ImportPhase = 'idle' | 'fetching' | 'preview' | 'importing' | 'done' | 'error'

/**
 * 設定画面（Phase 5B）。
 * データのエクスポート・インポート（バックアップ/リストア）を提供する。
 */
export function SettingsView() {
  const firstVisit = !isDetailsSeen()
  const [showDetails, setShowDetails] = useState(() => {
    if (firstVisit) {
      markDetailsSeen()
      return true
    }
    return false
  })
  // true if this is the first render (before user toggles) — used to style the button on first visit
  const [wasFirstVisit] = useState(firstVisit)

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">設定</h1>
        <button
          onClick={() => setShowDetails((s) => !s)}
          className={cn(
            'flex-shrink-0 rounded px-2 py-1 text-[11px] transition-colors',
            wasFirstVisit && showDetails
              ? 'bg-accent-900/50 text-accent-400 hover:bg-accent-900/30 hover:text-accent-300'
              : 'text-neutral-600 hover:text-neutral-400',
          )}
        >
          {showDetails ? '補足を隠す ▴' : '補足を表示 ▾'}
        </button>
      </div>
      {showDetails && (
        <p className="mb-6 text-xs leading-relaxed text-neutral-600">
          学習データはこのブラウザの IndexedDB に保存されています。
          ブラウザのデータ消去・端末の変更・OSの再インストール等でデータが失われる場合があります。
          大切なデータは定期的に JSON エクスポートしてください。
        </p>
      )}
      <div className="space-y-4">
        <ThemeSection />
        <ExportSection showDetails={showDetails} />
        <ImportSection showDetails={showDetails} />
        <VideoSourceGuide showDetails={showDetails} />
        <GuideResetSection />
      </div>
    </div>
  )
}

// ─── テーマ ────────────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
  { value: 'system', label: 'システム' },
]

function ThemeSection() {
  const { theme, setTheme } = useUIStore()

  return (
    <SectionCard title="テーマ" description="アプリの表示テーマを選択します。システムは OS の設定に従います。">
      <div className="mt-3 flex gap-1">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'rounded px-3 py-1.5 text-xs font-medium transition-colors',
              theme === opt.value
                ? 'bg-accent-700 text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── エクスポート ──────────────────────────────────────────────

function ExportSection({ showDetails }: { showDetails: boolean }) {
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(getLastBackupAt)

  const handleExport = async () => {
    setExporting(true)
    setDone(false)
    try {
      const backup = await exportBackup()
      downloadBackupJson(backup)
      saveLastBackupAt()
      setLastBackupAt(getLastBackupAt())
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <SectionCard
      title="データをエクスポート"
      description="コース・レッスン・ブックマーク・メモ・進捗などを JSON ファイルとして保存します。"
    >
      {/* 最終バックアップ日時 */}
      <div className="mt-3 flex items-center gap-2">
        {lastBackupAt ? (
          <p className="text-[11px] text-neutral-500">
            最終バックアップ: {new Date(lastBackupAt).toLocaleString('ja-JP')}
          </p>
        ) : (
          <p className="text-[11px] text-amber-600">
            まだバックアップされていません
          </p>
        )}
      </div>

      {showDetails && (
        <Note>
          コース追加・メモ記録・ブックマーク追加・進捗更新の後はバックアップを推奨します。
          ローカル動画のファイル参照は含まれません（YouTube・外部 URL は含まれます）。
        </Note>
      )}

      <button
        onClick={() => void handleExport()}
        disabled={exporting}
        className="mt-4 flex items-center gap-2 rounded-lg bg-accent-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
      >
        {done ? (
          <><CheckCircle2 className="h-4 w-4" />ダウンロード完了</>
        ) : (
          <><Download className="h-4 w-4" />{exporting ? 'エクスポート中…' : 'JSON をダウンロード'}</>
        )}
      </button>
    </SectionCard>
  )
}

// ─── インポート ───────────────────────────────────────────────

function ImportSection({ showDetails }: { showDetails: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<ImportPhase>('idle')
  const [preview, setPreview] = useState<ShuwaBackup | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [importMode, setImportMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const navigate = useNavigate()

  // JSON テキストをパースしてプレビューフェーズに進む（ファイル・URL 共通）
  const processText = (text: string) => {
    try {
      const parsed = parseBackupJson(text)
      setPreview(parsed)
      setPhase('preview')
      setErrorMsg('')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '不明なエラー')
      setPhase('error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return
      processText(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleUrlFetch = async () => {
    const raw = urlInput.trim()
    if (!raw) {
      setErrorMsg('URL を入力してください')
      setPhase('error')
      return
    }
    if (!isSafeUrl(raw)) {
      setErrorMsg('有効な URL を入力してください（https://... または http://...）')
      setPhase('error')
      return
    }
    const normalized = normalizeDropboxUrlForDownload(raw)
    setPhase('fetching')
    try {
      const res = await fetch(normalized)
      if (!res.ok) {
        throw new Error(`取得に失敗しました（HTTP ${res.status}）`)
      }
      const text = await res.text()
      processText(text)
    } catch (err) {
      if (err instanceof TypeError) {
        // fetch が投げる TypeError は CORS・ネットワークエラー
        setErrorMsg('URL の取得に失敗しました。CORS 制限またはネットワークエラーの可能性があります。')
      } else {
        setErrorMsg(err instanceof Error ? err.message : '不明なエラー')
      }
      setPhase('error')
    }
  }

  const handleImport = async () => {
    if (!preview) return
    setPhase('importing')
    try {
      await importBackup(preview)
      setPhase('done')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '不明なエラー')
      setPhase('error')
    }
  }

  const handleReset = () => {
    setPhase('idle')
    setPreview(null)
    setErrorMsg('')
  }

  return (
    <SectionCard
      title="データをインポート"
      description="JSON バックアップファイルを読み込みます。現在のデータはすべて上書きされます。"
    >
      <Note variant="warning">
        インポートすると現在の全データが置き換えられます。事前にエクスポートしてバックアップを
        取っておくことをおすすめします。
      </Note>
      {showDetails && (
        <Note>
          インポート後、ローカル動画が登録されているレッスンではプレイヤーから再度ファイルを選択してください。
          YouTube・外部 URL は影響ありません。
        </Note>
      )}

      {phase === 'idle' && (
        <>
          {/* インポート方法の切り替え */}
          <div className="mt-3 flex gap-1">
            {(['file', 'url'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setImportMode(mode)}
                className={cn(
                  'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                  importMode === mode
                    ? 'bg-accent-700 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
                )}
              >
                {mode === 'file' ? 'ファイルから' : 'URLから'}
              </button>
            ))}
          </div>

          {/* ファイル選択 */}
          {importMode === 'file' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
              >
                <Upload className="h-4 w-4" />
                ファイルを選択
              </button>
            </>
          )}

          {/* URL 入力 */}
          {importMode === 'url' && (
            <div className="mt-3 space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-accent-600"
              />
              <p className="text-[11px] text-neutral-600">
                JSON を直接取得できる URL を入力してください。Dropbox のリンクは自動で補正しますが、取得できない場合は一度端末にダウンロードし、「ファイルから」でインポートしてください。
              </p>
              <button
                onClick={() => void handleUrlFetch()}
                disabled={!urlInput.trim()}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                取得してプレビュー
              </button>
            </div>
          )}
        </>
      )}

      {phase === 'fetching' && (
        <p className="mt-4 text-sm text-neutral-400">取得中…</p>
      )}

      {phase === 'preview' && preview && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-400">
            <p className="font-medium text-neutral-200">バックアップ情報</p>
            <p className="mt-1">エクスポート日時: {new Date(preview.exportedAt).toLocaleString('ja-JP')}</p>
            <p>コース: {preview.data.courses.length} 件 / レッスン: {preview.data.lessons.length} 件</p>
            <p>ブックマーク: {preview.data.bookmarks.length} 件 / メモ: {preview.data.notes.length} 件</p>
            <p>動画ソース: {preview.data.videoSources.length} 件（ローカルは要再リンク）</p>
          </div>
          <p className="text-xs text-amber-400">
            現在のデータはすべて上書きされます。よろしいですか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleImport()}
              className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              上書きしてインポート
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {phase === 'importing' && (
        <p className="mt-4 text-sm text-neutral-400">インポート中…</p>
      )}

      {phase === 'done' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          インポート完了。ホームに移動します…
        </div>
      )}

      {phase === 'error' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            やり直す
          </button>
        </div>
      )}
    </SectionCard>
  )
}

// ─── 動画ソース使い分け案内 ───────────────────────────────────

function VideoSourceGuide({ showDetails }: { showDetails: boolean }) {
  return (
    <SectionCard
      title="動画ソースの使い分け"
      description="用途に応じて適切なソースを選ぶと長期的に管理しやすくなります。"
    >
      {showDetails && (
        <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-neutral-500">
          <p>
            <span className="font-medium text-neutral-300">ローカル</span>
            {' '}—{' '}
            手元の動画を使いたいとき。このブラウザ・この端末でのみ再生可。
            別の端末や別ブラウザでは再リンクが必要です。下書きや一時素材に向いています。
          </p>
          <p>
            <span className="font-medium text-neutral-300">YouTube</span>
            {' '}—{' '}
            長期利用・複数端末での利用に向いています。限定公開にすれば URL を知っている人のみが視聴できます。
            ただし、機微な内容の動画には向かない場合があります。
          </p>
          <p>
            <span className="font-medium text-neutral-300">外部 URL</span>
            {' '}—{' '}
            自前サーバーやクラウドストレージの直接 URL を使うとき。
            URL が有効な限りどの端末でも再生できます。
          </p>
        </div>
      )}
    </SectionCard>
  )
}

// ─── ガイド再表示 ─────────────────────────────────────────────

function GuideResetSection() {
  const navigate = useNavigate()

  const handleReset = () => {
    clearOnboarding()
    clearLessonHint()
    navigate('/')
  }

  return (
    <SectionCard
      title="使い方ガイド"
      description="初回ガイドと学習画面のヒントを再表示します。"
    >
      <button
        onClick={handleReset}
        className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
      >
        <HelpCircle className="h-4 w-4" />
        ガイドを再表示
      </button>
    </SectionCard>
  )
}

// ─── 共通コンポーネント ────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{description}</p>
      {children}
    </div>
  )
}

function Note({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' }) {
  return (
    <p className={`mt-3 text-[11px] leading-relaxed ${variant === 'warning' ? 'text-amber-600' : 'text-neutral-600'}`}>
      {children}
    </p>
  )
}
