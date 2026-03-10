import type { StorageAdapter } from './StorageAdapter'
import type { ShuwaDB } from './schema'

/**
 * StorageAdapter の IndexedDB 実装（Dexie.js を使用）。
 *
 * 設計方針:
 * - StorageAdapter インターフェースを満たす唯一の具体クラス（MVP 期間中）
 * - `db.table(name)` を使ってテーブルに動的アクセスする
 * - 型安全性は StorageAdapter の呼び出し側（ストア）で担保する
 * - 将来 SupabaseAdapter に差し替える場合、このファイルのみを変更する
 */
export class DexieAdapter implements StorageAdapter {
  constructor(private readonly db: ShuwaDB) {}

  async getAll<T>(tableName: string): Promise<T[]> {
    return (await this.db.table(tableName).toArray()) as T[]
  }

  async get<T>(tableName: string, id: string): Promise<T | undefined> {
    return (await this.db.table(tableName).get(id)) as T | undefined
  }

  async put<T extends { id: string }>(tableName: string, item: T): Promise<void> {
    await this.db.table(tableName).put(item)
  }

  async delete(tableName: string, id: string): Promise<void> {
    await this.db.table(tableName).delete(id)
  }

  async query<T>(tableName: string, index: string, value: unknown): Promise<T[]> {
    return (await this.db
      .table(tableName)
      .where(index)
      .equals(value as string | number)
      .toArray()) as T[]
  }

  /**
   * 複数テーブルへの操作を原子的に行うトランザクション。
   * カスケード削除など、整合性が重要な操作に使用する。
   *
   * すべてのテーブルを読み書き対象として渡すことで、
   * 呼び出し元がテーブル名を意識しなくてよい設計にしている。
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return await this.db.transaction('rw', this.db.tables, fn)
  }
}
