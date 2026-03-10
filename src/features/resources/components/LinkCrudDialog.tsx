import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import type { ResourceLink } from '../../../types'
import { isSafeUrl } from '../../../utils/url'
import { useResourceStore } from '../store'

interface LinkCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  link?: ResourceLink
  /** 新規作成時のデフォルトカテゴリ ID */
  defaultCategoryId?: string
}

/**
 * リソースリンクの作成・編集ダイアログ。
 */
export function LinkCrudDialog({
  isOpen,
  onClose,
  link,
  defaultCategoryId,
}: LinkCrudDialogProps) {
  const isEdit = link !== undefined
  const { categories, addLink, updateLink } = useResourceStore()

  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errors, setErrors] = useState<{ title?: string; url?: string; category?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCategoryId(link?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '')
      setTitle(link?.title ?? '')
      setUrl(link?.url ?? '')
      setDescription(link?.description ?? '')
      setTagsInput(link?.tags.join(', ') ?? '')
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, link, defaultCategoryId, categories])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = 'タイトルは必須です'
    if (!url.trim()) {
      newErrors.url = 'URL は必須です'
    } else if (!isSafeUrl(url.trim())) {
      newErrors.url = '有効な URL を入力してください（https://...）'
    }
    if (!categoryId) newErrors.category = 'カテゴリを選択してください'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const parseTags = (input: string): string[] =>
    input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isEdit) {
        await updateLink(link.id, {
          categoryId,
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: parseTags(tagsInput),
        })
      } else {
        await addLink({
          categoryId,
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: parseTags(tagsInput),
        })
      }
      onClose()
    } catch {
      console.error('[LinkCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // カテゴリが 0 件のときはリンクを追加できない
  if (categories.length === 0) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title="リソースを追加" size="sm">
        <div className="py-4 text-center">
          <p className="text-sm text-neutral-400">
            先にカテゴリを作成してください
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            「カテゴリ」ボタンからカテゴリを追加できます
          </p>
          <Button variant="ghost" size="sm" onClick={onClose} className="mt-4">
            閉じる
          </Button>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'リソースを編集' : 'リソースを追加'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="カテゴリ" required error={errors.category}>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setErrors((prev) => ({ ...prev, category: undefined }))
            }}
          >
            <option value="" disabled>
              カテゴリを選択
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="タイトル" required error={errors.title}>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="例: 手話単語検索アプリ"
            autoFocus
          />
        </FormField>

        <FormField label="URL" required error={errors.url}>
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setErrors((prev) => ({ ...prev, url: undefined }))
            }}
            placeholder="https://..."
          />
        </FormField>

        <FormField label="説明">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このリソースの使い方や特徴（任意）"
            rows={2}
          />
        </FormField>

        <FormField label="タグ" hint="カンマ区切りで入力（例: 単語, 検索）">
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="単語, 検索"
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
