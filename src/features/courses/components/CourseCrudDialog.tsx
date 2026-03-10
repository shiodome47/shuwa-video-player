import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import type { Course } from '../../../types'
import { useCourseStore } from '../store'

interface CourseCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  /** undefined = 新規作成、defined = 編集 */
  course?: Course
}

/**
 * コースの作成・編集ダイアログ。
 */
export function CourseCrudDialog({ isOpen, onClose, course }: CourseCrudDialogProps) {
  const isEdit = course !== undefined
  const { addCourse, updateCourse } = useCourseStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ダイアログが開くたびにフォームを初期化
  useEffect(() => {
    if (isOpen) {
      setTitle(course?.title ?? '')
      setDescription(course?.description ?? '')
      setTitleError('')
      setIsSubmitting(false)
    }
  }, [isOpen, course])

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('コース名は必須です')
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
        await updateCourse(course.id, {
          title: title.trim(),
          description: description.trim(),
        })
      } else {
        await addCourse({ title: title.trim(), description: description.trim() })
      }
      onClose()
    } catch {
      // Phase 7: トースト通知に差し替える
      console.error('[CourseCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEdit ? 'コースを編集' : 'コースを追加'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="コース名" required error={titleError}>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError('')
            }}
            placeholder="例: 手話技能検定 5級"
            autoFocus
          />
        </FormField>

        <FormField label="説明">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="コースの説明（任意）"
            rows={3}
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
