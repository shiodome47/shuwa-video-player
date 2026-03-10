import { DexieAdapter } from './DexieAdapter'
import { ShuwaDB } from './schema'

/**
 * ShuwaDB のシングルトンインスタンス。
 * アプリ全体でひとつの DB 接続を共有する。
 */
export const db = new ShuwaDB()

/**
 * StorageAdapter の具体実装（IndexedDB）。
 * 将来 Supabase に移行する場合は SupabaseAdapter に差し替える。
 * この変数を参照しているストアのコードは変更不要になる。
 */
export const storage = new DexieAdapter(db)
