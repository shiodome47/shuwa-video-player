import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  GraduationCap,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useUIStore } from '../../../stores/ui'
import { cn } from '../../../utils/cn'
import type { Course, Lesson, Section } from '../../../types'
import {
  useCourseStore,
  selectSectionsByCourse,
  selectLessonsBySection,
} from '../store'
import { CourseCrudDialog } from './CourseCrudDialog'
import { LessonCrudDialog } from './LessonCrudDialog'
import { SectionCrudDialog } from './SectionCrudDialog'

/** ドラッグ開始までの最小距離・遅延（誤操作防止） */
const MOUSE_SENSOR_OPTIONS = { activationConstraint: { distance: 4 } } as const
const TOUCH_SENSOR_OPTIONS = { activationConstraint: { delay: 200, tolerance: 5 } } as const

/**
 * コース > セクション > レッスン の階層ツリー。
 * 各階層でドラッグ&ドロップによる並び替えに対応。
 */
export function CourseTree() {
  const courses = useCourseStore((s) => s.courses)
  const { reorderCourses } = useCourseStore()
  const [addCourseOpen, setAddCourseOpen] = useState(false)

  const sorted = [...courses].sort((a, b) => a.order - b.order)

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sorted.findIndex((c) => c.id === active.id)
    const newIndex = sorted.findIndex((c) => c.id === over.id)
    void reorderCourses(arrayMove(sorted, oldIndex, newIndex).map((c) => c.id))
  }

  return (
    <>
      <div className="space-y-0.5 px-2 pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {sorted.map((course) => (
              <CourseNode key={course.id} course={course} />
            ))}
          </SortableContext>
        </DndContext>

        <button
          onClick={() => setAddCourseOpen(true)}
          className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-400"
        >
          <Plus className="h-3.5 w-3.5" />
          コースを追加
        </button>
      </div>

      {courses.length === 0 && <CourseTreeEmpty onAdd={() => setAddCourseOpen(true)} />}

      <CourseCrudDialog isOpen={addCourseOpen} onClose={() => setAddCourseOpen(false)} />
    </>
  )
}

// ─── コースノード ──────────────────────────────────────────────

function CourseNode({ course }: { course: Course }) {
  const { expandedCourseIds, toggleCourseExpanded, deleteCourse, reorderSections } = useCourseStore()
  const sections = useCourseStore((s) => selectSectionsByCourse(s, course.id))

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const isExpanded = expandedCourseIds.includes(course.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
  )

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    void reorderSections(arrayMove(sections, oldIndex, newIndex).map((s) => s.id))
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* コースヘッダー行 */}
      <div className="group flex items-center gap-1 rounded-lg px-1 hover:bg-neutral-800">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab touch-none p-0.5 text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => toggleCourseExpanded(course.id)}
          className="flex flex-1 items-center gap-1.5 py-2 text-left"
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0 text-neutral-500 transition-transform duration-150',
              isExpanded && 'rotate-90',
            )}
          />
          <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-neutral-500" />
          <span className="flex-1 truncate text-xs font-medium text-neutral-300">
            {course.title}
          </span>
        </button>

        {/* アクションボタン（ホバーで表示）*/}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <NodeAction
            label="セクションを追加"
            onClick={() => setAddSectionOpen(true)}
            icon={<Plus className="h-3 w-3" />}
          />
          <NodeAction
            label="コースを編集"
            onClick={() => setEditOpen(true)}
            icon={<Pencil className="h-3 w-3" />}
          />
          <NodeAction
            label="コースを削除"
            onClick={() => setDeleteOpen(true)}
            icon={<Trash2 className="h-3 w-3" />}
            danger
          />
        </div>
      </div>

      {/* セクション一覧 */}
      {isExpanded && (
        <div className="ml-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SectionNode key={section.id} section={section} />
              ))}
            </SortableContext>
          </DndContext>
          {sections.length === 0 && (
            <p className="py-2 pl-3 text-[11px] text-neutral-700">
              セクションがありません
            </p>
          )}
        </div>
      )}

      {/* ダイアログ群 */}
      <CourseCrudDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        course={course}
      />
      <SectionCrudDialog
        isOpen={addSectionOpen}
        onClose={() => setAddSectionOpen(false)}
        courseId={course.id}
      />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteCourse(course.id)}
        title="コースを削除"
        description={`「${course.title}」を削除しますか？\n配下のセクション・レッスン・動画ソースがすべて削除されます。この操作は取り消せません。`}
      />
    </div>
  )
}

// ─── セクションノード ───────────────────────────────────────────

function SectionNode({ section }: { section: Section }) {
  const { expandedSectionIds, toggleSectionExpanded, deleteSection, reorderLessons } = useCourseStore()
  const lessons = useCourseStore((s) => selectLessonsBySection(s, section.id))

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const isExpanded = expandedSectionIds.includes(section.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const sensors = useSensors(
    useSensor(MouseSensor, MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
  )

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)
    void reorderLessons(arrayMove(lessons, oldIndex, newIndex).map((l) => l.id))
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* セクションヘッダー行 */}
      <div className="group flex items-center gap-1 rounded-md px-1 hover:bg-neutral-800">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab touch-none p-0.5 text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical className="h-3 w-3" />
        </button>

        <button
          onClick={() => toggleSectionExpanded(section.id)}
          className="flex flex-1 items-center gap-1.5 py-1.5 text-left"
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 flex-shrink-0 text-neutral-600 transition-transform duration-150',
              isExpanded && 'rotate-90',
            )}
          />
          <span className="flex-1 truncate text-[11px] font-medium text-neutral-400">
            {section.title}
          </span>
        </button>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <NodeAction
            label="レッスンを追加"
            onClick={() => setAddLessonOpen(true)}
            icon={<Plus className="h-3 w-3" />}
          />
          <NodeAction
            label="セクションを編集"
            onClick={() => setEditOpen(true)}
            icon={<Pencil className="h-3 w-3" />}
          />
          <NodeAction
            label="セクションを削除"
            onClick={() => setDeleteOpen(true)}
            icon={<Trash2 className="h-3 w-3" />}
            danger
          />
        </div>
      </div>

      {/* レッスン一覧 */}
      {isExpanded && (
        <div className="ml-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {lessons.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} />
              ))}
            </SortableContext>
          </DndContext>
          {lessons.length === 0 && (
            <p className="py-1.5 pl-3 text-[11px] text-neutral-700">
              レッスンがありません
            </p>
          )}
        </div>
      )}

      {/* ダイアログ群 */}
      <SectionCrudDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        section={section}
      />
      <LessonCrudDialog
        isOpen={addLessonOpen}
        onClose={() => setAddLessonOpen(false)}
        sectionId={section.id}
        courseId={section.courseId}
      />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteSection(section.id)}
        title="セクションを削除"
        description={`「${section.title}」を削除しますか？\n配下のレッスンと動画ソースもすべて削除されます。この操作は取り消せません。`}
      />
    </div>
  )
}

// ─── レッスンアイテム ────────────────────────────────────────────

function LessonItem({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate()
  const { closeSidebar } = useUIStore()
  const { deleteLesson } = useCourseStore()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const match = useMatch('/lesson/:lessonId')
  const isSelected = match?.params.lessonId === lesson.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const handleClick = () => {
    navigate(`/lesson/${lesson.id}`)
    closeSidebar()
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group flex items-center gap-1 rounded-md px-1 transition-colors',
          isSelected ? 'bg-accent-900/40' : 'hover:bg-neutral-800',
        )}
      >
        {/* ドラッグハンドル */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab touch-none p-0.5 text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* レッスン選択ボタン */}
        <button
          onClick={handleClick}
          className="flex flex-1 items-center gap-2 py-1.5 text-left"
          aria-current={isSelected ? 'page' : undefined}
        >
          {lesson.isCompleted ? (
            <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-accent-500" />
          ) : (
            <Circle className="h-3 w-3 flex-shrink-0 text-neutral-600" />
          )}
          <span
            className={cn(
              'flex-1 truncate text-[11px]',
              isSelected ? 'text-accent-300' : 'text-neutral-400',
            )}
          >
            {lesson.title}
          </span>
        </button>

        {/* アクションボタン */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <NodeAction
            label="レッスンを編集"
            onClick={() => setEditOpen(true)}
            icon={<Pencil className="h-3 w-3" />}
          />
          <NodeAction
            label="レッスンを削除"
            onClick={() => setDeleteOpen(true)}
            icon={<Trash2 className="h-3 w-3" />}
            danger
          />
        </div>
      </div>

      {/* ダイアログ群 */}
      <LessonCrudDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        lesson={lesson}
      />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteLesson(lesson.id)}
        title="レッスンを削除"
        description={`「${lesson.title}」を削除しますか？\n登録された動画ソースもすべて削除されます。この操作は取り消せません。`}
      />
    </>
  )
}

// ─── 共通: ノードアクションボタン ───────────────────────────────

interface NodeActionProps {
  label: string
  onClick: () => void
  icon: React.ReactNode
  danger?: boolean
}

function NodeAction({ label, onClick, icon, danger = false }: NodeActionProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation() // 親の展開トグルに伝播しない
        onClick()
      }}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded transition-colors',
        danger
          ? 'text-neutral-600 hover:bg-red-950/60 hover:text-red-400'
          : 'text-neutral-600 hover:bg-neutral-700 hover:text-neutral-300',
      )}
    >
      {icon}
    </button>
  )
}

// ─── エンプティステート ─────────────────────────────────────────

function CourseTreeEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <GraduationCap className="mb-3 h-10 w-10 text-neutral-700" />
      <p className="text-xs font-medium text-neutral-400">まだコースがありません</p>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
        コースを追加して
        <br />
        学習をはじめましょう
      </p>
      <button
        onClick={onAdd}
        className="mt-4 rounded-lg bg-accent-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600"
      >
        コースを追加
      </button>
    </div>
  )
}
