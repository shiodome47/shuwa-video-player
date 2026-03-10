/**
 * 動画プレイヤーの命令的操作インターフェース。
 * NativePlayer が実装し、SeekBar / PlayerControls に渡す。
 * Phase 4B: A-B リピート操作を追加する。
 */
export interface VideoControls {
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  /** 指定秒数にシークする（0 〜 duration の範囲に clamp） */
  seekTo: (seconds: number) => void
  /** 現在位置から指定秒数スキップする（負で戻し） */
  skip: (seconds: number) => void
}
