# Memoria LP 実装引き継ぎメモ

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
4. **ストアボタンは`<span>`のまま**（`#`リンクにもしていない）— 「Coming soon」表示。実URLが決まったら`<a>`に変えてリンクを差し込む
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

**フッターの法的リンク**（以前のプロトタイプで既に確定済み・そのまま使える）

- 利用規約: `https://indecisive-helicona-37f.notion.site/36ae8ceaad54803abcbbd408b5c421f9`
- プライバシーポリシー: `https://indecisive-helicona-37f.notion.site/36ae8ceaad54803e91b1c64bda518132`
- 特定商取引法に基づく表記: `https://indecisive-helicona-37f.notion.site/36ae8ceaad548028ba85df03d50ce8ae`

**画像の方向性**（今後さらにバリエーションを生成する場合の基準）

紺ベースの夕暮れ〜夜、暖色の光は光源（ランプ・窓・キャンドル）から滲み出す形のみ、強い明暗差（キアロスクーロ）、フォトリアル寄り、人物は2〜3人で後ろ姿・シルエットで顔は見せない、1つの連続したシーン。ロボット/マスコット/文字/ロゴは入れない。見出しを乗せる想定で画面上部〜左側に暗く静かな余白を残す。

`app-ads.txt`はAdMob用の設定ファイルなので触らない。
