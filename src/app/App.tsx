import { RouterProvider } from 'react-router-dom'
import { useAppInit } from './useAppInit'
import { router } from './router'

/**
 * アプリのルートコンポーネント。
 * IndexedDB の初期ロードが完了してからルーターを表示する。
 */
export function App() {
  const { isReady, error } = useAppInit()

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <p className="text-sm font-medium text-red-400">起動に失敗しました</p>
          <p className="mt-1 text-xs text-neutral-500">{error.message}</p>
          <p className="mt-3 text-xs text-neutral-600">
            ブラウザの DevTools → Application → IndexedDB → ShuwaDB を削除してリロードすると
            解決することがあります
          </p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-accent-500" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}
