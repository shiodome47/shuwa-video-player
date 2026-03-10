import type { VideoSource, VideoSourceType } from '../types'

/**
 * VideoSourceAdapter が解決した「再生可能な状態」。
 *
 * type:
 *   'blob-url'    — LocalVideoAdapter: File API で生成した ObjectURL
 *   'direct-url'  — RemoteVideoAdapter: そのまま <video src> に渡せる URL
 *   'youtube-embed' — YouTubeAdapter: <iframe src> に使う embed URL
 */
export interface ResolvedVideoSource {
  type: 'blob-url' | 'direct-url' | 'youtube-embed'
  url: string
  /**
   * クリーンアップ関数（blob URL の revoke など）。
   * コンポーネントの unmount 時に呼び出す。
   */
  cleanup?: () => void
}

/**
 * 動画ソース参照レイヤーの抽象インターフェース。
 *
 * 各実装:
 *   LocalVideoAdapter  — File System Access API（Chrome/Edge）
 *   RemoteVideoAdapter — 外部 URL（mp4 等）
 *   YouTubeAdapter     — YouTube 埋め込み
 *
 * 将来の拡張:
 *   DropboxAdapter / GDriveAdapter / S3Adapter は
 *   このインターフェースを実装するだけで対応できる。
 *
 * Phase 2 で各 Adapter を実装する。
 */
export interface VideoSourceAdapter {
  readonly type: VideoSourceType

  /** このアダプターが指定した VideoSource を処理できるか判定する */
  canHandle(source: VideoSource): boolean

  /** VideoSource を再生可能な状態に解決する */
  resolve(source: VideoSource): Promise<ResolvedVideoSource>
}

/**
 * 登録された Adapter を VideoSource.type で選択するリゾルバ。
 * Phase 2 で実装する。
 */
export class VideoSourceResolver {
  private adapters = new Map<VideoSourceType, VideoSourceAdapter>()

  register(adapter: VideoSourceAdapter): void {
    this.adapters.set(adapter.type, adapter)
  }

  async resolve(source: VideoSource): Promise<ResolvedVideoSource> {
    const adapter = this.adapters.get(source.type)
    if (!adapter) {
      throw new Error(`Unsupported video source type: ${source.type}`)
    }
    return adapter.resolve(source)
  }
}
