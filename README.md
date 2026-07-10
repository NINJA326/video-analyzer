# NINJA Video Analyzer Pro

Mac / Windows向けElectronデスクトップ版です。

## 採用した方式

最も安定し、画質と使い勝手を両立するため、MP4編集を主軸にしています。

1. 自分のYouTube動画はYouTube StudioからMP4でダウンロード
2. 本アプリでMP4を画面いっぱいに表示
3. コマ送り・スロー・ペン・矢印・コメント・音声入力
4. 高画質WebMとして保存
5. YouTube Studioへ再アップロード

YouTube URLモードは分析・座学用です。YouTube動画本体を自動ダウンロード・MP4変換する機能は含みません。

## 起動手順

1. Node.js LTSをインストール
2. このフォルダでターミナルを開く
3. `npm install`
4. `npm start`

## アプリ化

Mac:
`npm run dist:mac`

Windows:
`npm run dist:win`

生成物は `dist` フォルダに出ます。
