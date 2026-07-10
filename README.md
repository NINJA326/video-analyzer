# NINJA Video Analyzer Pro v14.0.0

NINJA AIRS専用の本格動画分析・解説デスクトップアプリです。

## 最新バージョン

**v14.0.0**

## 主な機能

- MP4 / MOV / M4V / WebM読込
- YouTube URL分析モード
- 全画面表示
- 再生・停止・±5秒・速度変更
- コマ送り
- ペン・直線・円・四角
- 曲線矢印補正
- 元に戻す・やり直し
- コメント・無料音声入力
- コメント画面表示
- 選手選択
- 場面保存・移動・削除
- 高画質録画
- 画像保存
- プロジェクト保存・読込
- YouTube Studio起動
- 設定保存
  - コメント表示時間
  - ペン入力後の自動再開時間
  - コマ送りFPS

## 推奨運用

1. 自分のYouTube動画をYouTube StudioからMP4でダウンロード
2. 本アプリへMP4を読み込む
3. フル画面で分析・解説
4. 高画質で保存
5. YouTube Studioへ再アップロード

YouTube URLモードは分析・座学用です。YouTube動画本体を自動取得・MP4変換する機能は含みません。

## 起動

Node.js LTSをインストール後、このフォルダで:

```bash
npm install
npm start
```

## アプリ化

Mac:

```bash
npm run dist:mac
```

Windows:

```bash
npm run dist:win
```

生成物は `dist` フォルダに出ます。

## 注意

- Chrome/Electronベースで動作します。
- macOSでは初回にマイク・画面収録の許可が必要な場合があります。
- 自分が権利を持つ動画、または利用許諾を得た動画で使用してください。
