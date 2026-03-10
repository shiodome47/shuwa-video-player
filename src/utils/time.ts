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
