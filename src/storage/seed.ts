/**
 * 開発用シードデータ。
 *
 * ブラウザコンソールから以下のコマンドで操作できる（開発環境のみ）:
 *   await seed()       — サンプルデータを投入する
 *   await clearData()  — すべてのデータを削除する
 *
 * 永続化の疎通確認に使用する。本番環境では何も実行しない。
 *
 * ─ 投入されるデータの構成 ─────────────────────────────────────
 * Course: 手話技能検定 5級
 *   Section: 第1章 挨拶
 *     Lesson: おはようございます  → VideoSource: youtube
 *     Lesson: こんにちは          → VideoSource: remote
 *     Lesson: ありがとう          → VideoSource: local（ファイル名のみ）
 *   Section: 第2章 家族
 *     Lesson: お父さん            → VideoSource なし（未登録の状態）
 *
 * ResourceCategory: 単語検索 / YouTube
 *   ResourceLink: 手話単語検索アプリ（単語検索）
 *   ResourceLink: NHK 手話ニュース（YouTube）
 */

import { useCourseStore } from '../features/courses/store'
import { useResourceStore } from '../features/resources/store'
import { db } from './db'

export async function seedDevelopmentData(): Promise<void> {
  console.group('[seed] シードデータを投入します...')

  // 既存データを全クリア（冪等性のため）
  await clearAllData()

  const { addCourse, addSection, addLesson, addVideoSource } = useCourseStore.getState()
  const { addCategory, addLink } = useResourceStore.getState()

  // ─── コース ────────────────────────────────────────────────
  const course = await addCourse({
    title: '手話技能検定 5級',
    description: '手話技能検定 5級のテキストに沿って学習するコース',
  })
  console.log('✓ Course:', course.title)

  // ─── セクション ────────────────────────────────────────────
  const section1 = await addSection({ courseId: course.id, title: '第1章 挨拶' })
  const section2 = await addSection({ courseId: course.id, title: '第2章 家族' })
  console.log('✓ Sections:', section1.title, '/', section2.title)

  // ─── レッスン + 動画ソース ────────────────────────────────

  // Lesson 1: YouTube ソース
  const lesson1 = await addLesson({
    sectionId: section1.id,
    courseId: course.id,
    title: 'おはようございます',
    description: '朝の挨拶の手話。毎日使う基本表現です。',
    tags: ['挨拶', '基本'],
  })
  await addVideoSource({
    lessonId: lesson1.id,
    type: 'youtube',
    src: 'https://www.youtube.com/watch?v=example-yt-id',
    displayName: 'YouTube 動画 - おはようございます',
  })

  // Lesson 2: Remote ソース（外部 URL）
  const lesson2 = await addLesson({
    sectionId: section1.id,
    courseId: course.id,
    title: 'こんにちは',
    description: '日中の挨拶の手話です。',
    tags: ['挨拶'],
  })
  await addVideoSource({
    lessonId: lesson2.id,
    type: 'remote',
    src: 'https://example.com/videos/konnichiwa.mp4',
    displayName: 'リモート動画 - こんにちは',
  })

  // Lesson 3: Local ソース（ファイル名のみ記録。File System Access API は Phase 4）
  const lesson3 = await addLesson({
    sectionId: section1.id,
    courseId: course.id,
    title: 'ありがとう',
    description: '感謝の手話表現です。',
    tags: ['挨拶', '日常'],
  })
  await addVideoSource({
    lessonId: lesson3.id,
    type: 'local',
    src: 'arigatou.mp4', // ファイル名のみ（実体は Phase 4 で FileHandle と紐付ける）
    displayName: 'ローカル動画 - ありがとう',
  })

  // Lesson 4: 動画ソース未登録（UI での「動画を追加する」エンプティステートを確認）
  await addLesson({
    sectionId: section2.id,
    courseId: course.id,
    title: 'お父さん',
    description: '家族の手話 - お父さん',
    tags: ['家族'],
  })

  console.log('✓ Lessons + VideoSources: 4件')

  // ─── リソースカテゴリ + リンク ────────────────────────────

  const catSearch = await addCategory({
    name: '単語検索',
    description: '手話単語を調べるときに使うサイト・アプリ',
    color: 'teal',
  })
  const catYoutube = await addCategory({
    name: 'YouTube',
    description: '学習に使う YouTube チャンネル・動画',
    color: 'red',
  })
  console.log('✓ Categories:', catSearch.name, '/', catYoutube.name)

  await addLink({
    categoryId: catSearch.id,
    title: '手話単語検索アプリ',
    url: 'https://sign-language-app.pages.dev/',
    description: '手話単語を調べるために頻繁に使うアプリ',
    tags: ['単語', '検索'],
  })

  await addLink({
    categoryId: catYoutube.id,
    title: 'NHK 手話ニュース',
    url: 'https://www.youtube.com/@nhk_shuwa',
    description: 'NHK の手話ニュース公式チャンネル。日常的に見るのに便利。',
    tags: ['ニュース', 'NHK'],
  })

  console.log('✓ ResourceLinks: 2件')
  console.groupEnd()
  console.info(
    '[seed] 完了。ページをリロードするとデータが IndexedDB から復元されることを確認できます。',
  )
}

export async function clearAllData(): Promise<void> {
  console.log('[seed] データをクリアします...')
  await Promise.all([
    db.courses.clear(),
    db.sections.clear(),
    db.lessons.clear(),
    db.videoSources.clear(),
    db.resourceCategories.clear(),
    db.resourceLinks.clear(),
    db.playbackStates.clear(),
    db.progresses.clear(),
    db.bookmarks.clear(),
    db.notes.clear(),
  ])
  // ストアを空にリセット
  useCourseStore.setState({ courses: [], sections: [], lessons: [], videoSources: [] })
  useResourceStore.setState({ categories: [], links: [] })
  console.log('[seed] クリア完了')
}

// ─── 開発環境でのみ window に公開 ──────────────────────────────

if (import.meta.env.DEV) {
  const w = window as Window &
    typeof globalThis & {
      seed: typeof seedDevelopmentData
      clearData: typeof clearAllData
    }
  w.seed = seedDevelopmentData
  w.clearData = clearAllData

  console.info(
    '[dev] 永続化テスト用コマンド:\n' +
      '  await seed()       — サンプルデータを投入\n' +
      '  await clearData()  — 全データを削除',
  )
}
