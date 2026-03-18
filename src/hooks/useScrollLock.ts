import { useEffect } from 'react'

/**
 * body のスクロールを無効化する。
 * theater モード中に背景コンテンツがスクロールしないよう制御する。
 */
export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    const html = document.documentElement
    const body = document.body

    // 現在のスクロール位置を保存
    const scrollY = window.scrollY

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    // 位置を固定して背景スクロールを防ぐ
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'

    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
      body.style.overscrollBehavior = ''
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      // スクロール位置を復元
      window.scrollTo(0, scrollY)
    }
  }, [enabled])
}
