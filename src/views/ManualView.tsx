import {
  AlertTriangle,
  Bookmark,
  ChevronRight,
  Chrome,
  Download,
  GripVertical,
  HelpCircle,
  MessageCircleQuestion,
  Play,
} from 'lucide-react'

/**
 * アプリの取扱説明書ビュー。
 *
 * 構成方針:
 * - 初期表示は短く（はじめに + FAQ 見出し + 機能ガイド見出しのみ）
 * - 詳細は <details> で折りたたみ、タップで展開
 * - FAQ 形式で「疑問 → 回答」の流れで読める
 */
export function ManualView() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-lg font-bold text-neutral-800 dark:text-neutral-200">
        取扱説明書
      </h1>
      <p className="mb-8 text-xs text-neutral-500">
        タップすると詳しい説明が開きます。
      </p>

      <div className="space-y-8">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* はじめに */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionHeading icon={<Chrome className="h-4 w-4" />} title="はじめに" />

          <div className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            <p>
              このアプリは <strong>Google Chrome</strong> で開いてください。
              Safari など他のブラウザでは一部の機能が動作しません。
            </p>

            <Foldable title="LINE でURLを受け取った場合">
              <Note className="mb-3">
                LINEのトーク画面でリンクをタップすると、LINE内蔵ブラウザで開いてしまいます。
                以下の方法で Chrome に切り替えてください。
              </Note>

              <SubHeading>iPhone / iPad の場合</SubHeading>
              <p className="mb-1">
                LINEの設定で、リンクを常に Chrome で開くようにできます。
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>iPhone に <strong>Google Chrome</strong> をインストール（App Store から無料）</li>
                <li>LINEの「<strong>ホーム</strong>」タブ → 右上の歯車（<strong>設定</strong>）</li>
                <li>「<strong>LINEラボ</strong>」をタップ</li>
                <li>「<strong>リンクをデフォルトのブラウザで開く</strong>」を<strong>オン</strong></li>
              </ol>
              <p className="mt-1 text-neutral-500">
                ※ 設定後は、LINE内のリンクをタップするだけで Chrome で開くようになります。
              </p>

              <SubHeading className="mt-3">Android の場合</SubHeading>
              <p className="mb-1">
                LINEでリンクをタップして開いた後、Chrome に切り替えます。
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>LINEのトーク画面でリンクをタップして開く</li>
                <li>画面内のメニュー（<strong>⋮</strong>）から「<strong>他のアプリで開く</strong>」または「<strong>デフォルトのブラウザで開く</strong>」を選択</li>
              </ol>
              <p className="mt-1 text-neutral-500">
                ※ メニューの表示名や位置は、機種やLINEのバージョンによって異なる場合があります。
              </p>

              <SubHeading className="mt-4">うまく開けない場合（共通）</SubHeading>
              <p>
                上記の方法でうまくいかないときは、URLをコピーして Chrome のアドレス欄に貼り付けて開いてください。
              </p>
              <p className="mt-1 text-neutral-500">
                ※ URLのコピー方法は、リンクの長押しや画面内のメニューなど、機種やLINEのバージョンによって異なる場合があります。
              </p>
            </Foldable>

            <Foldable title="ホーム画面に追加する（スマホ向け）">
              <p className="mb-2">
                Chrome でこのアプリを開いた状態でホーム画面に追加すると、
                次回からワンタップで開けます。
              </p>

              <SubHeading>Android（Chrome）</SubHeading>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Chrome の右上メニュー「<strong>⋮</strong>」をタップ</li>
                <li>「<strong>ホーム画面に追加</strong>」を選択</li>
              </ol>

              <SubHeading className="mt-3">iPhone（Chrome）</SubHeading>
              <p>
                iPhone の Chrome では「ホーム画面に追加」がないため、
                Chrome のブックマークに保存してご利用ください。
              </p>
            </Foldable>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* よくある質問 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionHeading icon={<MessageCircleQuestion className="h-4 w-4" />} title="よくある質問" />

          <div className="mt-2 space-y-0">
            {/* ── FAQ 1 ── */}
            <FaqItem question="動画はどこからセットしますか？">
              <Note className="mb-3">
                このアプリは動画をダウンロード・保存するものではありません。
                YouTube の URL やスマホ内の動画ファイルなど、
                <strong>動画がある場所を登録して再生する</strong>仕組みです。
                動画データそのものはアプリの中には入りません。
              </Note>

              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="mb-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                  レッスンで使う動画はご自身でご用意ください
                </p>
                <p className="mb-1.5">このアプリには教材動画は含まれていません。以下のような動画を登録できます。</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  <li>YouTube などの動画URL</li>
                  <li>ご自身で撮影した動画</li>
                  <li>パソコン・スマートフォンに保存している動画ファイル</li>
                  <li>お持ちの教材DVDなどを、必要に応じて動画ファイルに取り込んだもの</li>
                </ul>
                <p className="mt-1.5 text-neutral-500">
                  ※ 動画の利用にあたっては、著作権や配信元の利用条件をご確認ください。
                </p>
              </div>

              <p className="mb-3">
                このアプリでは <strong>コース → セクション → レッスン → 動画</strong> という
                階層で管理します。動画を追加するには、まずこの階層を作ります。
              </p>

              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="text-center text-[11px] text-neutral-500">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">コース</span>
                  {' > '}
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">セクション</span>
                  {' > '}
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">レッスン</span>
                  {' > '}
                  <span className="font-medium text-accent-600 dark:text-accent-400">動画</span>
                </p>
                <p className="mt-1 text-center text-[10px] text-neutral-400 dark:text-neutral-600">
                  例: NHK手話講座 {'>'} 第1週 {'>'} あいさつの表現 {'>'} 動画ファイル
                </p>
              </div>

              <div className="space-y-4">
                <Step n={1} title="コースを作成">
                  サイドバーの「<strong>コースを追加</strong>」ボタンからコース名を入力します。
                </Step>
                <Step n={2} title="セクションを追加">
                  コース名にカーソル（タップ）を合わせると表示される
                  「<strong>+</strong>」ボタンからセクションを追加します。
                </Step>
                <Step n={3} title="レッスンを追加">
                  同じようにセクション名の「<strong>+</strong>」からレッスンを追加します。
                </Step>
                <Step n={4} title="動画を登録">
                  レッスンを選択 → 画面下の「<strong>詳細</strong>」タブ →「<strong>動画ソースを追加</strong>」で、
                  YouTube URL、外部 URL、またはスマホ・PC 内の動画ファイルを登録します。
                </Step>
              </div>

              <Note className="mt-4">
                1つのレッスンに複数の動画を登録できますが、
                基本的には<strong>1レッスン1動画</strong>の方が管理しやすくおすすめです。
              </Note>
            </FaqItem>

            {/* ── FAQ 2 ── */}
            <FaqItem question="ブックマークとメモの違いは何ですか？">
              <div className="space-y-4">
                <div>
                  <SubHeading>ブックマーク — 手話の語彙を記録する</SubHeading>
                  <p className="mb-2">
                    動画内の手話表現を<strong>語彙単位</strong>で書き留めるのに向いています。
                  </p>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <p className="text-[11px] text-neutral-500">使用例:</p>
                    <p className="mt-1 font-medium text-neutral-700 dark:text-neutral-300">
                      <code className="rounded bg-neutral-200 px-1 py-0.5 text-accent-700 dark:bg-neutral-800 dark:text-accent-400">0:12</code>
                      {' '}夏 ▸ 連休 ▸ 間
                      <span className="ml-2 text-neutral-400">（＝「夏休み中」）</span>
                    </p>
                  </div>
                </div>

                <div>
                  <SubHeading>メモ — 気づきや練習メモを書く</SubHeading>
                  <p className="mb-2">
                    学習中に感じたことや、後で見返したい情報を自由に書けます。
                  </p>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
                    <p className="text-[11px] text-neutral-500">使用例:</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700 dark:text-neutral-300">
                      <li>この部分は準1級の語彙</li>
                      <li>右手の動きを大きくすると伝わりやすそう</li>
                      <li>このチャンクで「来週の予定」という意味になる</li>
                    </ul>
                  </div>
                </div>
              </div>
            </FaqItem>

            {/* ── FAQ 3 ── */}
            <FaqItem question="「詳細」タブでは何ができますか？">
              <p className="mb-2">
                レッスン画面の「<strong>詳細</strong>」タブでは、主にレッスンへの<strong>動画の追加</strong>ができます。
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>「<strong>動画ソースを追加</strong>」から YouTube URL、外部 URL、ローカル動画を登録できます</li>
                <li>そのほか、未完了のレッスンを完了に変更することもできます</li>
              </ul>
            </FaqItem>

            {/* ── FAQ 4 ── */}
            <FaqItem question="「リソース」とは何ですか？">
              <p className="mb-2">
                よく使うウェブサイトを登録しておける<strong>ブックマーク機能</strong>です。
                手話学習に役立つサイトをまとめておくと便利です。
              </p>

              <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="text-[11px] text-neutral-500">登録例:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700 dark:text-neutral-300">
                  <li>新しい手話の動画サイト</li>
                  <li>手話辞典オンライン</li>
                  <li>検定試験の公式ページ</li>
                </ul>
              </div>

              <p className="mb-2">
                画面上部の「<strong>リソース</strong>」メニューから利用できます。
              </p>

              <SubHeading>使い方</SubHeading>
              <ol className="list-decimal space-y-1 pl-5">
                <li>まず「<strong>+ カテゴリ</strong>」ボタンでカテゴリを作成</li>
                <li>次に「<strong>+ リソースを追加</strong>」でURLを登録</li>
              </ol>
              <p className="mt-1 text-neutral-500">
                ※ カテゴリを先に作らないとリソースを追加できません。
              </p>
            </FaqItem>

            {/* ── FAQ 4 ── */}
            <FaqItem question="ホーム画面に追加できますか？">
              <SubHeading>Android（Chrome）</SubHeading>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Chrome で開いた状態で右上メニュー「<strong>⋮</strong>」をタップ</li>
                <li>「<strong>ホーム画面に追加</strong>」を選択</li>
              </ol>

              <SubHeading className="mt-3">iPhone（Chrome）</SubHeading>
              <p>
                iPhone の Chrome ではこの機能がないため、ブックマークをご利用ください。
              </p>
            </FaqItem>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 機能ガイド */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section>
          <SectionHeading icon={<HelpCircle className="h-4 w-4" />} title="機能ガイド" />

          <div className="mt-2 space-y-0">
            {/* ── 動画の再生操作 ── */}
            <Foldable title="動画の再生操作" icon={<Play className="h-3.5 w-3.5" />}>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>
                  <strong>再生速度</strong>: 0.25x〜2x の範囲で変更できます
                </li>
                <li>
                  <strong>5秒戻し / 10秒送り</strong>: 再生ボタンの左右にあるスキップボタンで、
                  少しだけ巻き戻し・早送りができます
                </li>
                <li>
                  <strong>A-Bリピート</strong>: 繰り返し見たい区間のA地点とB地点を設定すると、
                  その区間だけを繰り返し再生します。
                  設定後は <strong>A-/A+/B-/B+</strong> ボタンで0.5秒単位の微調整ができます。
                  A または B をもう一度押すと解除されます
                </li>
                <li>
                  <strong>シアターモード</strong>: 動画プレイヤーの拡大アイコンを押すと
                  画面いっぱいに広がります
                </li>
                <li>
                  <strong>再生位置の記憶</strong>: 次回レッスンを開いたときに続きから再生されます
                </li>
              </ul>
            </Foldable>

            {/* ── ブックマーク・メモの使い方 ── */}
            <Foldable title="ブックマーク・メモの操作方法" icon={<Bookmark className="h-3.5 w-3.5" />}>
              <SubHeading>ブックマーク</SubHeading>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>動画の再生中に「<strong>現在位置に追加</strong>」で作成</li>
                <li>ラベル（任意）を付けられます</li>
                <li>タイムスタンプをタップでその位置にジャンプ</li>
                <li>タイムスタンプを<strong>ダブルタップ</strong>すると時刻を手入力で修正できます</li>
              </ul>

              <SubHeading className="mt-3">メモ</SubHeading>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>「<strong>時刻付き</strong>」: 動画の再生位置に紐づくメモ</li>
                <li>「<strong>一般</strong>」: タイムスタンプなしの自由メモ</li>
                <li>鉛筆アイコンで編集、ゴミ箱アイコンで削除</li>
              </ul>

              <SubHeading className="mt-3">振り返り</SubHeading>
              <p>
                画面上部の「<strong>振り返り</strong>」メニューから、
                全コースのブックマーク・メモを一覧で確認できます。
              </p>
            </Foldable>

            {/* ── コース管理 ── */}
            <Foldable title="コース・セクション・レッスンの管理" icon={<GripVertical className="h-3.5 w-3.5" />}>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>各項目にカーソルを合わせると編集・削除ボタンが表示されます</li>
                <li>
                  左端のグリップ（<GripVertical className="inline h-3 w-3 text-neutral-500" />）を
                  ドラッグして<strong>並び替え</strong>ができます
                </li>
                <li>セクションを別のコースへ、レッスンを別のセクションへ<strong>移動</strong>できます</li>
              </ul>
            </Foldable>

            {/* ── バックアップ ── */}
            <Foldable title="データのバックアップ" icon={<Download className="h-3.5 w-3.5" />}>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>画面上部の「<strong>設定</strong>」からデータの<strong>エクスポート</strong>（ダウンロード）ができます</li>
                <li>エクスポートしたファイルから<strong>インポート</strong>してデータを復元できます</li>
              </ul>
              <Note className="mt-3">
                データはブラウザ内部に保存されています。
                ブラウザのデータ消去を行うとデータが失われるため、定期的なバックアップをおすすめします。
              </Note>
            </Foldable>
          </div>
        </section>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 共通コンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** セクション見出し（折りたたまない） */
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-sm font-bold text-neutral-800 dark:border-neutral-800 dark:text-neutral-200">
      <span className="text-accent-600 dark:text-accent-400">{icon}</span>
      {title}
    </h2>
  )
}

/** 折りたたみセクション */
function Foldable({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <details className="manual-foldable border-b border-neutral-200 dark:border-neutral-800">
      <summary className="flex items-center gap-2 py-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
        <ChevronRight className="manual-chevron h-3.5 w-3.5 flex-shrink-0 text-neutral-400 transition-transform duration-150 dark:text-neutral-600" />
        {icon && <span className="text-accent-600 dark:text-accent-400">{icon}</span>}
        {title}
      </summary>
      <div className="pb-4 pl-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {children}
      </div>
    </details>
  )
}

/** FAQ 項目（Q マーク付き折りたたみ） */
function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="manual-foldable border-b border-neutral-200 dark:border-neutral-800">
      <summary className="flex items-center gap-2 py-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
        <ChevronRight className="manual-chevron h-3.5 w-3.5 flex-shrink-0 text-neutral-400 transition-transform duration-150 dark:text-neutral-600" />
        <span className="flex-shrink-0 rounded bg-accent-100 px-1.5 py-0.5 text-[10px] font-bold text-accent-700 dark:bg-accent-700/30 dark:text-accent-400">
          Q
        </span>
        {question}
      </summary>
      <div className="pb-4 pl-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {children}
      </div>
    </details>
  )
}

function SubHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`mb-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 ${className ?? ''}`}>
      {children}
    </h3>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-100 text-[11px] font-bold text-accent-700 dark:bg-accent-700/30 dark:text-accent-400">
        {n}
      </span>
      <div>
        <p className="mb-0.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">{title}</p>
        <p>{children}</p>
      </div>
    </div>
  )
}

function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20 ${className ?? ''}`}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
      <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200/80">{children}</p>
    </div>
  )
}
