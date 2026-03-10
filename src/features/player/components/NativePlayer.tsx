import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VideoSource } from '../../../types'
import { usePlaybackState } from '../hooks/usePlaybackState'
import { useABRepeat } from '../hooks/useABRepeat'
import { usePlayerShortcuts } from '../hooks/usePlayerShortcuts'
import { useProgressTracking } from '../hooks/useProgressTracking'
import { registerPlayerSeek, unregisterPlayerSeek, usePlayerStore } from '../store'
import type { VideoControls } from '../types'
import { ABRepeatControls } from './ABRepeatControls'
import { PlayerControls } from './PlayerControls'
import { SeekBar } from './SeekBar'

interface NativePlayerProps {
  lessonId: string
  source: VideoSource
  onEnded?: () => void
}

/**
 * HTML5 <video> ベースのプレイヤー。
 * remote および local（LocalPlayer 経由で blob URL を受け取る）に使用する。
 *
 * Phase 4B 追加:
 * - A-B リピート（useABRepeat）
 * - キーボードショートカット（usePlayerShortcuts）
 */
export function NativePlayer({ lessonId, source, onEnded }: NativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  const {
    isPlaying,
    currentTime,
    duration,
    isBuffering,
    volume,
    isMuted,
    playbackRate,
    abA,
    abB,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    setVolume,
    setIsMuted,
    setPlaybackRate,
    setAbA,
    setAbB,
    clearAB,
    resetEphemeral,
  } = usePlayerStore()

  const { throttledSave, saveNow, restorePosition } = usePlaybackState(lessonId, source.id)
  const { trackTime, flushProgress } = useProgressTracking(lessonId)

  // ── コントロールオブジェクト（videoRef は安定しているため deps 空） ──
  const controls: VideoControls = useMemo(
    () => ({
      play: () => {
        void videoRef.current?.play()
      },
      pause: () => {
        videoRef.current?.pause()
      },
      togglePlayPause: () => {
        const v = videoRef.current
        if (!v) return
        if (v.paused) void v.play()
        else v.pause()
      },
      seekTo: (s) => {
        const v = videoRef.current
        if (!v) return
        const dur = isFinite(v.duration) ? v.duration : 0
        v.currentTime = Math.max(0, Math.min(s, dur))
      },
      skip: (s) => {
        const v = videoRef.current
        if (!v) return
        const dur = isFinite(v.duration) ? v.duration : 0
        v.currentTime = Math.max(0, Math.min(v.currentTime + s, dur))
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // ── seekTo をグローバルに登録 ────────────────────────────────
  useEffect(() => {
    registerPlayerSeek(controls.seekTo)
    return () => unregisterPlayerSeek()
  }, [controls.seekTo])

  // ── A-B リピート ─────────────────────────────────────────────
  useABRepeat(videoRef)

  // ── キーボードショートカット ──────────────────────────────────
  usePlayerShortcuts(videoRef, controls)

  // ── マウント時に設定値を video 要素に適用 ──────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const prefs = usePlayerStore.getState()
    v.volume = prefs.volume
    v.muted = prefs.isMuted
    v.playbackRate = prefs.playbackRate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── エフェメラルリセット（ソース切り替え時） ──────────────────
  useEffect(() => {
    resetEphemeral()
    setVideoError(null)
  }, [resetEphemeral, source.id])

  // ── video イベントリスナー ────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => setIsPlaying(true)

    const onPause = () => {
      setIsPlaying(false)
      saveNow(v.currentTime, v.playbackRate)
      flushProgress()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      saveNow(v.currentTime, v.playbackRate)
      flushProgress()
      onEnded?.()
    }

    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime)
      throttledSave(v.currentTime, v.playbackRate)
      trackTime(!v.paused)
    }

    const onDurationChange = () => {
      setDuration(isFinite(v.duration) ? v.duration : 0)
    }

    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => { setIsBuffering(false); setVideoError(null) }
    const onError = () => {
      setIsBuffering(false)
      const code = v.error?.code
      if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        setVideoError('この形式はブラウザで再生できません。mp4 または webm をお試しください。')
      } else if (code === MediaError.MEDIA_ERR_DECODE) {
        setVideoError('ファイルの読み込みに失敗しました。ファイルが壊れているか、非対応の形式です。')
      } else if (code != null) {
        setVideoError('動画の再生中にエラーが発生しました。')
      }
    }

    const onLoadedMetadata = async () => {
      setDuration(isFinite(v.duration) ? v.duration : 0)
      // 振り返り画面からのシーク要求を優先する
      const { pendingSeekTarget, clearPendingSeekTarget } = usePlayerStore.getState()
      if (pendingSeekTarget !== null) {
        v.currentTime = Math.max(0, Math.min(pendingSeekTarget, v.duration))
        clearPendingSeekTarget()
        return
      }
      const pos = await restorePosition()
      if (pos !== null) {
        v.currentTime = pos
      }
    }

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', handleEnded)
    v.addEventListener('timeupdate', onTimeUpdate)
    v.addEventListener('durationchange', onDurationChange)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('canplay', onCanPlay)
    v.addEventListener('error', onError)
    v.addEventListener('loadedmetadata', onLoadedMetadata)

    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', handleEnded)
      v.removeEventListener('timeupdate', onTimeUpdate)
      v.removeEventListener('durationchange', onDurationChange)
      v.removeEventListener('waiting', onWaiting)
      v.removeEventListener('canplay', onCanPlay)
      v.removeEventListener('error', onError)
      v.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    throttledSave,
    saveNow,
    restorePosition,
    trackTime,
    flushProgress,
    onEnded,
  ])

  // ── 音量・ミュート・速度ハンドラ ──────────────────────────────
  const handleVolumeChange = useCallback(
    (val: number) => {
      setVolume(val)
      if (videoRef.current) {
        videoRef.current.volume = val
        if (val > 0) {
          setIsMuted(false)
          videoRef.current.muted = false
        }
      }
    },
    [setVolume, setIsMuted],
  )

  const handleMuteToggle = useCallback(() => {
    const newMuted = !usePlayerStore.getState().isMuted
    setIsMuted(newMuted)
    if (videoRef.current) videoRef.current.muted = newMuted
  }, [setIsMuted])

  const handleSpeedChange = useCallback(
    (rate: number) => {
      setPlaybackRate(rate)
      if (videoRef.current) videoRef.current.playbackRate = rate
    },
    [setPlaybackRate],
  )

  // ── A-B ハンドラ ─────────────────────────────────────────────
  const handleSetA = useCallback(() => {
    setAbA(videoRef.current?.currentTime ?? 0)
  }, [setAbA])

  const handleSetB = useCallback(() => {
    const { abA: currentAbA } = usePlayerStore.getState()
    const t = videoRef.current?.currentTime ?? 0
    if (currentAbA !== null && t > currentAbA) {
      setAbB(t)
    }
  }, [setAbB])

  return (
    <div className="flex flex-col bg-black">
      {/* 動画 */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={source.src}
          className="h-full w-full"
          preload="metadata"
          playsInline
        />
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
            <p className="text-sm text-red-400">{videoError}</p>
          </div>
        )}
      </div>

      {/* コントロール */}
      <div className="bg-neutral-950">
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          controls={controls}
          isBuffering={isBuffering}
          abA={abA}
          abB={abB}
        />
        <ABRepeatControls
          abA={abA}
          abB={abB}
          onSetA={handleSetA}
          onSetB={handleSetB}
          onClear={clearAB}
        />
        <PlayerControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isBuffering={isBuffering}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          controls={controls}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onSpeedChange={handleSpeedChange}
        />
      </div>
    </div>
  )
}
