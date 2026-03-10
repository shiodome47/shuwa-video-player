import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { Dialog } from './Dialog'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  /** 確認ボタンのラベル（デフォルト: 削除） */
  confirmLabel?: string
  /** danger（赤）または default（グレー） */
  variant?: 'danger' | 'default'
}

/**
 * 削除・破壊的操作の確認ダイアログ。
 * 確認ボタン押下中はローディング状態になり、二重クリックを防ぐ。
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '削除',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* アイコン + 説明 */}
        <div className="flex gap-3">
          {variant === 'danger' && (
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          )}
          <p className="text-sm leading-relaxed text-neutral-400">{description}</p>
        </div>

        {/* アクション */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
            キャンセル
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? '処理中...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
