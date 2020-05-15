# DNCL-Transpiler

[XTetra](https://tetraprogram.jp/XTetra/ "XTetra")で使用されているDNCLのトランスコンパイラ．実行可能なJavaScriptコードを生成します．

## 使用方法

### 組み込み関数の定義
以下のようにDNCL.Functions.BuiltinFuncsオブジェクトを上書きします．
```js
DNCL.Functions.BuiltinFuncs = {
    /**
     * "関数名":{
     *  params:[引数1,引数2,...引数n],
     *  paramCount:引数の総数,
     *  native_f:function $関数名(引数1,引数2,...引数n){
     *      //処理
     *  }
     * }
     */
    "入力": {
        params: [],
        paramCount: 0,
        native_f: function $入力() {
            var val = window.prompt("値を入力してください");
            return val == null ? "" : val;
        }
    },
    "平方根": {
        params: ["x"],
        paramCount: 1,
        native_f: function $平方根(x) {
            return Math.sqrt(x);
        }
    }
}
```

### 各種設定
トランスコンパイラの初期設定情報はDNCL.Settingオブジェクトに格納します．
```js
DNCL.Setting = {
    array_begins_from: 1,//配列の先頭のインデックス
    output_func: 'alert',//標準出力関数
    includes_comment: true,//コメント文の除去の指定
    errorMarker: '★'//エラーレポート時のマーカー
}
```

### 実行処理
DNCL.Transpileメソッドに，文字列表現のDNCLプログラムを引数として与え呼び出すことで，フォーマットされたDNCLプログラムと
トランスパイルされたJavaScriptコードを取得することができます．ランタイムエラーやコンパイルエラーはtry-catch構文により処理します．
```js
try {
    let result = DNCL.Transpile(/*DNCLソースコード*/);
    let dncl_code = result.dncl;//フォーマットされたDNCLコードを取得
    let js_code = result.js;//トランスパイルされたJSコードを取得
    try {
        eval(js_code);//実行
    } catch (e) {
        //TODO:ランタイムエラー時の処理
    }
} catch (e) {
    //TODO:コンパイルエラー時の処理
}
```

## 用いたライブラリ
テキストエディタ：Marijn Haverbeke CodeMirror->
[https://codemirror.net](https://codemirror.net "CodeMirror")
