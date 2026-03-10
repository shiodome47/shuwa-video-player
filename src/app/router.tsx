import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { HomeView } from '../views/HomeView'
import { LearningView } from '../views/LearningView'
import { ResourceHubView } from '../views/ResourceHubView'
import { ReviewView } from '../views/ReviewView'
import { SettingsView } from '../views/SettingsView'

/**
 * アプリのルート定義。
 *
 * /               → ホームダッシュボード
 * /lesson/:lessonId → 学習ビュー（レッスン選択済み）
 * /resources       → リソースハブ
 * /review          → 振り返り（全ブックマーク・全メモ）
 * /settings        → 設定（データバックアップ）
 *
 * AppShell が全ルートの親（TopBar・Sidebar・Outlet を持つ）。
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: 'lesson/:lessonId',
        element: <LearningView />,
      },
      {
        path: 'resources',
        element: <ResourceHubView />,
      },
      {
        path: 'review',
        element: <ReviewView />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
    ],
  },
])
