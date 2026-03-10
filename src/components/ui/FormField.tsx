import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  /** エラーメッセージ（あれば赤字で表示） */
  error?: string
  /** 必須マーク（*）を表示する */
  required?: boolean
  children: ReactNode
  /** 補足テキスト */
  hint?: string
}

/**
 * ラベル + 入力要素 + エラーメッセージをまとめたフォームフィールドラッパー。
 * 各 CRUD ダイアログで使用する。
 */
export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-medium text-neutral-300">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] leading-relaxed text-neutral-600">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
