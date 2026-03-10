import { useCallback, useEffect, useRef } from 'react'
import { db } from '../../../storage/db'

/**
 * ソースごとの再生位置を Dexie に保存・復元するフック。
 *
 * PlaybackState の PK は lessonId のまま（スキーマ変更なし）。
 * sourcePositions マップにソース単位の位置を保持する。
 * activeSourceId で「最後に見ていたソース」を記録する。
 *
 * - throttledSave: 5 秒に 1 回だけ保存（timeupdate で呼ぶ）
 * - saveNow: 即時保存（pause / アンマウント時）
 * - restorePosition: 保存済み位置を返す（loadedmetadata 時に呼ぶ）
 */
export function usePlaybackState(lessonId: string, sourceId: string) {
  const lastSaveAt = useRef(0)
  const positionRef = useRef(0)
  const rateRef = useRef(1.0)

  const save = useCallback(
    async (positionSeconds: number, playbackRate: number) => {
      // 既存レコードを読んで sourcePositions をマージする
      const existing = await db.playbackStates.get(lessonId)
      await db.playbackStates.put({
        lessonId,
        positionSeconds, // 後方互換：アクティブソースの位置
        playbackRate,
        updatedAt: new Date().toISOString(),
        activeSourceId: sourceId,
        sourcePositions: {
          ...(existing?.sourcePositions ?? {}),
          [sourceId]: positionSeconds,
        },
      })
    },
    [lessonId, sourceId],
  )

  const throttledSave = useCallback(
    (positionSeconds: number, playbackRate: number) => {
      positionRef.current = positionSeconds
      rateRef.current = playbackRate
      const now = Date.now()
      if (now - lastSaveAt.current < 5000) return
      lastSaveAt.current = now
      void save(positionSeconds, playbackRate)
    },
    [save],
  )

  const saveNow = useCallback(
    (positionSeconds: number, playbackRate: number) => {
      positionRef.current = positionSeconds
      rateRef.current = playbackRate
      void save(positionSeconds, playbackRate)
    },
    [save],
  )

  const restorePosition = useCallback(async (): Promise<number | null> => {
    const state = await db.playbackStates.get(lessonId)
    if (!state) return null
    // ソース単位の位置を優先し、なければ後方互換で lessonId 単位の位置を使う
    const pos =
      state.sourcePositions?.[sourceId] ??
      (state.activeSourceId === sourceId ? state.positionSeconds : null)
    return pos != null && pos > 0 ? pos : null
  }, [lessonId, sourceId])

  // アンマウント時に最後の位置を保存
  useEffect(() => {
    return () => {
      void save(positionRef.current, rateRef.current)
    }
  }, [save])

  return { throttledSave, saveNow, restorePosition }
}
