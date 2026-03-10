import { db } from './db'

/**
 * File System Access API の FileSystemFileHandle を IndexedDB に保存・取得するユーティリティ。
 *
 * queryPermission / requestPermission は TypeScript 5.4 の DOM lib に含まれないため
 * ローカルインターフェースで型拡張する。
 */
interface FSAHandle extends FileSystemFileHandle {
  queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
}

/** FileSystemFileHandle を IndexedDB に保存する */
export async function saveFileHandle(key: string, handle: FileSystemFileHandle): Promise<void> {
  await db.fileHandles.put({ key, handle })
}

/** IndexedDB から FileSystemFileHandle を取得する。見つからなければ null */
export async function getFileHandle(key: string): Promise<FileSystemFileHandle | null> {
  const record = await db.fileHandles.get(key)
  return record?.handle ?? null
}

/**
 * 現在の読み取り権限状態を確認する。
 * ブラウザの権限モデルにより、queryPermission はユーザーインタラクション外でも呼べる。
 */
export async function queryReadPermission(
  handle: FileSystemFileHandle,
): Promise<PermissionState> {
  return await (handle as FSAHandle).queryPermission({ mode: 'read' })
}

/**
 * 読み取り権限をリクエストする。
 * ユーザーインタラクション（クリックハンドラ等）から呼ぶ必要がある。
 */
export async function requestReadPermission(
  handle: FileSystemFileHandle,
): Promise<PermissionState> {
  return await (handle as FSAHandle).requestPermission({ mode: 'read' })
}
