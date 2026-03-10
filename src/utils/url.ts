/**
 * URL が安全に開けるものかを検証する。
 * javascript: スキームなどの危険な URL をブロックする。
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * YouTube URL かどうかを判定する。
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * YouTube URL から動画 ID を抽出する。
 * 対応形式:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      // /embed/VIDEO_ID
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1] || null
      }
      // ?v=VIDEO_ID
      return parsed.searchParams.get('v')
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null
    }
    return null
  } catch {
    return null
  }
}

/**
 * YouTube 動画 ID から埋め込み URL を生成する。
 */
export function buildYouTubeEmbedUrl(videoId: string): string {
  // enablejsapi=1: postMessage で再生状態（終了など）を受け取るために必要
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`
}

/**
 * URL からドメイン名を取得する（ResourceCard の表示用）。
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
