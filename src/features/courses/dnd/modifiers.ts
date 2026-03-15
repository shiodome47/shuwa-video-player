import type { Modifier } from '@dnd-kit/core'

/**
 * CSS transform を持つ祖先要素（サイドバー等）が position:fixed の座標系をずらす問題を補正する。
 *
 * CSS 仕様上、transform を持つ要素は新しい包含ブロックを生成し、
 * 子孫の position:fixed がビューポートではなくその要素基準になる。
 * DragOverlay は内部的に position:fixed を使うため、表示位置がズレる。
 * このモディファイアは最も近い transform 祖先の位置を検出し、そのオフセットを打ち消す。
 */
export const compensateTransformAncestor: Modifier = ({ transform, activatorEvent }) => {
  if (!activatorEvent) return transform

  const target = activatorEvent.target as HTMLElement | null
  if (!target) return transform

  // transform を持つ最も近い祖先を探す
  let el: HTMLElement | null = target.parentElement
  while (el) {
    const computedTransform = getComputedStyle(el).transform
    if (computedTransform && computedTransform !== 'none') {
      const rect = el.getBoundingClientRect()
      return {
        ...transform,
        x: transform.x - rect.left,
        y: transform.y - rect.top,
      }
    }
    el = el.parentElement
  }

  return transform
}
