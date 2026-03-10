import { CourseTree } from '../../features/courses/components/CourseTree'

/**
 * サイドバーのコンテンツ部分。
 * 位置・アニメーション制御は AppShell が担当する。
 * このコンポーネントはコンテンツの責務のみを持つ。
 */
export function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      {/* サイドバーヘッダー */}
      <div className="flex h-10 flex-shrink-0 items-center border-b border-neutral-800/60 px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          コース
        </span>
      </div>

      {/* コースツリー（スクロール可能） */}
      <div className="flex-1 overflow-y-auto py-2">
        <CourseTree />
      </div>
    </div>
  )
}
