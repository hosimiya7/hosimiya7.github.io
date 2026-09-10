# Memoria — シェルターを残した調整案C

## 今回の前提

囲みはシェルターを表し、Memoriaが「家」である意味を担います。装飾として外さず、全バリエーションで囲み・炎・手を残しています。外周なしの前案Aは、この意味を失うため採用候補から外しました。

## 前案Bからの変更

- 炎を小さくして、囲みの頂点と炎の間に余白を確保。
- 大きな白い塗りの手を、細身の輪郭へ変更。囲みと手の線幅をそろえ、下半分の重さを軽減。
- 全体を縦長に戻し、「手に炎を乗せる」だけでなく「家の中で灯りを守る」構成に調整。
- 32〜64px用は囲み・手の線を少し太くした専用版を用意。大きい表示の標準版に一律で太い線を使わない。
- 炎の3色は元データの色を維持。影やぼかしは使用しない。

## 使用するファイル

| ファイル | 用途 |
| --- | --- |
| `memoria-shelter.svg` | 標準カラー・暗い背景用。背景透明 |
| `memoria-shelter-on-light.svg` | 標準カラー・明るい背景用。囲みと手が紺色 |
| `memoria-shelter-mono.svg` | 標準の紺1色。背景透明 |
| `memoria-shelter-reversed.svg` | 標準の生成り1色。背景透明 |
| `memoria-shelter-small.svg` | 32〜64px用カラー。囲みと手を太く調整 |
| `memoria-shelter-small-mono.svg` | 32〜64px用の紺1色 |
| `memoria-shelter-small-reversed.svg` | 32〜64px用の生成り1色 |
| `memoria-shelter-app-icon.svg` | 紺の正方形に配置した1024px原稿 |
| `memoria-shelter-icon-32.png` ～ `memoria-shelter-icon-1024.png` | 背景入りの書き出し。32 / 48 / 64pxは小サイズ用の線幅 |
| `memoria-shelter-transparent-1024.png` | 標準カラー・透明背景のPNG |

`comparison-shelter.png` は左が元データ、中央が前案B、右が今回の案Cです。画像の下部に小サイズと単色の比較を掲載しています。表示アプリで比較画像が縮小される場合、各サイズのPNGを100%表示して実寸を確認してください。

通常のSVGは256×256の座標系。標準の輪郭は5.5、小サイズ用は8。囲みと手を同じ線幅でまとめています。すべてSVGとして直接編集できます。

アプリ本体やサイトへのロゴ差し替えは行っていません。今回の修正案を確認するための独立したデータです。

## 再書き出し

Node.jsと`sharp`が利用できる環境で `node build.mjs`。`sharp`の配置先を指定するときは環境変数`MEMORIA_SHARP_PATH`を使用します。比較用に `reference-original.svg` と `reference-previous-b.svg` を同梱しています。
