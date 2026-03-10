import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import type { ResourceCategory } from '../../../types'
import { useResourceStore } from '../store'
import { cn } from '../../../utils/cn'

interface CategoryCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  category?: ResourceCategory
}

const COLOR_OPTIONS = [
  { value: 'teal', label: 'ティール', bgClass: 'bg-teal-500' },
  { value: 'blue', label: 'ブルー', bgClass: 'bg-blue-500' },
  { value: 'purple', label: 'パープル', bgClass: 'bg-purple-500' },
  { value: 'pink', label: 'ピンク', bgClass: 'bg-pink-500' },
  { value: 'orange', label: 'オレンジ', bgClass: 'bg-orange-500' },
  { value: 'red', label: 'レッド', bgClass: 'bg-red-500' },
  { value: 'yellow', label: 'イエロー', bgClass: 'bg-yellow-500' },
  { value: 'green', label: 'グリーン', bgClass: 'bg-green-500' },
]

/**
 * リソースカテゴリの作成・編集ダイアログ。
 */
export function CategoryCrudDialog({
  isOpen,
  onClose,
  category,
}: CategoryCrudDialogProps) {
  const isEdit = category !== undefined
  const { addCategory, updateCategory } = useResourceStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('teal')
  const [nameError, setNameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? '')
      setDescription(category?.description ?? '')
      setColor(category?.color ?? 'teal')
      setNameError('')
      setIsSubmitting(false)
    }
  }, [isOpen, category])

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError('カテゴリ名は必須です')
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
        await updateCategory(category.id, {
          name: name.trim(),
          description: description.trim(),
          color,
        })
      } else {
        await addCategory({ name: name.trim(), description: description.trim(), color })
      }
      onClose()
    } catch {
      console.error('[CategoryCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'カテゴリを編集' : 'カテゴリを追加'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="カテゴリ名" required error={nameError}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameError('')
            }}
            placeholder="例: 単語検索"
            autoFocus
          />
        </FormField>

        <FormField label="説明">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="カテゴリの説明（任意）"
          />
        </FormField>

        {/* カラースウォッチ */}
        <FormField label="カラー">
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                title={opt.label}
                className={cn(
                  'h-6 w-6 rounded-full transition-transform',
                  opt.bgClass,
                  color === opt.value
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110'
                    : 'opacity-60 hover:opacity-100',
                )}
                aria-label={opt.label}
                aria-pressed={color === opt.value}
              />
            ))}
          </div>
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
