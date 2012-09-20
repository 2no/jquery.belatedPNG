# jQuery.belatedPNG.js

DD_belatedPNG.js を jQuery 用のプラグインとして移植＆改造したものです。

本家：[DD_belatedPNG.js](http://www.dillerdesign.com/experiment/DD_belatedPNG/)

ほぼ内部の処理を変更せずに移植しています。既存のバグも再現されますのでご注意ください。

詳しい説明については下記をご参照ください。

* [http://wakuworks.jugem.jp/?eid=153](http://wakuworks.jugem.jp/?eid=153)
* [http://wakuworks.jugem.jp/?eid=166](http://wakuworks.jugem.jp/?eid=166)

## 開発版

develop ブランチにて開発を行なっています。

### 変更点

* 動的な画像変更に対応（img 要素の src 属性や、背景画像の変更に対応しました。スマートロールオーバーなどが使えます。）
* 画像サイズの動的変更に対応
* マウスイベント取得の改善
* マウスイベントの動的変更に対応（onmouseover や、onmouseout の動的変更に対応しました。）

自己責任でお使いください。

### 今後

* 画像非表示時に fixPng すると、画像サイズが正常に取れずに表示がおかしくなる問題の対処
