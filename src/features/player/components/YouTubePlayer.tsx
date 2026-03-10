import { useEffect, useRef } from 'react'
import type { VideoSource } from '../../../types'
import { buildYouTubeEmbedUrl, extractYouTubeId } from '../../../utils/url'

interface YouTubePlayerProps {
  source: VideoSource
  onEnded?: () => void
}

/**
 * YouTube 埋め込みプレイヤー。
 *
 * enablejsapi=1 + postMessage で動画終了を検知する。
 * YouTube IFrame API は外部スクリプト不要。
 * 再生状態コード: 0 = 終了, 1 = 再生中, 2 = 一時停止
 */
export function YouTubePlayer({ source, onEnded }: YouTubePlayerProps) {
  const videoId = extractYouTubeId(source.src)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      try {
        const data: unknown = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (
          typeof data === 'object' &&
          data !== null &&
          'event' in data &&
          (data as { event: unknown }).event === 'onStateChange' &&
          'info' in data &&
          (data as { info: unknown }).info === 0
        ) {
          onEnded?.()
        }
      } catch {
        // JSON.parse 失敗は無視
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onEnded])

  if (!videoId) {
    return (
      <div className="flex w-full items-center justify-center bg-black text-sm text-neutral-500" style={{ aspectRatio: '16/9' }}>
        無効な YouTube URL です
      </div>
    )
  }

  const embedUrl = buildYouTubeEmbedUrl(videoId)

  return (
    <div className="flex flex-col bg-black">
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="h-full w-full"
          title={source.displayName ?? 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
