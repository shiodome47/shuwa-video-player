import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * プレイヤーストア。
 *
 * 状態を3種類に分ける:
 * - エフェメラル（ソース切り替え時にリセット）: 再生状態・時刻・バッファリング・A-B
 * - 設定（localStorage に永続化）: 音量・ミュート・再生速度
 *
 * seekTo のみ Zustand の外でモジュール変数として保持する。
 * これは関数を Zustand に持たせると persist でのシリアライズ問題が起きるため。
 */

/** NativePlayer がマウント時に登録する seekTo 関数。モジュール変数で保持 */
let _seekFn: ((t: number) => void) | undefined = undefined

/** ブックマーク等から現在の NativePlayer を seek する */
export function seekPlayer(t: number) {
  _seekFn?.(t)
}

/** NativePlayer がマウント時に呼ぶ */
export function registerPlayerSeek(fn: (t: number) => void) {
  _seekFn = fn
}

/** NativePlayer がアンマウント時に呼ぶ */
export function unregisterPlayerSeek() {
  _seekFn = undefined
}

interface PlayerStore {
  // ─── エフェメラル ─────────────────────────────────────────────
  isPlaying: boolean
  currentTime: number
  duration: number
  isBuffering: boolean
  // ─── A-B リピート（エフェメラル）────────────────────────────────
  abA: number | null
  abB: number | null
  // ─── クロスページシーク（ReviewView → LearningView）────────────
  /** 振り返り画面からのシーク要求。NativePlayer の loadedmetadata で消費される */
  pendingSeekTarget: number | null
  // ─── 永続化設定 ───────────────────────────────────────────────
  volume: number
  isMuted: boolean
  playbackRate: number
  // ─── アクション ───────────────────────────────────────────────
  setIsPlaying: (v: boolean) => void
  setCurrentTime: (v: number) => void
  setDuration: (v: number) => void
  setIsBuffering: (v: boolean) => void
  /**
   * A 地点を設定する。
   * B が既に設定されていて新しい A 以下の位置にある場合、B を自動クリアする。
   */
  setAbA: (t: number) => void
  /** B 地点を設定する。呼び出し元で B > A を保証すること。 */
  setAbB: (t: number) => void
  clearAB: () => void
  setPendingSeekTarget: (t: number) => void
  clearPendingSeekTarget: () => void
  setVolume: (v: number) => void
  setIsMuted: (v: boolean) => void
  setPlaybackRate: (v: number) => void
  /** 動画ソース切り替え時にエフェメラル（A-B 含む）をリセット */
  resetEphemeral: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      abA: null,
      abB: null,
      pendingSeekTarget: null,
      volume: 0.8,
      isMuted: false,
      playbackRate: 1.0,
      setIsPlaying: (v) => set({ isPlaying: v }),
      setCurrentTime: (v) => set({ currentTime: v }),
      setDuration: (v) => set({ duration: v }),
      setIsBuffering: (v) => set({ isBuffering: v }),
      setAbA: (t) =>
        set((state) => ({
          abA: t,
          abB: state.abB !== null && state.abB <= t ? null : state.abB,
        })),
      setAbB: (t) => set({ abB: t }),
      clearAB: () => set({ abA: null, abB: null }),
      setPendingSeekTarget: (t) => set({ pendingSeekTarget: t }),
      clearPendingSeekTarget: () => set({ pendingSeekTarget: null }),
      setVolume: (v) => set({ volume: v }),
      setIsMuted: (v) => set({ isMuted: v }),
      setPlaybackRate: (v) => set({ playbackRate: v }),
      resetEphemeral: () =>
        set({
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isBuffering: false,
          abA: null,
          abB: null,
        }),
    }),
    {
      name: 'shuwa-player-prefs',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        playbackRate: state.playbackRate,
      }),
    },
  ),
)
