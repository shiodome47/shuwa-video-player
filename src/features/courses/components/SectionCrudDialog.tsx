import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import type { Section } from '../../../types'
import { useCourseStore } from '../store'

interface SectionCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  /** 新規作成時: セクションを追加するコースの ID */
  courseId?: string
  /** undefined = 新規作成、defined = 編集 */
  section?: Section
}

/**
 * セクションの作成・編集ダイアログ。
 */
export function SectionCrudDialog({
  isOpen,
  onClose,
  courseId,
  section,
}: SectionCrudDialogProps) {
  const isEdit = section !== undefined
  const { addSection, updateSection } = useCourseStore()

  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(section?.title ?? '')
      setTitleError('')
      setIsSubmitting(false)
    }
  }, [isOpen, section])

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('セクション名は必須です')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const targetCourseId = isEdit ? section.courseId : courseId
    if (!targetCourseId) return

    setIsSubmitting(true)
    try {
      if (isEdit) {
        await updateSection(section.id, { title: title.trim() })
      } else {
        await addSection({ courseId: targetCourseId, title: title.trim() })
      }
      onClose()
    } catch {
      console.error('[SectionCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'セクションを編集' : 'セクションを追加'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="セクション名" required error={titleError}>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError('')
            }}
            placeholder="例: 第1章 挨拶"
            autoFocus
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
