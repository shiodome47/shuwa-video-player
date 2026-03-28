import { BookOpen, FolderTree, Play, Bookmark, FileText, Download, Monitor } from 'lucide-react'

/**
 * アプリの取扱説明書ビュー。
 * 主要機能の使い方をセクション別に表示する。
 */
export function ManualView() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-lg font-bold text-neutral-200">取扱説明書</h1>

      <div className="space-y-8">
        {/* コース管理 */}
        <Section icon={<FolderTree className="h-4 w-4" />} title="コース・セクション・レッスンの管理">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>サイドバーの「<strong>コースを追加</strong>」からコースを作成できます</li>
            <li>コースの中に<strong>セクション</strong>、セクションの中に<strong>レッスン</strong>を階層的に追加できます</li>
            <li>各項目にカーソルを合わせると、編集・削除ボタンが表示されます</li>
            <li>ドラッグ&ドロップで並び替えができます（左端のグリップアイコン）</li>
            <li>セクションは別のコースへ、レッスンは別のセクションへ移動可能です</li>
          </ul>
        </Section>

        {/* 動画再生 */}
        <Section icon={<Play className="h-4 w-4" />} title="動画の再生">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>レッスンを選択すると学習画面が開きます</li>
            <li>レッスン画面の「<strong>動画ソースを追加</strong>」から動画ファイルを登録できます</li>
            <li>ローカルファイル（PC上の動画）を選択して再生します</li>
            <li><strong>再生速度</strong>の変更が可能です（0.25x〜2x）</li>
            <li><strong>A-Bリピート</strong>: A地点とB地点を設定すると、その区間を繰り返し再生します</li>
            <li>再生位置は自動で記憶され、次回開いたときに復元されます</li>
          </ul>
        </Section>

        {/* シアターモード */}
        <Section icon={<Monitor className="h-4 w-4" />} title="シアターモード">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>動画プレイヤー右上の拡大アイコンでシアターモードに切り替わります</li>
            <li>動画が画面いっぱいに広がり、集中して視聴できます</li>
            <li>もう一度押すと元のレイアウトに戻ります</li>
          </ul>
        </Section>

        {/* ブックマーク */}
        <Section icon={<Bookmark className="h-4 w-4" />} title="ブックマーク">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>動画の再生中に「<strong>現在位置に追加</strong>」でブックマークを作成できます</li>
            <li>ブックマークにはラベル（任意）を付けられます</li>
            <li>タイムスタンプをクリックすると、その位置にジャンプします</li>
            <li>タイムスタンプを<strong>ダブルクリック</strong>すると、時刻を手入力で修正できます（例: <code>1:30</code>）</li>
            <li>鉛筆アイコンでラベルの編集、ゴミ箱アイコンで削除ができます</li>
          </ul>
        </Section>

        {/* メモ */}
        <Section icon={<FileText className="h-4 w-4" />} title="メモ">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>「<strong>時刻付き</strong>」: 現在の再生位置に紐づくメモを作成します</li>
            <li>「<strong>一般</strong>」: タイムスタンプなしのメモを作成します</li>
            <li>タイムスタンプ付きメモは、クリックでその位置にジャンプできます</li>
            <li>タイムスタンプを<strong>ダブルクリック</strong>すると、時刻を手入力で修正できます</li>
            <li>鉛筆アイコンで内容の編集ができます</li>
          </ul>
        </Section>

        {/* バックアップ */}
        <Section icon={<Download className="h-4 w-4" />} title="データのバックアップ">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>設定画面からデータの<strong>エクスポート</strong>（JSON形式でダウンロード）ができます</li>
            <li>エクスポートしたファイルから<strong>インポート</strong>してデータを復元できます</li>
            <li>データはブラウザの IndexedDB に保存されています</li>
            <li>ブラウザのデータを消去するとデータが失われるため、定期的なバックアップを推奨します</li>
          </ul>
        </Section>

        {/* 振り返り */}
        <Section icon={<BookOpen className="h-4 w-4" />} title="振り返り">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>上部メニューの「<strong>振り返り</strong>」から、全コースのブックマーク・メモを一覧で確認できます</li>
            <li>コースやレッスンでフィルタリングが可能です</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
        <span className="text-accent-400">{icon}</span>
        {title}
      </h2>
      <div className="text-xs leading-relaxed text-neutral-400">{children}</div>
    </section>
  )
}
