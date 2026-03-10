import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

// 開発環境でのみシードユーティリティを window に公開する
// ブラウザコンソールから await seed() / await clearData() を呼び出せる
if (import.meta.env.DEV) {
  import('./storage/seed')
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
