/**
 * className を条件付きで結合するユーティリティ。
 * Phase 5 の UI 洗練時に tailwind-merge を追加する場合はここを差し替える。
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
