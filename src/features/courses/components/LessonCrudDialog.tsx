import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { FormField } from '../../../components/ui/FormField'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import type { Lesson } from '../../../types'
import { useCourseStore } from '../store'

interface LessonCrudDialogProps {
  isOpen: boolean
  onClose: () => void
  /** 新規作成時に必要 */
  sectionId?: string
  courseId?: string
  /** undefined = 新規作成、defined = 編集 */
  lesson?: Lesson
}

/**
 * レッスンの作成・編集ダイアログ。
 * タグはカンマ区切りで入力（例: 挨拶, 基本）。
 */
export function LessonCrudDialog({
  isOpen,
  onClose,
  sectionId,
  courseId,
  lesson,
}: LessonCrudDialogProps) {
  const isEdit = lesson !== undefined
  const { addLesson, updateLesson } = useCourseStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(lesson?.title ?? '')
      setDescription(lesson?.description ?? '')
      setTagsInput(lesson?.tags.join(', ') ?? '')
      setTitleError('')
      setIsSubmitting(false)
    }
  }, [isOpen, lesson])

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('レッスン名は必須です')
      return false
    }
    return true
  }

  const parseTags = (input: string): string[] =>
    input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const targetSectionId = isEdit ? lesson.sectionId : sectionId
    const targetCourseId = isEdit ? lesson.courseId : courseId
    if (!targetSectionId || !targetCourseId) return

    setIsSubmitting(true)
    try {
      if (isEdit) {
        await updateLesson(lesson.id, {
          title: title.trim(),
          description: description.trim(),
          tags: parseTags(tagsInput),
        })
      } else {
        await addLesson({
          sectionId: targetSectionId,
          courseId: targetCourseId,
          title: title.trim(),
          description: description.trim(),
          tags: parseTags(tagsInput),
        })
      }
      onClose()
    } catch {
      console.error('[LessonCrudDialog] 保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'レッスンを編集' : 'レッスンを追加'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="レッスン名" required error={titleError}>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError('')
            }}
            placeholder="例: おはようございます"
            autoFocus
          />
        </FormField>

        <FormField label="説明">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="レッスンの説明（任意）"
            rows={2}
          />
        </FormField>

        <FormField
          label="タグ"
          hint="カンマ区切りで入力（例: 挨拶, 基本, 日常）"
        >
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="挨拶, 基本"
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
