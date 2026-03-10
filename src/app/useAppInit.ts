import { useEffect, useState } from 'react'
import { useCourseStore } from '../features/courses/store'
import { useResourceStore } from '../features/resources/store'

interface AppInitState {
  isReady: boolean
  error: Error | null
}

/**
 * アプリ起動時の初期化処理。
 * IndexedDB から全データをロードして各ストアに反映する。
 *
 * 呼び出しは App コンポーネントの最上位で一度だけ行う。
 * Phase 2 以降でストアが増えた場合はここに追加する。
 */
export function useAppInit(): AppInitState {
  const [state, setState] = useState<AppInitState>({ isReady: false, error: null })

  useEffect(() => {
    const init = async () => {
      // 各ストアの loadAll を並列実行（どちらも独立した操作）
      await Promise.all([
        useCourseStore.getState().loadAll(),
        useResourceStore.getState().loadAll(),
      ])
    }

    init()
      .then(() => setState({ isReady: true, error: null }))
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('[ShuwaDB] 起動時の読み込みに失敗しました:', error)
        setState({ isReady: false, error })
      })
  }, [])

  return state
}
