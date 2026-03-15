import type { Modifier } from '@dnd-kit/core'

/**
 * サイドバー (<aside>) の CSS transform が DragOverlay の座標系をずらす問題を補正する。
 *
 * モバイルのスライドアニメーション用に <aside> に translate-x が適用されているとき、
 * CSS 仕様上 transform を持つ要素は新しい包含ブロックを生成し、
 * 子孫の position:fixed がビューポートではなくその要素基準になる。
 * DragOverlay は内部的に position:fixed を使うため、表示位置がズレる。
 *
 * このモディファイアは <aside> 要素のみを検査し、transform がある場合にそのオフセットを打ち消す。
 * useSortable が各アイテムに付与する inline transform は対象外。
 */
export const compensateSidebarTransform: Modifier = ({ transform, activatorEvent }) => {
  if (!activatorEvent) return transform

  const target = activatorEvent.target as HTMLElement | null
  if (!target) return transform

  const aside = target.closest('aside')
  if (!aside) return transform

  const computedTransform = getComputedStyle(aside).transform
  if (!computedTransform || computedTransform === 'none') return transform

  const rect = aside.getBoundingClientRect()
  return {
    ...transform,
    x: transform.x - rect.left,
    y: transform.y - rect.top,
  }
}
