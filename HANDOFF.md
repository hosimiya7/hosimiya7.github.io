# Memoria LP 実装引き継ぎメモ

## 2026-09-10 ストアスクショに合わせた世界観調整（最新）

ユーザー提供のストア画像5枚を基準に、「顔・表情の見えるアニメ調へ統一してよい、お任せ」と承認を受けて実装。下記の旧方針「写真寄り・後ろ姿やシルエット」は今回更新した。

- 色変数は変更なし。既存FVコピーと外部リンクも維持。
- FV：`assets/images/home-together-v2.webp`。3人が笑い合う部屋、猫、植物、ニットと木、豊かな暖色の灯り。PCは左にコピー、スマホは画像の下にコピーを配置。スマホのFVは通常スクロールとして顔と文字の重なりを避ける。
- 世界観・機能の背景・CTA：`assets/images/little-moments-v2.webp`。同じ部屋のカップ・本・眠る猫のイラストで統一。
- 星の細い軌跡と葉の線画をSVGで追加。写真の丸い上端、会話の吹き出し、暖色の薄い縁、丸みのあるストアボタンへ調整。主な見出しを既存のZen Kaku Gothic Newの500へ変更。
- 生成はbuilt-in `image_gen`。生成プロンプトと保存先は `assets/images/GENERATION-20260910.md`。旧画像は保存してある。
- 変更前のHTML/CSSは `output/design-20260910/` に退避。作業開始時点ですでにHTML、HANDOFF、CSSなどに未コミットの更新があったため、それらを引き継いだ。
- 検証：PCと390px・320pxのブラウザ表示、横スクロールなし、画像・アンカー・外部リンクの維持、色変数の一致、JS構文、差分の空白を確認。実機での確認・本番公開は未実施。

## 2026-09-05 演出・レイアウト更新（最新）

ユーザーの「雰囲気はよいが単調。アニメーションと画像を任せたい」という依頼に合わせ、夜の紺・灯りの暖色・既存のFV画像・実機スクリーンショット・ストア／法的リンクを引き継いで再構成した。以下の旧記録にある「単一HTML内のCSS/JS」「全体がビューポート比のrem」「既定の動きだけを使う」という設計は、今回の実装で更新されている。

- `index.html`：本文・SVG・リンク。スタイルは `assets/site.css`、動作は `assets/site.js` に分離。ライブラリやビルド工程は不要。
- 文字ロゴ：ユーザー提供の `C:/Users/nerok/Downloads/Memoria.svg` を `assets/brand/memoria-wordmark.svg` に採用。パス・比率を維持し、塗りだけ `#FFF8E8` に調整。ヘッダーとフッターで使用。アプリのシンボル `Group 320.svg` は別検討のため変更・採用していない。
- アプリシンボルの別検討：**囲みは家・シェルターを意味するため必須**（ユーザー説明）。外周なし案Aの推奨は撤回。太い外周あり案Bもバランスの指摘を受け、`assets/brand/symbol-refinement/shelter/` に最新案Cを保存。囲み・手を同じ細身の輪郭へ戻し、炎と囲みの間を広げた。32〜64pxは輪郭を太くした専用SVG/PNG。アプリ本体・LPには適用していない。詳細は同フォルダのREADMEを参照。
- FV：左寄せの大きな3行コピー、行ごとの登場、stickyの部屋画像、スクロールに合わせた接近と暗転、ナビゲーションを追加。
- 世界観：生成したカップの写真と文章の2列レイアウト。写真のマスク展開と控えめなパララックス。
- 言葉：中央の「おかえり。」と、そのまわりの8つの言葉。モバイルでは4つに絞る。
- 機能紹介：PCでは左のスマホをstickyで留め、右の4つの説明の位置に合わせてスクリーンショットを切り替える。モバイル・動きを減らす設定・JS無効では通常の縦並び。
- 循環：紙色が急に現れて浮くという指摘を受け、紺の背景と半透明の曇りガラス面へ変更。`cycle-glass`で本文と図を包み、淡い反射・薄い縁・背景ぼかしを付与。本文と図のラベルは生成りに戻し、前後の夜景になじませた。`#cycle`で直接移動できる。
- CTA：生成した灯りのある部屋を背景に使用。元のApp Store／Google Playリンクを維持。
- 画像生成記録は `assets/images/GENERATION.md`。追加画像2枚はそれぞれ約89KB・92KBのWebP。
- スクロール処理はpassiveイベントとrequestAnimationFrameでまとめ、位置の読み取りとCSS変数の更新を分離。`prefers-reduced-motion`の動的変更、IntersectionObserver非対応、JS無効でも本文を読める。
- 確認済み：HTMLのネスト・セクション構造・アンカー・画像ファイル・既存外部リンクの維持、CSSの括弧、JS構文、画面切替の往復・進捗の上下限・モーション軽減の切替（Nodeで処理を検証）。ブラウザの見た目／実機スクロール検証は未実施。
- GitHub Pagesへのpush／本番公開は行っていない。`app-ads.txt`も変更していない。

---

このリポジトリ（`hosimiya7.github.io`）はMemoria本体アプリのリポジトリとは別。CLAUDE.md等の参照系も無いので、必要な文脈はこのファイルに閉じて書いてある。

## 現状（このコミット時点）

`index.html`に**全セクションを仮で実装済み**（FV → 世界観 → 機能紹介3つ → CTA → フッター）。以前はNotionページへの`meta refresh`リダイレクトだったが、それを置き換えた。

- 画像: `assets/images/fv_pc.webp`（PC・幅760px以上）/ `assets/images/fv_sp.webp`（SP・760px未満）をCSSの`background-image`で幅により出し分け
- FVコピー: 「今日のことを、誰かに覚えていてもらえる。」/「灯りが、ひとつ、ふたつ。今日も、部屋があたたかい。」（承認済み）
- 本文書体は`Zen Kaku Gothic New`（Google Fonts・アプリ本体と統一）に変更済み。見出し（h1/h2/h3/eyebrow）は引き続きYu Mincho系のセリフ
- 評価：FVは「悪くはないけどよくもない、たたき台としてはここからでいい」。FV以外は**未承認の仮テキスト**

## アニメーションの方針（#828の朔の5案・実装済み）

「AIっぽくない／あたたかい／穏やか／でもゴチャついてない」を、**速い動き・鋭い光・幾何学的な粒子を全部やめる**引き算で作る。5案とも実装済み。CSS内の該当ブロックにコメントで対応を書いてある。

| # | 案 | 実装 |
|---|---|---|
| 1 | 背景がゆっくり息づく | `.breath` / `@keyframes breathe`（7.5〜8秒周期でopacity .5→1・微小scale）。世界観・CTA・FVに配置 |
| 2 | キャンドルのようなスローホバー | `.store-btn::before`の暖色radial-gradientを1.2sかけてふんわり出す。下線も`::after`をフェード（フッター） |
| 3 | 光の微粒子を2〜3個だけ | `.mote` / `@keyframes drift`（26〜32秒で浮上して消える・blur済みの丸）。各セクション2粒まで |
| 4 | インクが染み込むファントムフェード | `.reveal`（`blur(9px)→0` ＋ opacity、2.6秒。**下からのスライドはほぼ無し**＝.4remのみ）。`--d`で段差ディレイ |
| 5 | **静かな生活感の微動（りんが「一番重要」と指定）** | `.feature-visual`に`@keyframes idlefloat`（9〜11秒でtranslateY ±.35rem・要素ごとにディレイ差）。灯りの`flicker`も8〜12秒に鈍化 |

**共通ルール：** イージングは全て`--ease`（= `cubic-bezier(.42,0,.58,1)` ＝ ease-in-out）。ホバー等のUI遷移は`--slow`（1.2s）＝通常の約2倍。アンビエント系は7〜32秒。**新しく動きを足すときもこの2変数を使う**こと。`prefers-reduced-motion:reduce`で全アニメーションを停止させている（新規追加時はそこにも足す）。

## 組み方の下敷き：BOTANIST（りんが実CSSを提供・準拠済み）

洗練の方向性は https://botanistofficial.com/ に寄せる（りん指定）。**実際のCSSをりんから受け取って読んだ上で準拠している**ので、以下は推測ではない。

**採用した構造**

- **ルートfont-sizeがビューポート比**：`html{font-size:max(.7320644217vw,9px)}`（PC・1366px設計で1rem=10px）/ SPは`2.6666666667vw`（375px設計）。**つまりCSS中の`◯rem`は「設計上の◯0px」**。`clamp()`は使わず、全体が画面幅に比例して伸縮する。**新しく値を足すときも設計px÷10でremを書くこと**
  - ※`max(...,9px)`の下限だけ本家との意図的な差分。本家完全準拠だと1024px前後で本文が11px近くまで落ちるため
- **ブレークポイントも本家と同一**：SPは`@media screen and (max-width:768px),(orientation:portrait) and (hover:none)`、PCは`@media screen and (min-width:769px) and ((orientation:landscape) or (hover:hover))`
- **`--progress`（0→1）にスクロール量を流し込む方式**。JSは末尾の30行だけで、`[data-p]`が付いた要素に`--progress`をセットするのみ。**見た目は全部CSS側**。`data-shift`で開始位置をずらして段差をつける
- **ホバーは`@media (hover:hover) and (pointer:fine)`で囲う**。タッチ環境に置き土産を残さない
- `--side-padding:14rem`(PC)/`2.4rem`(SP)、段落間`margin-top:5rem`、`text-spacing-trim:space-all`、選択範囲色、`:focus-visible`のinsetリング — いずれも本家準拠

**本家から借りた具体テクニック**

| 本家 | Memoria側 |
|---|---|
| `home-fv-mission-links a` の `filter:blur(calc(10px*(1-p)))` ＋ `opacity:p` ＋ 二乗で減衰する`translate` | `.bleed`（朔案④のインク染み込みは、実はこの会社が実際にやっている手法そのもの） |
| `border-line` の `width:calc(100%*p)` | `.rule` / `.rule.wide`（伸びる1pxヘアライン） |
| `border-line-image` の `mask:linear-gradient(135deg,#000 calc(-300%+600%*p),transparent calc(600%*p))` | `.wipe`（スマホモックアップを斜めに拭き取るように出す） |
| `@keyframes beacon`（波紋がscale 0→1、opacity .2→0、0.3秒ずらして2枚） | `.lamp.is-beacon`（灯り1つだけ、6秒周期で halo が広がる） |
| `home-fv-out`（FV退出時に左右から地色の帯が閉じる） | `.fv-frame`（写真が夜色の枠に収まって本文レイアウトへ繋がる） |
| フッター下線の `transform-origin` 反転（左から引かれ、外すと右へ抜ける） | `.footer-links a::after` |
| イージング `cubic-bezier(.65,0,.35,1)` / `(.33,1,.68,1)` / `(.5,1,.89,1)` | `--ease-in-out` / `--ease-out` / `--ease-out-soft` |

**本家CSSを読んで、自分の実装が逆だったので直したところ**

1. **文字組み。** 本家は大見出し＝`line-height:1.35 / letter-spacing:.1em`（行間は詰め、字間は控えめ）、本文＝`line-height:2 / letter-spacing:.05em`。以前は見出しの行間2.15・字間.45emまで開けていて開けすぎだった。現在は本家準拠
2. **ホバーの速さ。** 朔案②は「通常の2倍ゆっくり」だが、本家のホバーは`.2s ease`と速い。**洗練の正体はホバーの遅さではなくスクロール連動の方**だった。現在は0.45sで、朔案の「カチッと光らせずふんわり広がる」質は残しつつ本家寄りに。0.2sまで速くするか1.2sに戻すかはりん判断
3. **本文の太さ。** 本家は「Yu Gothic Pr6N M」＝ミディアム。以前の`font-weight:300`は暗い背景で細すぎたので400に

**未導入（本家は使っているが、外部ライブラリが要るので入れていない）：** Lenis（慣性スクロール）、OverlayScrollbars（カスタムスクロールバー）、Splide（カルーセル）。FVのh1を`position:sticky`で画面中央に留める演出も本家にはあるが未実装。

## 未確定・要判断（ここが次の論点）

1. **世界観・機能紹介のコピーが全部仮** — アプリの実仕様を確認して書いていないので、文言の事実確認から必要
2. **機能3つの選び方も仮** — 「①ひとことが灯りになる ②手紙が返ってくる ③灯した日が積み重なる」と置いた。実際の主要機能と合っているか要確認（特に②の手紙の届き方）
3. **スマホモックアップはCSSで描いた模式図** — 実スクショではない。各画面に「画面はイメージです」の注釈を入れてある。実スクショが用意でき次第`<img>`に差し替える
4. ~~ストアボタン~~ **対応済み**。実URLが確定したので`<a>`にしてリンク済み（下記「既知の情報」参照）。CTAの文言も「配信予定」→「配信中」に変更し、「配信開始までお待ちください」の一文は削除した
5. 見出しのセリフをゴシックに揃えるかは未判断（現状はセリフ残し）

## フォントについて（りんの所感：「Memoriaの世界観に合わせないといけない気がする」）

**対応済み**：本文書体は下記の対応案どおり`Zen Kaku Gothic New`に変更した。以下は背景の記録。

**アプリ本体（Flutter）の実際の書体**（`lib/core/theme/app_theme.dart`で確認済み）：

- **本文・UI全体の既定書体：`Zen Kaku Gothic New`**（Google Fonts）— `ThemeData`の`textTheme`に`GoogleFonts.zenKakuGothicNewTextTheme(...)`で全体適用されている。手紙モードの本文（`letterBodyStyle`）もこれ
- `Klee One`（Google Fonts）は本文フォントではなく、アルバム画面の日付スタンプ風の小さな装飾1箇所だけで使われている局所的なアクセント。LP全体の書体候補にはしない方がいい
- 見出し用の和文セリフ（Yu Mincho系）はアプリ側には存在しない。LP独自に足した書体なので、「Memoriaの世界観と合っているか」は未検証のまま

**対応案（採用済み）：** LPの本文書体を`Zen Kaku Gothic New`に寄せて、アプリと地続きにする。見出し（h1・eyebrow）に今のセリフを残すか、こちらもゴシックに揃えるかは要判断（現状はセリフのまま）。実HTMLページなので（Claudeのartifact環境と違い）Google FontsのCDN読み込みは問題なく使える：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
```

## 既知の情報（新しく調べ直さなくていいもの）

**テーマカラー**（`lib/core/theme/app_theme.dart`と同じ値。LPも地続きの色で組む）

| 用途 | 変数名 | HEX |
|---|---|---|
| 背景（夜の紺・上端） | backgroundDark | `#0C1524` |
| 背景（夜の紺・下端） | backgroundBottom | `#1B355A` |
| 灯りの主色 | primary | `#F29441` |
| 灯りの芯（最も明るい） | warmRamp0 | `#FCEBBA` |
| 灯りの縁 | warmRamp4 | `#E6793D` |
| 燠（おき）色 | warmRamp5 | `#D95D39` |
| 生成りの壁（真っ白は使わない） | wallWhite | `#FFF8E8` |
| 補助テキスト・輪郭 | secondaryDark | `#94A3B8` |

**ストアURL**（確定済み・実装済み）

- App Store: `https://apps.apple.com/jp/app/id6776899625`
- Google Play: `https://play.google.com/store/apps/details?id=com.stelladear.memoria`

**フッターの法的リンク**（以前のプロトタイプで既に確定済み・そのまま使える）

- 利用規約: `https://indecisive-helicona-37f.notion.site/36ae8ceaad54803abcbbd408b5c421f9`
- プライバシーポリシー: `https://indecisive-helicona-37f.notion.site/36ae8ceaad54803e91b1c64bda518132`
- 特定商取引法に基づく表記: `https://indecisive-helicona-37f.notion.site/36ae8ceaad548028ba85df03d50ce8ae`

**画像の方向性**（今後さらにバリエーションを生成する場合の基準）

紺ベースの夕暮れ〜夜、暖色の光は光源（ランプ・窓・キャンドル）から滲み出す形のみ、強い明暗差（キアロスクーロ）、フォトリアル寄り、人物は2〜3人で後ろ姿・シルエットで顔は見せない、1つの連続したシーン。ロボット/マスコット/文字/ロゴは入れない。見出しを乗せる想定で画面上部〜左側に暗く静かな余白を残す。

`app-ads.txt`はAdMob用の設定ファイルなので触らない。
