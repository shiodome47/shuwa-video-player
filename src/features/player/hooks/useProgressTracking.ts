import { useCallback, useEffect, useRef } from 'react'
import { useCourseStore } from '../../courses/store'
import { useLearningStore } from '../../learning/store'

/**
 * 動画視聴時間を追跡して Progress テーブルに保存するフック。
 *
 * - trackTime(isPlaying): timeupdate から呼ぶ。再生中のみ経過秒を積算する。
 *   ブラウザのバックグラウンドスロットリング対策として 1 秒/tick に上限を設ける。
 * - flushProgress(): pause イベントやアンマウント時に即時保存する。
 * - 5 秒ごとに自動保存（trackTime 内で判定）。
 */
export function useProgressTracking(lessonId: string) {
  const lastTickRef = useRef(0)      // 前回の timeupdate タイムスタンプ (ms)
  const pendingRef = useRef(0)       // 未保存の積算秒数

  const save = useCallback(async () => {
    if (pendingRef.current <= 0) return
    const toSave = pendingRef.current
    pendingRef.current = 0
    lastTickRef.current = 0

    const lesson = useCourseStore.getState().lessons.find((l) => l.id === lessonId)
    if (!lesson) return
    await useLearningStore.getState().addWatchTime(lessonId, lesson.courseId, toSave)
  }, [lessonId])

  const trackTime = useCallback(
    (isPlaying: boolean) => {
      const now = Date.now()
      if (isPlaying && lastTickRef.current > 0) {
        const elapsed = Math.min((now - lastTickRef.current) / 1000, 1.0)
        pendingRef.current += elapsed
      }
      lastTickRef.current = now

      // 5 秒以上積算されたら保存
      if (pendingRef.current >= 5) {
        void save()
      }
    },
    [save],
  )

  const flushProgress = useCallback(() => {
    void save()
  }, [save])

  // アンマウント時に残った時間を保存
  useEffect(() => {
    return () => {
      void save()
    }
  }, [save])

  return { trackTime, flushProgress }
}
