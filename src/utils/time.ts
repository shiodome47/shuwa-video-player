/**
 * 秒数を MM:SS 形式にフォーマットする。
 * 1時間以上の場合は H:MM:SS 形式にする。
 */
export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/**
 * 秒数を m:ss 形式にフォーマットする（分は 0 詰めなし）。
 * プレイヤー UI やブックマーク表示で使用する。
 */
export function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * "m:ss" または "h:mm:ss" 形式の文字列を秒数に変換する。
 * 不正な入力の場合は null を返す。
 */
export function parseTime(str: string): number | null {
  const trimmed = str.trim()
  if (!trimmed) return null

  const parts = trimmed.split(':')
  if (parts.length < 2 || parts.length > 3) return null

  const nums = parts.map(Number)
  if (nums.some((n) => !isFinite(n) || n < 0 || n !== Math.floor(n))) return null

  if (parts.length === 3) {
    const [h, m, s] = nums
    if (m > 59 || s > 59) return null
    return h * 3600 + m * 60 + s
  }

  const [m, s] = nums
  if (s > 59) return null
  return m * 60 + s
}
