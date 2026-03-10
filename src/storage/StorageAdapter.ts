/**
 * データ永続化レイヤーの抽象インターフェース。
 *
 * MVP: DexieAdapter（IndexedDB）で実装。
 * 将来: SupabaseAdapter に差し替えることで、ビジネスロジックを変更せずにクラウド移行できる。
 *
 * Phase 2 で DexieAdapter を実装する。
 */
export interface StorageAdapter {
  /** テーブルの全件取得 */
  getAll<T>(table: string): Promise<T[]>

  /** ID による単件取得 */
  get<T>(table: string, id: string): Promise<T | undefined>

  /** 追加 or 更新（upsert） */
  put<T extends { id: string }>(table: string, item: T): Promise<void>

  /** ID による削除 */
  delete(table: string, id: string): Promise<void>

  /**
   * インデックスによるクエリ。
   * @param table テーブル名
   * @param index インデックス名（例: 'courseId'）
   * @param value インデックス値
   */
  query<T>(table: string, index: string, value: unknown): Promise<T[]>

  /**
   * 複数テーブルの操作を原子的に行うトランザクション。
   * cascade 削除などに使用する。
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>
}
