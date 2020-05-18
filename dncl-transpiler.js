/***
 * module DNCL
 * 
 * Copyright (c) 2020 Takumi Daimon.
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

'use strict';

const DNCL = {
    /**
     * DNCLをJavaScriptにトランスパイルします.
     * @param {String} dncl DNCLで記述されたプログラム.
     * @return {Object} トランスパイルされたJavaScriptコードとフォーマットされたDNCLプログラム.
     */
    Transpile: function (dncl) {
        DNCL.Lexer.init(dncl.trimEnd());
        let tokens = DNCL.Lexer.tokenize();
        DNCL.Nodes.init();
        DNCL.Parser.init(tokens);
        let root = DNCL.Parser.process(0);
        let js_code = root.js_expr(DNCL.Nodes.dynamic_fields());
        return { dncl: root.dncl_expr(), js: this.Functions.getNatives() + js_code };
    },
    /**
     * 組み込み関数とJavaScript関数
     */
    Functions: {
        /**
         * ユーティリティ関数と組み込み関数を結合したコードを返します．
         * 組み込み関数は使用されたもののみがリンクされます.
         * @return {String} ユーティリティ関数と組み込み関数を結合したコード.
         */
        getNatives: function () {
            let buff = ["//[Native functions]"];
            for (let i in this.NativeFunctions) {
                buff.push(this.NativeFunctions[i]);
            }
            buff.push("//[Built-in functions]");
            for (let i in DNCL.Functions.BuiltinFuncs) {
                if (DNCL.Nodes.isCalled(i)) {
                    buff.push(this.BuiltinFuncs[i].native_f);
                }
            }
            buff.push("//");
            return buff.join('\n') + "\n";
        },
        /**
         * JavaScriptで定義したユーティリティ関数. 
         * 編集しない!!!!
         */
        NativeFunctions: [
            "var _ops={'＋':{'string':{'number':!0,'boolean':!0,'string':!0,'object':!0,'undefined':!0},'number':{'number':!0,'string':!0,'object':!0},'boolean':{'boolean':!0,'string':!0,'object':!0},'object':{'number':!0,'boolean':!0,'string':!0,'object':!0},'undefined':{'string':!0}},'－':{'number':{'number':!0}},'×':{'number':{'number':!0}},'/':{'number':{'number':!0}},'÷':{'number':{'number':!0}},'%':{'number':{'number':!0}},'または':{'boolean':{'boolean':!0}},'かつ':{'boolean':{'boolean':!0}},'＜':{'number':{'number':!0}},'＞':{'number':{'number':!0}},'≧':{'number':{'number':!0}},'≦':{'number':{'number':!0}}};",
            function _initObj(_v) { var _r = _createObj(); for (var _i in _v) _r[_i] = _v[_i]; return _r; },
            function _createObj() { return { toString: function () { var _b = []; for (var _i in this) if (_i != 'toString') _b.push(((_i + "")[0] == "@" ? (_i + ":").slice(1) : "") + this[_i]); return '{' + _b.join(',') + '}'; } } },
            function _createArray(_x, _i, _a, _line, _at) { if (typeof _x[_i] != 'number') { _throw(_line, _at, "配列の大きさに" + _type(_x[_i]) + "が設定されました．"); } var _r = _createObj(), _j = 0; if (_i == _x.length - 1) { for (; _j < _x[_i]; _j++)_r[_j] = 0; return _r; } for (; _j < _x[_i]; _j++)_a[_j] = _createArray(_x, _i + 1, _r, _line, _at); return _a },
            function _setValToArr(_v, _c, _i, _t) { var _j = _i[_c]; if (_c == _i.length - 1) { _t[_j] = _v; return _t; } if (_t[_j] != undefined) { var _e = _t[_j]; typeof _e == 'object' ? _setValToArr(_v, _c + 1, _i, _e) : _t[_j] = _v; } else { var _a = _createObj(); _setValToArr(_v, _c + 1, _i, _a); _t[_j] = _a; } return _t; },
            function _getValFromArr(_c, _i, _t) { var _j = _i[_c]; if (_c == _i.length - 1) return _t[_j] != undefined ? _t[_j] : undefined; var _e = _t[_j]; if (_e != undefined) return typeof _e == 'object' ? _getValFromArr(_c + 1, _i, _e) : undefined; return undefined; },
            function _throw(_line, _at, msg) { throw { line: _line, charAt: _at, message: _line + "行目," + _at + "文字目:" + msg }; },
            function _type(_v) { var _ty = { 'string': "文字列", 'boolean': "論理値", 'number': "数値", 'object': "配列", 'undefined': "未定義" }; return _ty[typeof _v] },
            function _valck(_v, _t, _line, _at, _m) { return typeof _v == _t ? _v : _throw(_line, _at, _m); },
            function _hash(_v, _s) { return typeof _v == 'number' ? (_v - _s) : ("@" + _v); },
            function _operation(_l, _p, _r) { var _ty_L = typeof _l, _ty_R = typeof _r; return _ops[_p] && _ops[_p][_ty_L] && _ops[_p][_ty_L][_ty_R]; },
            function _add(_l, _r, _line, _at) { if (_operation(_l, "＋", _r)) return _l + _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の＋演算はありません．"); },
            function _sub(_l, _r, _line, _at) { if (_operation(_l, "－", _r)) return _l - _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の－演算はありません．"); },
            function _mul(_l, _r, _line, _at) { if (_operation(_l, "×", _r)) return _l * _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の×演算はありません．"); },
            function _div(_l, _r, _line, _at) { if (_operation(_l, "/", _r)) { if (_r == 0) _throw(_line, _at, "0で割られました．"); return _l / _r; } _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の/演算はありません．"); },
            function _div_floor(_l, _r, _line, _at) { if (_operation(_l, "÷", _r)) { if (_r == 0) _throw(_line, _at, "0で割られました．"); return Math.floor(_l / _r); } _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の÷演算はありません．"); },
            function _mod(_l, _r, _line, _at) { if (_operation(_l, "%", _r)) { if (_r == 0) _throw(_line, _at, "0で割った余りはありません．"); return _l % _r; } _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の%演算はありません．"); },
            function _minus(_r, _line, _at) { if (typeof _r == 'number') return -_r; _throw(_line, _at, _type(_r) + "の－演算はありません．"); },
            function _denai(_r, _line, _at) { if (typeof _r == 'boolean') return !_r; _throw(_line, _at, _type(_r) + "の否定演算はありません．"); },
            function _lthan(_l, _r, _line, _at) { if (_operation(_l, "＜", _r)) return _l < _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の＜演算はありません．"); },
            function _lthan_eq(_l, _r, _line, _at) { if (_operation(_l, "≦", _r)) return _l <= _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の≦演算はありません．"); },
            function _gthan(_l, _r, _line, _at) { if (_operation(_l, "＞", _r)) return _l > _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の＞演算はありません．"); },
            function _gthan_eq(_l, _r, _line, _at) { if (_operation(_l, "≧", _r)) return _l >= _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の≧演算はありません．"); },
            function _vars(obj) { var r = []; for (var i in obj) { if (i != 'toString') { r.push(obj[i]); } } return r; },
            function _get(obj, i) { return obj[i]; },
            function _len(obj) { return obj.length; }
        ],
        /**
         * すべての組み込み関数は以下の形式に従い定義する必要があります．
         * ・<関数名>：組み込み関数の名前．
         * ・params：引数.
         * ・paramCount：引数の個数.
         * ・native_f：組み込み関数． 「$<関数名>」の形で記述する.
         *  DNCL.Functions.BuiltinFuncs = {
         *      <関数名> : {
         *          params: ["x","y","z",...],
         *          paramCount: <引数の個数>,
         *          native_f: function $<関数名>(x) { <JavaScript側の処理> }
         *      }
         *  }
         */
        BuiltinFuncs: {}
    },
    /**
     * オプション.
     */
    Setting: {
        /**
         * 配列の先頭のインデックス．
         * @type Numbar
         */
        array_begins_from: 1,
        /**
         * 出力関数名．
         * @type String
         */
        output_func: 'alert',
        /**
         * トランスパイルされたプログラムにコメント文を含めるかどうかを示す.
         * @type Boolean
         */
        includes_comment: true,
        /**
         * エラー箇所を示すマーカーの定義.
         * @type String
         */
        errorMarker: '★'
    },
    /**
     * 記号類の定義.
     */
    Symbols: {
        "+": "PLUS", "＋": "PLUS", "-": "MINUS", "－": "MINUS", "*": "MUL", "＊": "MUL", "×": "MUL", "/": "DIV", "÷": "DIV_FLOOR", "%": "MOD", "％": "MOD", "(": "BRA_B", "（": "BRA_B", ")": "BRA_E", "）": "BRA_E", ",": "COMMA", "，": "COMMA", "、": "COMMA", "←": "L_ARROW", "=": "EQUAL", "＝": "EQUAL", "!": "NOT", "!=": "NOT_EQUAL", "≠": "NOT_EQUAL", "<": "L_THAN", "＜": "L_THAN",
        ">": "G_THAN", "＞": "G_THAN", "<=": "L_THAN_EQUAL", "≦": "L_THAN_EQUAL", ">=": "G_THAN_EQUAL", "≧": "G_THAN_EQUAL", "\n": "NEW_LINE", '"': "STR_B", '”': "STR_B", '「': "STR_B", '」': "STR_E", "{": "BLO_B", "｛": "BLO_B", "}": "BLO_E", "｝": "BLO_E", "[": "ARR_B", "［": "ARR_B", "]": "ARR_E", "］": "ARR_E", "/*": "B_COMMENT_B", "*/": "B_COMMENT_E", "//": "I_COMMENT_B"
    },
    /**
     * メタ文字の定義.
     */
    MetaString: {
        "\\n": "\\n", "\\t": "\\t", "\\\\": "\\\\", "\\\"": "\\\""
    },
    /**
     * 各種エンクロージャの定義.
     */
    EnclosurePair: {
        '"': '"', '”': '”', "「": "」", "/*": "*/", "//": "\n"
    },
    /**
     * 予約語の定義.
     */
    Keywords: {
        "を": "WO", "は": "HA", "と": "TO", "改行": "KAIGYOU", "表示する": "HYOUJISURU", "繰り返す": "KURIKAESU", "ならば": "NARABA", "から": "KARA", "まで": "MADE", "ずつ": "ZUTU", "返す": "KAESU", "かつ": "KATU", "または": "MATAHA", "もし": "MOSI", "そうでなく": "SOUDENAKU", "そうでなければ": "SOUDENAKEREBA",
        "になるまで": "NINARUMADE", "実行する": "JIKKOUSURU", "実行し": "JIKKOUSI", "繰り返し": "KURIKAESI", "手続き": "TETUDUKI", "関数": "KANSU", "の間": "NOAIDA", "減らしながら": "HERASINAGARA", "増やしながら": "HUYASINAGARA", "して": "SITE", "なしで": "NASIDE", "でない": "DENAI", "増やす": "HUYASU", "減らす": "HERASU",
        "true": "TRUE", "false": "FALSE", "True": "TRUE", "False": "FALSE", "undefined": "UNDEFINED", "NaN": "NAN",
        "の要素": "NOYOUSO", "について": "NITUITE"
    },
    /**
     * アルファベットの定義.
     */
    Alphabets: {
        "a": "a", "ａ": "a", "A": "A", "Ａ": "A", "b": "b", "ｂ": "b", "B": "B", "Ｂ": "B", "c": "c", "ｃ": "c", "C": "C", "Ｃ": "C", "d": "d", "ｄ": "d", "D": "D", "Ｄ": "D", "e": "e", "ｅ": "e", "E": "E", "Ｅ": "E", "f": "f", "ｆ": "f", "F": "F", "Ｆ": "F", "g": "g", "ｇ": "g", "G": "G", "Ｇ": "G", "h": "h", "ｈ": "h", "H": "H", "Ｈ": "H", "i": "i", "ｉ": "i", "I": "I", "Ｉ": "I", "j": "j", "ｊ": "j", "J": "J", "Ｊ": "J", "k": "k", "ｋ": "k", "K": "K", "Ｋ": "K", "l": "l", "ｌ": "l", "L": "L", "Ｌ": "L", "m": "m", "ｍ": "m", "M": "M", "Ｍ": "M",
        "n": "n", "ｎ": "n", "N": "N", "Ｎ": "N", "o": "o", "ｏ": "o", "O": "O", "Ｏ": "O", "p": "p", "ｐ": "p", "P": "P", "Ｐ": "P", "q": "q", "ｑ": "q", "Q": "Q", "Ｑ": "Q", "r": "r", "ｒ": "r", "R": "R", "Ｒ": "R", "s": "s", "ｓ": "s", "S": "S", "Ｓ": "S", "t": "t", "ｔ": "t", "T": "T", "Ｔ": "T", "u": "u", "ｕ": "u", "U": "U", "Ｕ": "U", "v": "v", "ｖ": "v", "V": "V", "Ｖ": "V", "w": "w", "ｗ": "w", "W": "W", "Ｗ": "W", "x": "x", "ｘ": "x", "X": "X", "Ｘ": "X", "y": "y", "ｙ": "y", "Y": "Y", "Ｙ": "Y", "z": "z", "ｚ": "z", "Z": "Z", "Ｚ": "Z"
    },
    /**
     * 数字の定義.
     */
    Numbers: {
        "0": "0", "０": "0", "1": "1", "１": "1", "2": "2", "２": "2", "3": "3", "３": "3", "4": "4", "４": "4",
        "5": "5", "５": "5", "6": "6", "６": "6", "7": "7", "７": "7", "8": "8", "８": "8", "9": "9", "９": "9",
    },
    Lexer: {
        /**
         * Lexerオブジェクトを初期化します．
         * @constructor
         */
        init: function (code) {
            this.symbols = [];
            this.keywords = [];
            this.enclosures = [];
            this.metaString = [];
            this.alphabets = [];
            this.numbers = [];
            this.alph_num_formats = [];
            this.alph_num_formats["."] = ".";
            this.alph_num_formats["．"] = ".";
            this.alph_num_formats["_"] = "_";
            this.alph_num_formats["＿"] = "_";
            for (let a in DNCL.Alphabets) {
                this.alphabets[a] = DNCL.Alphabets[a];
                this.alph_num_formats[a] = DNCL.Alphabets[a];
            }
            for (let n in DNCL.Numbers) {
                this.numbers[n] = DNCL.Numbers[n];
                this.alph_num_formats[n] = DNCL.Numbers[n];
            }
            for (let s in DNCL.Symbols) this.symbols[s] = DNCL.Symbols[s];
            for (let k in DNCL.Keywords) this.keywords["@" + k] = DNCL.Keywords[k];
            for (let e in DNCL.EnclosurePair) this.enclosures[e] = DNCL.EnclosurePair[e];
            for (let m in DNCL.MetaString) this.metaString[m] = DNCL.MetaString[m];
            this.pos = 0;
            this.row = 1;
            this.col = 1;
            this.code = code;
            this.definedName = [];
            this.tokens = [];
            this._includes_comment_ = DNCL.Setting.includes_comment;
        },
        /**
         * 定義された変数名，関数名を記録します.
         * @param {String} name 変数または関数名.
         */
        define: function (name) { this.definedName["@" + name] = true; },
        /**
         * パラメータの名前の変数または関数が使用されたかを判定します.
         * @param {String} exp 変数または関数名.
         * @return {Boolean} nameが使用されていた場合はtrue.
         */
        isDefined: function (name) { return this.definedName["@" + name]; },
        /**
         * expが数字であるかを判定します.
         * @param {String} exp 判定する文字.
         * @return {Boolean} expが数字である場合はtrue.
         */
        isNum: function (exp) { return this.numbers[exp] != undefined; },
        /**
         * expが日本国文字であるかを判定します．
         * @param {String} exp 判定する文字.
         * @return {Boolean} expが日本語文字である場合はtrue.
         */
        isJapanese: function (exp) { return !this.isSymbol(exp) && /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/.test(exp); },
        /**
         * expがアルファベットであるかを判定します.
         * @param {String} exp 判定する文字.
         * @return {Boolean} expがアルファベットである場合はtrue.
         */
        isAlphabet: function (exp) { return this.alphabets[exp] != undefined; },
        /**
         * expが記号であるかを判定します.
         * @param {String} exp 判定する文字.
         * @return {Boolean} expが記号である場合はtrue.
         */
        isSymbol: function (exp) { return this.symbols[exp] != undefined; },
        /**
         * expがメタ文字であるかを判定します.
         * @param {String} exp 判定する文字.
         * @return {Boolean} expがメタ文字である場合はtrue.
         */
        isMetaString: function (exp) { return this.metaString[exp] != undefined; },
        /**
         * expが予約語であるかを判定します.
         * @param {String} exp 判定する文字列.
         * @return {Boolean} expが予約語である場合はtrue.
         */
        isKeywod: function (exp) { return this.keywords["@" + exp] != undefined; },
        /**
         * expの分類を返します.
         * @param {String} exp 予約語の文字列.
         * @return {String} 予約語の分類.
         */
        getKeywod: function (exp) { return this.keywords["@" + exp]; },
        /**
         * expに対応するエンクロージャを返します.
         * @param {String} exp 対象のエンクロージャ.
         * @return {String} The expに対応するエンクロージャ.
         */
        getEnclosure: function (exp) { return this.enclosures[exp]; },
        /**
         * 未読の文字が残っているかを判定します．
         * @return {Boolean} 未読の文字が残っている場合true．
         */
        hasNext: function () { return this.pos < this.code.length; },
        /**
         * 空文字をスキップします.
         */
        skipEmpty: function () {
            while (true) {
                let p = this.peek();
                if (p == ' ' || p == '　' || p == '\t' || p == '\b' || p == '\r') {
                    this.read();
                } else {
                    break;
                }
            }
        },
        /**
         * 1文字読み進め，読み進めた文字を返します.
         * @return {String} 読み進めた文字.
         */
        read: function () {
            let r = this.code[this.pos++];
            if (r == '\n') {
                this.col = 1;
                this.row++;
            } else {
                this.col++;
            }
            return r;
        },
        /**
         * 現在見ている文字を返します.
         * @return {String} 現在見ている文字.
         */
        peek: function () { return this.code[this.pos]; },
        /**
         * フォーマットされた日本語文字を返します.
         * @return {String} フォーマットされた日本語文字.
         */
        formatJapanese: function (x) { return this.alph_num_formats[x] ? this.alph_num_formats[x] : x; }
    },
    /**
     * ASTを構築するためのメソッド類.
     */
    Nodes: {
        /**
         * Nodesオブジェクトを初期化します.
         * @constructor
         */
        init: function () {
            this.line_count = 1;
            this.defined_funcs = [];
            this.defined_pros = [];
            this.called_funcs = [];
            for (let i in DNCL.Functions.BuiltinFuncs) this.registerFuncInfo(i, DNCL.Functions.BuiltinFuncs[i])
        },
        /**
         * 指定された個数のタブ文字を連結した文字列を返します.
         * この関数はJavaScript用です．
         * @param {Number} タブの個数．
         * @return {String} タブ文字をlevel個連結した文字列.
         */
        getTab: function (level) {
            return new Array(level).fill("    ", 0, level).join('');
        },
        /**
         * 指定された個数のタブ文字を連結した文字列を返します.
         * この関数はDNCL用です．
         * @param {Number} タブの個数．
         * @return {String} タブ文字をlevel個連結した文字列.
         */
        getDNCLTab: function (level) {
            return new Array(level).fill("\t", 0, level).join('');
        },
        /**
         * 対象の関数が呼び出されたかを判定します．
         * @param {String} name 対象の関数の名前．
         * @return {Boolean} 対象の関数が呼び出された場合true．
         */
        isCalled: function (name) { return this.called_funcs["@" + name]; },
        /**
         * 対象の関数が呼び出されたことを登録します.
         * @param {String} 対象の関数の名前．
         */
        called: function (name) { this.called_funcs["@" + name] = true; },
        /**
         * 関数の情報を登録します．
         * @param {String} name 関数名.
         * @param {Object} info 関数の情報.
         * @param {proc} 関数が手続きであるかを示す値.
         */
        registerFuncInfo: function (name, info, proc) { this.defined_funcs["@" + name] = info; if (proc) { this.defined_pros["@" + name] = true; } },
        /**
         * 対象の関数が手続きであるかを判定します.
         * @param {String} name 対象の関数の名前．
         * @return {Boolean} 対象の関数が手続きである場合true．
         */
        isProcedure: function (name) { return this.defined_pros["@" + name]; },
        /**
         * 対象の関数の情報を返します.
         * @param {String} name 対象の関数の名前．
         * @return {Object} 関数の情報を含むオブジェクト．
         */
        getFuncInfo: function (name) { return this.defined_funcs["@" + name]; },
        /**
         * 変数名，関数名を記録するオブジェクトを返します．
         * @return {Object} 変数名，関数名を記録するオブジェクト.
         */
        dynamic_fields: function () {
            let apis = [];
            for (let i in DNCL.Nodes.defined_funcs) apis[i] = true;
            return {
                /**
                 * 登録された名前を記録する.
                 */
                defined_names: apis,
                /**
                 * 名称を登録します.
                 * @param {String} name 対象の変数名または関数名.
                 */
                define: function (name) { this.defined_names["@" + name] = true; },
                /**
                 * 対象の変数または関数が定義されているかを判定します.
                 * @param {String} name 対象の変数名または関数名.
                 * @return {Boolean} 定義されている場合true.
                 */
                isDefined: function (name) { return this.defined_names["@" + name]; }
            };
        }
    },
    /**
     * ASTを構築するパーサ．
     */
    Parser: {
        /**
         * Parserオブジェクトを初期化します.
         * @constructor
         * @param {Object} tokens トークン列.
         */
        init: function (tokens) {
            this.inner_function = false;
            this.tokens = tokens;
            this.pos = 0;
            this._array_begins_from_ = DNCL.Setting.array_begins_from ? DNCL.Setting.array_begins_from : 0;
            this._output_func_ = DNCL.Setting.output_func ? DNCL.Setting.output_func : 'alert';
            this._errorMarker_ = DNCL.Setting.errorMarker ? DNCL.Setting.errorMarker : '★';
            this.indent_level = 0;
            this.current_line = 1;
        },
        /**
         * 1トークン読み進め，読み進めたトークンを返します.
         * @return {Object} 読み進めたトークン.
         */
        read: function () { return this.tokens[this.pos++]; },
        /**
         * 現在見ているトークンを返します
         * @return {Object} 現在見ているトークン.
         */
        peek: function () { return this.tokens[this.pos]; },
        /**
         * 改行トークンを読み進めます.
         */
        skipEmpty: function () { let c = []; while (this.peek().type == "NEW_LINE") { c.push(this.read()); } return c; },
        /**
         * トークンの種類tが<値>であるかを判定します.
         * @param {String} t トークンの種類．
         * @return {Boolean} トークンの種類が<値>である場合true.
         */
        isValue: function (t) { return t == "KAIGYOU" || t == "ARR_B" || t == "MINUS" || t == "VARIABLE" || t == "STRING" || t == "NUMBER" || t == "BRA_B" || t == "BLO_B" || t == "TRUE" || t == "FALSE" || t == "UNDEFINED" || t == "NAN"; },
        /**
         * エラーレポートを構築します.
         * @param {Object} p エラーの発生したトークン.
         * @return {String} マーカでエラー箇所を明示したエラーメッセージ.
         */
        createView: function (p) {
            let lines = DNCL.Lexer.code.split('\n');
            let pre = lines[p.row - 2] ? (lines[p.row - 2] + "\n") : "";
            let cur = lines[p.row - 1];
            let nex = lines[p.row] ? ("\n" + lines[p.row]) : "";
            return pre + cur.slice(0, p.col - 1) + this._errorMarker_ + cur.slice(p.col - 1) + nex;
        },
        /**
         * トークンとエラーメッセージからエラー情報を含むオブジェクトを構築します.
         * @param {Object} p エラーの発生したトークン.
         * @param {String} msg エラーメッセージ.
         * @return {Object} エラーメッセージ，エラーの位置を含むオブジェクト.
         */
        report: function (p, msg) { return { errorView: this.createView(p), lineNumber: p.row, charAt: p.col, message: p.row + "行目," + p.col + "文字目：" + msg.replace(/\n/g, "'改行'") }; }
    }
}

/**
 * 数字を読み進めます.
 * @return {String} 数字を連結した文字列.
 */
DNCL.Lexer.readNum = function () {
    let buff = [this.alph_num_formats[this.read()]];
    let dots = 0;
    while (this.hasNext()) {
        let p = this.peek();
        if (this.isNum(p)) {
            buff.push(this.alph_num_formats[this.read()]);
        } else if (!dots && p == "." || p == "．") {
            buff.push(this.alph_num_formats[this.read()]);
            dots++;
        } else {
            break;
        }
    }
    return buff.join('');
}

/**
 * アルファベットを読み進めます.
 * @return {String} アルファベットを連結した文字列.
 */
DNCL.Lexer.readAlphabet = function () {
    let ro = this.row, co = this.col;
    let buff = [this.alph_num_formats[this.read()]];
    while (this.hasNext()) {
        let p = this.peek();
        if (this.isAlphabet(p) || this.isNum(p) || p == '_' || p == '＿') {
            buff.push(this.alph_num_formats[this.read()]);
        } else {
            break;
        }
    }
    buff = buff.join('');
    let kw = this.getKeywod(buff);
    return { row: ro, col: co, type: kw ? kw : 'VARIABLE', expression: buff }
}

/**
 * 日本語を読み進めます.
 * @return {Object} 日本語文字を連結した文字列.
 */
DNCL.Lexer.readJapanese = function () {
    let p = this.peek();
    let las = this.tokens[this.tokens.length - 1];
    if (las) {
        if (p == "を") {
            return { row: this.row, col: this.col, type: 'WO', expression: this.read() };
        } else if (p == "と") {
            var t = las.type;
            if (t == "NUMBER" || t == "STR_E" || t == "VARIABLE" || t == "BRA_E" || t == "BLO_E" || t == "ARR_E") {
                return { row: this.row, col: this.col, type: 'TO', expression: this.read() };
            }
        } else if (p == "は") {
            var t = las.type;
            if (t == "BRA_E") {
                return { row: this.row, col: this.col, type: 'HA', expression: this.read() };
            }
        }
    }
    let ro = this.row, co = this.col;
    let buff = this.formatJapanese(this.read());
    while (this.hasNext()) {
        let p = this.peek();
        if (this.isJapanese(p) || p == "_" || p == '＿') {
            buff += this.formatJapanese(this.read());
            if (this.isKeywod(buff)) {
                return { row: ro, col: co, type: this.getKeywod(buff), expression: buff };
            }
        } else {
            break;
        }
    }
    if (this.isKeywod(buff)) {
        return { row: ro, col: co, type: this.getKeywod(buff), expression: buff };
    }
    this.define(buff);
    return { row: ro, col: co, type: 'VARIABLE', expression: buff };
}

/**
 * 文字列を読み進めます.
 * @param {String} enclosure 文字列のエンクロージャ.
 * @return {Object} 文字列のトークン.
 */
DNCL.Lexer.readString = function (enclosure) {
    let buff = [];
    let end = this.getEnclosure(enclosure);
    while (this.hasNext()) {
        let p = this.peek();
        if (p == end) {
            this.read();
            break;
        } else if (p == '\\') {
            let meta = this.read() + this.peek();
            if (this.isMetaString(meta)) {
                this.read();
                buff.push(this.metaString[meta]);
            } else {
                buff.push(this.read());
                return { type: 'OTHOR', expression: buff.join('') };
            }
        } else if (p == '\n') {
            buff.push(this.read());
            return { type: 'OTHOR', expression: buff.join('') };
        } else {
            buff.push(this.read());
        }
    }
    return { type: 'STRING', expression: buff.join('') };
}

/**
 * インラインコメントを読み進めます.
 * @param {String} enclosure インラインコメントのエンクロージャ.
 * @return {Object} インラインコメントのトークン.
 */
DNCL.Lexer.readInlineComment = function (enclosure) {
    let buff = [];
    let end = this.getEnclosure(enclosure);
    while (this.hasNext()) {
        let p = this.peek();
        if (p == end) {
            this.read();
            break;
        } else {
            buff.push(this.read());
        }
    }
    return { type: 'I_COMMENT', expression: buff.join('') };
}

/**
 * ブロックコメントを読み進めます.
 * @param {String} enclosure ブロックコメントのエンクロージャ.
 * @return {Object} ブロックコメントのトークン.
 */
DNCL.Lexer.readBlockComment = function (enclosure) {
    let buff = [];
    let end = this.getEnclosure(enclosure);
    let last;
    while (this.hasNext()) {
        let r = this.read();
        let e = last + r;
        if (end == e) {
            buff.pop();
            return { type: 'B_COMMENT', expression: buff.join('') };
        }
        buff.push(r);
        last = r;
    }
    return { type: 'OTHOR', expression: buff.join('') };
}

/**
 * 記号を読み進めます.
 * @return {Object} トークン.
 */
DNCL.Lexer.readSymbol = function () {
    let ro = this.row, co = this.col;
    let s1 = this.read(), s2 = this.peek();
    let op_join = s1 + s2;
    if (this.isSymbol(op_join)) {
        this.read();
        let t = this.symbols[op_join];
        switch (t) {
            case "B_COMMENT_B":
                let bc = this.readBlockComment(op_join);
                return { row: ro, col: co, type: bc.type, expression: bc.expression };
            case "I_COMMENT_B":
                let ic = this.readInlineComment(op_join);
                return { row: ro, col: co, type: ic.type, expression: ic.expression };
            default: return { row: ro, col: co, type: t, expression: op_join };
        }
    } else if (this.symbols[s1] == "STR_B") {
        let str = this.readString(s1);
        return { row: ro, col: co, type: str.type, expression: str.expression };
    }
    return { row: ro, col: co, type: this.symbols[s1], expression: s1 };
}

/**
 * 字句解析を実行しトークン列を返します.
 * @return {Array<Object>} トークンの配列.
 */
DNCL.Lexer.tokenize = function () {
    while (this.hasNext()) {
        this.skipEmpty();
        let p = this.peek();
        if (this.isNum(p)) {
            this.tokens.push({ row: this.row, col: this.col, type: 'NUMBER', expression: this.readNum() });
        } else if (this.isJapanese(p)) {
            this.tokens.push(this.readJapanese());
        } else if (this.isAlphabet(p)) {
            this.tokens.push(this.readAlphabet());
        } else if (this.isSymbol(p)) {
            this.tokens.push(this.readSymbol());
        } else {
            this.tokens.push({ row: this.row, col: this.col, type: 'OTHOR', expression: this.read() });
        }
    }
    this.tokens.push({ row: this.row, col: this.col, type: 'EOF', expression: "EOF" });
    if (!this._includes_comment_) {
        let buff = [];
        for (let t of this.tokens) {
            if (t.type != "I_COMMENT" && t.type != "B_COMMENT") {
                buff.push(t);
            }
        }
        return buff;
    }
    return this.tokens;
}

/**
 * インラインコメントを解析します.
 * @return {Object} ASTノード.
 */
DNCL.Parser.i_comment = function () {
    let c = this.read();
    return DNCL.Nodes.i_comment(c);
}

/**
 * ブロックコメントを解析します.
 * @return {Object} ASTノード.
 */
DNCL.Parser.b_comment = function () {
    let c = this.read();
    let tab = DNCL.Nodes.getTab(this.indent_level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(this.indent_level);
    let split_cmt = c.expression.split('\n');
    let cmt = [], dncl_cmt = [];
    if (split_cmt.length == 1) {
        cmt.push(c.expression);
        dncl_cmt.push(c.expression);
    } else {
        for (let i in split_cmt) {
            if (i > 0) {
                cmt.push('\n' + tab);
                dncl_cmt.push('\n' + dncl_tab);
            }
            let sc = split_cmt[i], j = 0, c_part = split_cmt[i];
            while (sc[j] && sc[j] == ' ' || sc[j] == '　' || sc[j] == '\t') j++;
            if (sc[j] == '*') {
                j++;
                while (sc[j] && sc[j] == ' ' || sc[j] == '　' || sc[j] == '\t') j++;
            }
            c_part = sc.slice(j);
            cmt.push(' *' + (i == split_cmt.length - 1 ? "" : " ") + c_part);
            dncl_cmt.push(' *' + (i == split_cmt.length - 1 ? "" : " ") + c_part);
        }
    }
    return DNCL.Nodes.b_comment(cmt, dncl_cmt);
}

/**
 * <処理>を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.process = function (sender) {
    let _process = [];
    let _process_f = [];
    let i = 0;
    while (true) {
        this.skipEmpty();
        let p = this.peek();
        let pre_pos = this.pos;
        if (p.type == "I_COMMENT") {
            _process.push(this.i_comment());
        } else if (p.type == "B_COMMENT") {
            _process.push(this.b_comment());
        } else if (p.type == "MOSI") {
            _process.push(this.mosi());
        } else if (p.type == "KURIKAESI") {
            _process.push(this.atojyouken_kurikaesi());
        } else if ((p.type == "TETUDUKI" || p.type == "KANSU") && !this.inner_function && this.indent_level == 0) {
            _process.push(this.func_def());
            _process_f.push(i);
        } else if (p.type == "KAIGYOU") {
            this.read();
            p = this.peek();
            if (p.type == "WO") {
                this.read();
                p = this.peek();
                if (p.type == "HYOUJISURU") {
                    this.read();
                    _process.push(this.hyoujisuru(DNCL.Nodes.kaigyou(), "NL"));
                    if (sender == "MONO_IF") break;
                    i++;
                    continue;
                }
            }
            throw this.report(p, "'" + p.expression + "'は無効です．");
        } else if (p.type == "WO") {
            this.read();
            p = this.peek();
            if (p.type == "JIKKOUSURU" || p.type == "JIKKOUSI" || p.type == "KURIKAESU" || p.type == "COMMA") {
                break;
            }
        } else if (p.type == "EOF") {
            break;
        } else if (this.isValue(p.type)) {
            if (p.type == "VARIABLE") {
                this.read();
                let _p_ = this.peek();
                if (_p_.type == "BRA_B") {
                    let f_call = this.func_call(p, false);
                    let __p_ = this.peek();
                    if (__p_.type == "NEW_LINE" || __p_.type == "EOF" || __p_.type == "I_COMMENT" || __p_.type == "B_COMMENT") {
                        _process.push(f_call);
                        if (sender == "MONO_IF") break;
                        i++;
                        continue;
                    }
                }
                this.pos = pre_pos;
            }
            let val = this.value(0);
            let p_ = this.peek();
            switch (p_.type) {
                case "NOYOUSO":
                    _process.push(this.x_for(val));
                    break;
                case "WO":
                    _process.push(this.wo(val, pre_pos));
                    break;
                case "L_ARROW":
                    _process.push(this.dainyu(pre_pos));
                    break;
                case "NOAIDA":
                    _process.push(this.maejyouken_kurikaesi(val));
                    break;
                default: throw this.report(p, "'" + val.dncl_expr() + p_.expression + "'は無効です．");
            }
        } else {
            throw this.report(p, "'" + p.expression + "'は無効です．");
        }
        if (sender == "MONO_IF") break;
        i++;
    }
    return DNCL.Nodes.process(_process, _process_f, sender, this.indent_level);
}

/**
 * 拡張繰り返し文を解析します．
 * @return {Object} ASTノード.
 */
DNCL.Parser.x_for = function (val) {
    let noyouso = this.read();
    let p = this.peek();
    if (p.type != "VARIABLE") throw this.report(p, "拡張繰り返し文のカウンタ変数がありません．");
    let cnt_variable = this.read();
    p = this.peek();
    if (p.type != "NITUITE") throw this.report(p, "拡張繰り返し文のキーワード'について'がありません．");
    this.read();
    p = this.peek();
    if (p.type != "COMMA") throw this.report(p, "拡張繰り返し文のキーワード'，'がありません．");
    this.read();
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    p = this.peek();
    if (p.type != "KURIKAESU") throw this.report(p, "拡張繰り返し文のキーワード'繰り返す'がありません．");
    this.read();
    return DNCL.Nodes.x_for(cnt_variable, val, proc, noyouso, this.indent_level);
}

/**
 * 関数定義または手続き定義を解析します.
 * @return {Object} ASTノード.
 */
DNCL.Parser.func_def = function () {
    let is_f = this.read().type == "KANSU";
    let variable = this.peek();
    if (variable.type != "VARIABLE") throw this.report(variable, (is_f ? "関数" : "手続き") + "名がありません．");
    this.read();
    let p = this.peek();
    if (p.type != "BRA_B") throw this.report(p, (is_f ? "関数" : "手続き") + "定義のキーワード'('がありません．");
    this.read();
    p = this.peek();
    let params_ = [];
    if (p.type == "BRA_E") {
        this.read();
    } else {
        let flag = true;
        while (flag) {
            p = this.peek();
            if (p.type != "VARIABLE") throw this.report(p, "パラメータがありません．");
            if (params_.includes(p.expression)) throw this.report(p, "パラメータ'" + p.expression + "'が重複しています．");
            params_.push(p.expression);
            this.read();
            p = this.peek();
            switch (p.type) {
                case "BRA_E":
                    this.read();
                    flag = false;
                    break;
                case "COMMA": this.read(); continue;
                default: throw this.report(p, "'" + p.expression + "'は無効です");
            }
        }
    }
    p = this.peek();
    if (p.type != "HA") throw this.report(p, (is_f ? "関数" : "手続き") + "定義のキーワード'は'がありません．");
    this.read();
    this.inner_function = is_f ? "f" : "p";
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    this.inner_function = false;
    p = this.peek();
    if (p.type != "JIKKOUSURU") throw this.report(p, (is_f ? "関数" : "手続き") + "定義のキーワード'実行する'がありません．");
    this.read();
    DNCL.Nodes.registerFuncInfo(variable.expression, { params: params_, paramCount: params_.length }, !is_f);
    return DNCL.Nodes.func_def(variable, params_, proc, is_f);
}

/**
 * 後条件繰り返し文を解析します.
 * @return {Object} ASTノード.
 */
DNCL.Parser.atojyouken_kurikaesi = function () {
    this.read();
    let p = this.peek();
    if (p.type != "COMMA") throw this.report(p, "後条件繰り返し文のキーワード'，'がありません．");
    this.read();
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    p = this.peek();
    if (p.type != "COMMA") throw this.report(p, "後条件繰り返し文のキーワード'，'がありません．");
    this.read();
    let bool = this.value(0);
    p = this.peek();
    if (p.type != "NINARUMADE") throw this.report(p, "後条件繰り返し文のキーワード'になるまで'がありません．");
    this.read();
    p = this.peek();
    if (p.type != "JIKKOUSURU") throw this.report(p, "後条件繰り返し文のキーワード'実行する'がありません．");
    let r = this.read();
    return DNCL.Nodes.atojyouken_kurikaesi(bool, proc, this.indent_level, r);
}

/**
 * 前条件繰り返し文を解析します.
 * @param {Object} bool 条件式のASTノード.
 * @return {Object} AST ノード.
 */
DNCL.Parser.maejyouken_kurikaesi = function (bool) {
    let r = this.read();
    let p = this.peek();
    if (p.type != "COMMA") throw this.report(p, "前条件繰り返し文のキーワード'，'がありません．");
    this.read();
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    p = this.peek();
    if (p.type != "KURIKAESU") throw this.report(p, "順次繰り返し文のキーワード'繰り返す'がありません．");
    this.read();
    return DNCL.Nodes.maejyouken_kurikaesi(bool, proc, this.indent_level, r);
}

/**
 * 条件分岐文を解析します．
 * @return {Object} ASTノード．
 */
DNCL.Parser.mosi = function () {
    let r = this.read();
    let bool = this.value(0);
    let p = this.peek();
    if (p.type != "NARABA") throw this.report(p, "条件分岐文のキーワード'ならば'がありません．");
    this.read();
    p = this.peek();
    if (p.type != "NEW_LINE" && p.type != "I_COMMENT" && p.type != "B_COMMENT") {
        this.indent_level++;
        let proc = this.process("MONO_IF");
        this.indent_level--;
        return DNCL.Nodes.if_mono_proc(bool, proc, this.indent_level, r);
    }
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    p = this.peek();
    let proc_queue = [];
    switch (p.type) {
        case "JIKKOUSURU":
            this.read();
            return DNCL.Nodes.if_stmt(bool, proc, this.indent_level);
        case "JIKKOUSI":
            proc_queue.push(DNCL.Nodes.if_stmt_(bool, proc, this.indent_level, r));
            this.read();
            p = this.peek();
            if (p.type != "COMMA") throw this.report(p, "条件分岐文のキーワード'，'がありません．");
            this.read();
            break;
        default: throw this.report(p, "条件分岐文のキーワード'実行する'または'実行し'がありません．");
    }
    while (true) {
        p = this.peek();
        switch (p.type) {
            case "SOUDENAKU":
                this.read();
                p = this.peek();
                if (p.type != "MOSI") throw this.report(p, "条件分岐文のキーワード'もし'がありません．");
                r = this.read();
                let s_bool = this.value(0);
                p = this.peek();
                if (p.type != "NARABA") throw this.report(p, "条件分岐文のキーワード'ならば'がありません．");
                this.read();
                this.indent_level++;
                let s_proc = this.process(0);
                this.indent_level--;
                p = this.peek();
                if (p.type == "JIKKOUSURU") {
                    proc_queue.push(DNCL.Nodes.elseif_stmt(s_bool, s_proc, this.indent_level, r));
                    this.read();
                    return DNCL.Nodes.mosi(proc_queue);
                } else if (p.type == "JIKKOUSI") {
                    proc_queue.push(DNCL.Nodes.elseif_stmt_(s_bool, s_proc, this.indent_level, r));
                    this.read();
                    p = this.peek();
                    if (p.type != "COMMA") throw this.report(p, "条件分岐文のキーワード'，'がありません．");
                    this.read();
                    continue;
                } else {
                    throw this.report(p, "条件分岐文のキーワード'実行する'または'実行し'がありません．");
                }
            case "SOUDENAKEREBA":
                this.read();
                this.indent_level++;
                let e_proc = this.process(0);
                this.indent_level--;
                proc_queue.push(DNCL.Nodes.else_stmt(e_proc, this.indent_level));
                p = this.peek();
                if (p.type != "JIKKOUSURU") throw this.report(p, "条件分岐文のキーワード'実行する'がありません．");
                this.read();
                return DNCL.Nodes.mosi(proc_queue);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}


/**
 * 代入文を解析します.
 * @param {Number} pre_pos バックトラックするポジション.
 * @return {Object} ASTノード.
 */
DNCL.Parser.dainyu = function (pre_pos) {
    this.pos = pre_pos;
    let p = this.peek();
    let vars = [];
    let commas = 0;
    while (true) {
        if (p.type == "VARIABLE") {
            let variable = this.read();
            p = this.peek();
            if (p.type == "ARR_B") {
                let arr = this.array_ref(variable, "DAINYU");
                this.read();
                let val = this.value(0);
                vars.push(DNCL.Nodes.dainyu_array(variable, arr, val));
            } else {
                this.read();
                let val = this.value(0);
                vars.push(DNCL.Nodes.dainyu_variable(variable, val));
            }
            let e = this.skipEmpty();
            p = this.peek();
            if (p.type == "COMMA") {
                commas++;
                this.read();
                this.skipEmpty();
                p = this.peek();
                continue;
            } else {
                let cmt;
                if (p.type == "I_COMMENT") {
                    cmt = this.i_comment();
                }
                return DNCL.Nodes.dainyu(vars, this.indent_level, cmt, e.length != 0, commas > 0);
            }
        } else {
            throw this.report(p, "代入文中の'" + p.expression + "'は無効です．");
        }
    }
}


/**
 * 表示文を解析します.
 * @param {Object} val 値のASTノード.
 * @return {Object} ASTノード.
 */
DNCL.Parser.hyoujisuru = function (val, newLine) {
    let outf = this._output_func_;
    return DNCL.Nodes.hyoujisuru(outf, val, newLine);
}

/**
 * 順次繰り返し文を解析します.
 * @param {Number} pre_pos バックトラックするポジション.
 * @return {Object} ASTノード.
 */
DNCL.Parser.jyunji_kurikaesi = function (pre_pos) {
    this.pos = pre_pos;
    let p = this.peek();
    if (p.type != "VARIABLE") throw this.report(p, "順次繰り返し文のカウンタ変数がありません．");
    let cnt_variable = this.read();
    p = this.peek();
    if (p.type != "WO") throw this.report(p, "順次繰り返し文のキーワード'を'がありません．");
    this.read();
    let kara = this.peek();
    let from = this.value(0);
    p = this.peek();
    if (p.type != "KARA") throw this.report(p, "順次繰り返し文のキーワード'から'がありません．");
    this.read();
    let made = this.peek();
    let to = this.value(0);
    p = this.peek();
    if (p.type != "MADE") throw this.report(p, "順次繰り返し文のキーワード'まで'がありません．");
    this.read();
    let zutu = this.peek();
    let delta = this.value(0);
    p = this.peek();
    if (p.type != "ZUTU") throw this.report(p, "順次繰り返し文のキーワード'ずつ'がありません．");
    this.read();
    let inc_dec = this.peek();
    switch (inc_dec.type) {
        case "HERASINAGARA":
        case "HUYASINAGARA":
            this.read(); break;
        default: throw this.report(inc_dec, "'" + inc_dec.expression + "'は無効です．");
    }
    p = this.peek();
    if (p.type != "COMMA") throw this.report(p, "順次繰り返し文のキーワード'，'がありません．");
    this.read();
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    p = this.peek();
    if (p.type != "KURIKAESU") throw this.report(p, "順次繰り返し文のキーワード'繰り返す'がありません．");
    this.read();
    if (inc_dec.type == "HUYASINAGARA") {
        return DNCL.Nodes.for_inc(cnt_variable, from, to, delta, proc, this.indent_level, kara, made, zutu);
    } else {
        return DNCL.Nodes.for_dec(cnt_variable, from, to, delta, proc, this.indent_level, kara, made, zutu);
    }
}


/**
 * 変数操作文を解析します.
 * @param {Number} pre_pos バックトラックするポジション.
 * @return {Object} ASTノード.
 */
DNCL.Parser.huyasu_herasu = function (pre_pos) {
    this.pos = pre_pos;
    let p = this.peek();
    if (p.type != "VARIABLE") throw this.report(p, "変数操作文に変数名がありません．");
    let variable = this.read();
    p = this.peek();
    if (p.type == "WO") {
        this.read();
        let d = this.peek();
        let delta = this.value(0);
        let inc_dec = this.peek();
        switch (inc_dec.type) {
            case "HUYASU": this.read();
                return DNCL.Nodes.inc_var(variable, delta, d);
            case "HERASU": this.read();
                return DNCL.Nodes.dec_var(variable, delta, d);
            default: throw this.report(inc_dec, "変数操作文のキーワード'増やす'または'減らす'がありません．");
        }
    } else if (p.type == "ARR_B") {
        let arr = this.array_ref(variable, "INC_DEC");
        p = this.peek();
        if (p.type == "WO") {
            this.read();
            let d = this.peek();
            let delta = this.value(0);
            let inc_dec = this.peek();
            switch (inc_dec.type) {
                case "HUYASU": this.read();
                    return DNCL.Nodes.inc_arr(variable, arr, delta, d);
                case "HERASU": this.read();
                    return DNCL.Nodes.dec_arr(variable, arr, delta, d);
                default: throw this.report(inc_dec, "変数操作文のキーワード'増やす'または'減らす'がありません．");
            }
        } else {
            throw this.report(p, "変数操作文のキーワード'を'がありません．");
        }
    } else {
        throw this.report(p, "'" + p.expression + "'は無効です．");
    }
}


/**
 * "...を..."に続く部分を解析します.
 * @param {Object} val 値のASTノード.
 * @param {Number} pre_pos バックトラックするポジション.
 * @return {Object} ASTノード.
 */
DNCL.Parser.wo = function (val, pre_pos) {
    this.read();
    let p = this.peek();
    switch (p.type) {
        case "HYOUJISURU":
            this.read();
            return this.hyoujisuru(val, "NL");
        case "KAESU":
            if (this.inner_function != "f") throw this.report(p, "関数の外に'返す'を記述することはできません．");
            this.read();
            return DNCL.Nodes.return_stmt(val);
        case "KAIGYOU":
            this.read();
            let _p_ = this.peek();
            switch (_p_.type) {
                case "SITE":
                case "NASIDE":
                    let newL = this.read().type == "SITE";
                    let _p__ = this.peek();
                    if (_p__.type == "HYOUJISURU") {
                        this.read();
                        return this.hyoujisuru(val, newL);
                    } else {
                        throw this.report(_p__, "'" + _p__.expression + "'は無効です．");
                    }
                default: throw this.report(_p_, "'" + _p_.expression + "'は無効です．");
            }
        default: break;
    }
    this.value(0);
    p = this.peek();
    switch (p.type) {
        case "KARA":
            return this.jyunji_kurikaesi(pre_pos);
        case "HUYASU":
        case "HERASU":
            return this.huyasu_herasu(pre_pos);
        default: throw this.report(p, "'" + p.expression + "'は無効です．");
    }
}

/**
 * 値のASTノードを返します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.value = function (sender) {
    return this.boolean(sender);
}

/**
 * 論理式を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.boolean = function (sender) {
    let node = this.compare(sender);
    while (true) {
        let type = this.peek().type;
        switch (type) {
            case "MATAHA":
            case "KATU":
                let r = this.read();
                node = DNCL.Nodes.Operation[type](node, this.compare(sender), r);
                continue;
            default: return node;
        }
    }
}

/**
 * 比較演算を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.compare = function (sender) {
    let node = this.expr();
    while (true) {
        let type = this.peek().type;
        switch (type) {
            case "EQUAL":
            case "NOT_EQUAL":
            case "L_THAN_EQUAL":
            case "G_THAN_EQUAL":
            case "L_THAN":
            case "G_THAN":
                let r = this.read();
                node = DNCL.Nodes.Operation[type](node, this.expr(sender), r);
                continue;
            case "DENAI":
                let r_ = this.read();
                node = DNCL.Nodes.Operation[type](node, r_);
                continue;
            default: return node;
        }
    }
}

/**
 * 加法，減法，文字列演算を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.expr = function (sender) {
    let node = this.term(sender);
    while (true) {
        let type = this.peek().type;
        switch (type) {
            case "TO":
            case "PLUS":
            case "MINUS":
                let r = this.read();
                node = DNCL.Nodes.Operation[type](node, this.term(sender), r);
                continue;
            default: return node;
        }
    }
}

/**
 * 乗法，除法，剰余演算を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.term = function (sender) {
    let node = this.fact(sender);
    while (true) {
        let type = this.peek().type;
        switch (type) {
            case "MUL":
            case "DIV":
            case "DIV_FLOOR":
            case "MOD":
                let r = this.read();
                node = DNCL.Nodes.Operation[type](node, this.fact(sender), r);
                continue;
            default: return node;
        }
    }
}

/**
 * 数値，変数，文字列，配列，関数を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.fact = function (sender) {
    let p = this.peek();
    if (p.type == "BRA_B") {
        this.read();
        let node = this.value(sender);
        let _p_ = this.peek();
        if (_p_.type == "BRA_E") {
            this.read();
            return DNCL.Nodes.bracket_fact(node);
        } else {
            throw this.report(p, p.row + "行目," + p.col + "文字目の'('に対する')'が見つかりません．");
        }
    } else if (p.type == "MINUS") {
        let r = this.read();
        return DNCL.Nodes.Operation["MINUS_FACT"](this.fact(sender), r);
    } else if (p.type == "NUMBER") {
        this.read();
        return DNCL.Nodes.number(p);
    } else if (p.type == "TRUE") {
        this.read();
        return DNCL.Nodes.true_value(p);
    } else if (p.type == "FALSE") {
        this.read();
        return DNCL.Nodes.false_value(p);
    } else if (p.type == "UNDEFINED") {
        this.read();
        return DNCL.Nodes.undefined_value(p);
    } else if (p.type == "NAN") {
        this.read();
        return DNCL.Nodes.nan_value(p);
    } else if (p.type == "VARIABLE") {
        this.read();
        let _p_ = this.peek();
        if (_p_.type == "BRA_B") return this.func_call(p, true);
        if (DNCL.Nodes.getFuncInfo(p.expression)) throw this.report(p, "値式中の'" + p.expression + "'は関数名です．");
        if (!(/^[a-zA-Z][a-zA-Z_0-9]*/.test(p.expression))) throw this.report(p, "'" + p.expression + "'は正しい変数名ではありません．");
        if (_p_.type == "ARR_B") {
            return this.array_getVal(p, "INNER_FOMULA");
        } else {
            return DNCL.Nodes.variable(p);
        }
    } else if (p.type == "STRING") {
        this.read();
        return DNCL.Nodes.string(p);
    } else if (p.type == "ARR_B") {
        return this.array_init(sender);
    } else if (p.type == "BLO_B") {
        return this.array_value(sender);
    } else {
        throw this.report(p, "式中の'" + p.expression + "'は無効です．");
    }
}

/**
 * 配列初期化を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} AST node.
 */
DNCL.Parser.array_init = function (sender) {
    let r = this.read();
    let lengths = [];
    while (true) {
        lengths.push(this.value(sender));
        let p = this.peek();
        switch (p.type) {
            case "COMMA":
                this.read();
                continue;
            case "ARR_E":
                this.read();
                return DNCL.Nodes.array_init(lengths, r);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}

/**
 * 関数呼び出しまたは手続き呼び出しを解析します.
 * @param {Object} f_name 関数名または手続き名を表すトークン.
 * @param {Boolean} inner_call 数式中で呼ばれたかどうかを示す値.
 * @return {Object} ASTノード.
 */
DNCL.Parser.func_call = function (f_name, inner_call) {
    this.read();
    let p = this.peek();
    let params = [];
    if (p.type == "BRA_E") {
        this.read();
        return DNCL.Nodes.func_call(f_name, params, inner_call);
    }
    while (true) {
        params.push(this.value(0));
        p = this.peek();
        switch (p.type) {
            case "COMMA": this.read(); continue;
            case "BRA_E":
                this.read();
                return DNCL.Nodes.func_call(f_name, params, inner_call);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}

/**
 * 配列値を解析します.
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.array_value = function (sender) {
    this.read();
    this.skipEmpty();
    let p = this.peek();
    let values = [];
    if (p.type == "BLO_E") {
        this.read();
        return DNCL.Nodes.array_value(values);
    }
    while (true) {
        values.push(this.value(sender));
        this.skipEmpty();
        p = this.peek();
        switch (p.type) {
            case "COMMA":
                this.read();
                this.skipEmpty();
                continue;
            case "BLO_E":
                this.read();
                return DNCL.Nodes.array_value(values);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}

/**
 * 代入文，変数操作文の配列参照を解析します.
 * @param {Object} vari 変数名のトークン. 
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.array_ref = function (vari, sender) {
    this.read();
    let indices = [];
    while (true) {
        indices.push(this.value(0));
        let p = this.peek();
        switch (p.type) {
            case "COMMA": this.read(); continue;
            case "ARR_E":
                this.read();
                let arr_from = this._array_begins_from_;
                return DNCL.Nodes.array_ref(vari, indices, arr_from, sender);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}

/**
 * 式中の配列参照を解析します.
 * @param {Object} vari 変数名のトークン. 
 * @param {String} sender 呼び出し元の名前.
 * @return {Object} ASTノード.
 */
DNCL.Parser.array_getVal = function (vari, sender) {
    this.read();
    let indices = [];
    while (true) {
        indices.push(this.value(0));
        let p = this.peek();
        switch (p.type) {
            case "COMMA": this.read(); continue;
            case "ARR_E":
                this.read();
                let arr_from = this._array_begins_from_;
                return DNCL.Nodes.array_getVal(vari, indices, arr_from, sender);
            default: throw this.report(p, "'" + p.expression + "'は無効です．");
        }
    }
}

/**
 * 各種演算の定義
 */
DNCL.Nodes.Operation = {
    "MATAHA": function (left, right, t) {
        return {
            js_expr: function (fields) {
                let lf = "_valck(" + left.js_expr(fields) + ",'boolean'," + t.row + "," + t.col + ",'論理和演算の左辺が論理値ではありません．')";
                let rt = "_valck(" + right.js_expr(fields) + ",'boolean'," + t.row + "," + t.col + ",'論理和演算の右辺が論理値ではありません．')";
                return "(" + lf + "||" + rt + ")";
            },
            dncl_expr: function () { return left.dncl_expr() + " または " + right.dncl_expr(); }
        };
    },
    "KATU": function (left, right, t) {
        return {
            js_expr: function (fields) {
                let lf = "_valck(" + left.js_expr(fields) + ",'boolean'," + t.row + "," + t.col + ",'論理積演算の左辺が論理値ではありません．')";
                let rt = "_valck(" + right.js_expr(fields) + ",'boolean'," + t.row + "," + t.col + ",'論理積演算の右辺が論理値ではありません．')";
                return "(" + lf + "&&" + rt + ")";
            },
            dncl_expr: function () { return left.dncl_expr() + " かつ " + right.dncl_expr(); }
        };
    },
    "EQUAL": function (left, right, t) {
        return {
            js_expr: function (fields) { return "((" + left.js_expr(fields) + ")===(" + right.js_expr(fields) + "))"; },
            dncl_expr: function () { return left.dncl_expr() + " ＝ " + right.dncl_expr(); }
        };
    },
    "NOT_EQUAL": function (left, right, t) {
        return {
            js_expr: function (fields) { return "((" + left.js_expr(fields) + ")!==(" + right.js_expr(fields) + "))"; },
            dncl_expr: function () { return left.dncl_expr() + " ≠ " + right.dncl_expr(); }
        };
    },
    "L_THAN_EQUAL": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_lthan_eq(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ≦ " + right.dncl_expr(); }
        };
    },
    "G_THAN_EQUAL": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_gthan_eq(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ≧ " + right.dncl_expr(); }
        };
    },
    "L_THAN": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_lthan(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ＜ " + right.dncl_expr(); }
        };
    },
    "G_THAN": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_gthan(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ＞ " + right.dncl_expr(); }
        };
    },
    "DENAI": function (left, t) {
        return {
            js_expr: function (fields) { return "_denai(" + left.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " でない"; }
        };
    },
    "TO": function (left, right, t) {
        return {
            js_expr: function (fields) { return "''+" + left.js_expr(fields) + "+" + right.js_expr(fields); },
            dncl_expr: function () { return left.dncl_expr() + " と " + right.dncl_expr(); }
        };
    },
    "PLUS": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_add(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ＋ " + right.dncl_expr(); }
        };
    },
    "MINUS": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_sub(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " － " + right.dncl_expr(); }
        };
    },
    "MUL": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_mul(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " × " + right.dncl_expr(); }
        };
    },
    "DIV": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_div(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " / " + right.dncl_expr(); }
        };
    },
    "DIV_FLOOR": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_div_floor(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " ÷ " + right.dncl_expr(); }
        };
    },
    "MOD": function (left, right, t) {
        return {
            js_expr: function (fields) { return "_mod(" + left.js_expr(fields) + "," + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return left.dncl_expr() + " % " + right.dncl_expr(); }
        };
    },
    "MINUS_FACT": function (right, t) {
        return {
            js_expr: function (fields) { return "_minus(" + right.js_expr(fields) + "," + t.row + "," + t.col + ")"; },
            dncl_expr: function () { return "-" + right.dncl_expr(); }
        };
    }
}

/**
 * <処理>のASTノードを構築します.
 * @param {Array<Object>} _process 処理の配列.
 * @param {Array<Object>} _process_f 先に評価する処理の配列.
 * @param {String} sender 呼び出し元の名前.
 * @param {Number} level インデントレベル.
 * @returns <処理>のASTノード.
 */
DNCL.Nodes.process = function (_process, _process_f, sender, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let p in _process) {
                buff.push(tab + _process[p].js_expr(fields));
            }
            return buff.join('');
        },
        dncl_expr: function () {
            let buff = [];
            for (let p in _process) {
                buff.push((sender == "MONO_IF" ? "" : dncl_tab) + _process[p].dncl_expr());
            }
            return buff.join('');
        }
    };
}

/**
 * 関数定義のASTノードを構築します.
 * @param {Object} variable 関数名のトークン.
 * @param {Array<String>} params_ パラメータ.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Boolean} is_f 関数定義の場合true,手続きの場合falseを指定.
 * @returns 関数定義のASTノード.
 */
DNCL.Nodes.func_def = function (variable, params_, proc, is_f) {
    return {
        js_expr: function (fields) {
            fields.define(variable.expression);
            let new_fields = DNCL.Nodes.dynamic_fields();
            let buff = [];
            for (let i in params_) {
                buff.push("$" + params_[i]);
                new_fields.define(params_[i]);
            }
            let thr = "throw { line:" + variable.row + ", charAt:" + variable.col + ", message: " + variable.row + " + '行目,' + " + variable.col + " + \"文字目:関数'" + variable.expression + "'で無限再帰が検出されました．\"}";
            return "function $" + variable.expression + "(" + buff.join(',') + "){try{\n" + proc.js_expr(new_fields) + "}catch(_e){if(_e instanceof RangeError){" + thr + "}else{throw _e;}}}\n\n";
        },
        dncl_expr: function () {
            if (is_f) {
                return "関数 " + variable.expression + "(" + params_.join(',') + ")は\n" + proc.dncl_expr() + "を実行する\n\n";
            } else {
                return "手続き " + variable.expression + "(" + params_.join(',') + ")は\n" + proc.dncl_expr() + "を実行する\n\n";
            }
        }
    };
}

/**
 * 後条件繰り返し文のASTノードを構築します.
 * @param {Object} bool 条件式のASTノード.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 後条件繰り返し文のASTノード.
 */
DNCL.Nodes.atojyouken_kurikaesi = function (bool, proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "while(true){\n" + proc.js_expr(fields) + tab + "    if(" + bool.js_expr(fields) + ")break;\n" + tab + "}\n";
        },
        dncl_expr: function () {
            return "繰り返し,\n" + proc.dncl_expr() + dncl_tab + "を," + bool.dncl_expr() + " になるまで実行する\n";
        }
    };
}

/**
 * 前条件繰り返し文のASTノードを構築します.
 * @param {Object} bool 条件式のASTノード.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 前条件繰り返し文のASTノード.
 */
DNCL.Nodes.maejyouken_kurikaesi = function (bool, proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "while(" + bool.js_expr(fields) + "){\n" + proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return bool.dncl_expr() + " の間,\n" + proc.dncl_expr() + dncl_tab + "を繰り返す\n";
        }
    };
}

/**
 * 条件分岐文
 * 
 * もし<条件>ならば <処理>
 * 
 * のASTノードを構築します.
 * @param {Object} bool 条件式のASTノード.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.if_mono_proc = function (bool, proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    return {
        js_expr: function (fields) {
            return "if(" + bool.js_expr(fields) + "){\n" + proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return "もし " + bool.dncl_expr() + " ならば " + proc.dncl_expr();
        }
    };
}

/**
 * 条件分岐文
 * 
 * もし<条件>ならば 
 *      <処理>
 * を実行する
 * 
 * のASTノードを構築します.
 * @param {Object} bool 条件式のASTノード.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.if_stmt = function (bool, proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "if(" + bool.js_expr(fields) + "){\n" + proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return "もし " + bool.dncl_expr() + " ならば\n" + proc.dncl_expr() + dncl_tab + "を実行する\n";
        }
    };
}

/**
 * 条件分岐文
 * 
 * もし<条件>ならば 
 *      <処理>
 * を実行し,
 * 
 * のASTノードを構築します.
 * @param {Object} bool 条件式のASTノード.
 * @param {Array<Object>} proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.if_stmt_ = function (bool, proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "if(" + bool.js_expr(fields) + "){\n" + proc.js_expr(fields) + tab + "}";
        },
        dncl_expr: function () {
            return "もし " + bool.dncl_expr() + " ならば\n" + proc.dncl_expr() + dncl_tab + "を実行し, ";
        }
    };
}

/**
 * 条件分岐文
 * 
 * そうでなくもし<条件>ならば 
 *      <処理>
 * を実行する
 * 
 * のASTノードを構築します.
 * @param {Object} s_bool 条件式のASTノード.
 * @param {Array<Object>} s_proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.elseif_stmt = function (s_bool, s_proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "else if(" + s_bool.js_expr(fields) + "){\n" + s_proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return "そうでなくもし " + s_bool.dncl_expr() + " ならば\n" + s_proc.dncl_expr() + dncl_tab + "を実行する\n";
        }
    };
}

/**
 * 条件分岐文
 * 
 * そうでなくもし<条件>ならば 
 *      <処理>
 * を実行し,
 * 
 * のASTノードを構築します.
 * @param {Object} s_bool 条件式のASTノード.
 * @param {Array<Object>} s_proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.elseif_stmt_ = function (s_bool, s_proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "else if(" + s_bool.js_expr(fields) + "){\n" + s_proc.js_expr(fields) + tab + "}";
        },
        dncl_expr: function () {
            return "そうでなくもし " + s_bool.dncl_expr() + " ならば\n" + s_proc.dncl_expr() + dncl_tab + "を実行し, ";
        }
    };
}

/**
 * 条件分岐文
 * 
 * そうでなければ
 *      <処理>
 * を実行する
 * 
 * のASTノードを構築します.
 * @param {Array<Object>} e_proc 処理の配列.
 * @param {Number} level インデントレベル.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.else_stmt = function (e_proc, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            return "else{\n" + e_proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return "そうでなければ\n" + e_proc.dncl_expr() + dncl_tab + "を実行する\n";
        }
    };
}

/**
 * 条件分岐文のASTノードを構築します.
 * @param {Array<Object>} proc_queue ASTノードの配列.
 * @returns 条件分岐文のASTノード.
 */
DNCL.Nodes.mosi = function (proc_queue) {
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let i in proc_queue) {
                buff.push(proc_queue[i].js_expr(fields));
            }
            return buff.join('');
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in proc_queue) {
                buff.push(proc_queue[i].dncl_expr());
            }
            return buff.join('');
        }
    };
}

/**
 * 代入文(配列)のASTノードを構築します.
 * @param {Object} variable 変数名のトークン.
 * @param {Object} arr 代入文の左辺のASTノード.
 * @param {Object} val 代入文の右辺のASTノード.
 * @returns 代入文(配列)のASTノード.
 */
DNCL.Nodes.dainyu_array = function (variable, arr, val) {
    return {
        js_expr: function (fields) {
            if (DNCL.Nodes.getFuncInfo(variable.expression)) throw DNCL.Parser.report(variable, "代入文の左辺'" + variable.expression + "'は関数名です．");
            let arr_expr = arr.js_expr(fields);
            let val_expr = val.js_expr(fields);
            let d_exp = "$" + variable.expression;
            fields.define(variable.expression);
            return "var " + d_exp + "=_setValToArr(" + val_expr + ",0," + arr_expr + ",typeof " + d_exp + "== 'object'?" + d_exp + ":_createObj())";
        },
        dncl_expr: function () { return arr.dncl_expr() + " ← " + val.dncl_expr(); }
    };
}

/**
 * 代入文(変数)のASTノードを構築します.
 * @param {Object} variable 変数名のトークン.
 * @param {Object} val 代入文の右辺のASTノード.
 * @returns 代入文(変数)のASTノード.
 */
DNCL.Nodes.dainyu_variable = function (variable, val) {
    return {
        js_expr: function (fields) {
            if (DNCL.Nodes.getFuncInfo(variable.expression)) throw DNCL.Parser.report(variable, "代入文の左辺'" + variable.expression + "'は関数名です．");
            fields.define(variable.expression);
            let d_exp = "$" + variable.expression;
            return "var " + d_exp + " = " + val.js_expr(fields) + ";";
        },
        dncl_expr: function () {
            return variable.expression + " ← " + val.dncl_expr();
        }
    };
}

/**
 * 代入文(複数)のASTノードを構築します.
 * @param {Array<Object>} vars 代入文のASTノード.
 * @param {Number} level インデントレベル.
 * @param {Object} cmt 末尾のインラインコメントのASTノード.
 * @param {Boolean} newL 末尾のインラインコメントの改行の有無.
 * @param {Boolean} commas 「,」の有無.
 * @returns 代入文(複数)のASTノード.
 */
DNCL.Nodes.dainyu = function (vars, level, cmt, newL, commas) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            let buff = [];
            if (commas) {
                for (let i in vars) {
                    buff.push(vars[i].js_expr(fields) + ";");
                }
                return buff.join('') + "\n";
            }
            for (let i in vars) {
                buff.push(vars[i].js_expr(fields) + (i == vars.length - 1 ? "" : ("\n" + tab)));
            }
            if (cmt) {
                let nl = newL ? ("\n" + tab) : "";
                return buff.join('') + nl + cmt.js_expr(fields);
            }
            return buff.join('') + "\n";
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in vars) {
                buff.push(vars[i].dncl_expr() + (i == vars.length - 1 ? "" : ", "));
            }
            if (cmt) {
                let nl = newL ? ("\n" + dncl_tab) : "";
                return buff.join('') + nl + cmt.dncl_expr();
            }
            return buff.join('') + "\n";
        }
    };
}

/**
 * 「改行」のASTノードを構築します.
 * @returns 「改行」のASTノード.
 */
DNCL.Nodes.kaigyou = function () {
    return {
        js_expr: function (fields) { return "''"; },
        dncl_expr: function () { return "改行"; }
    };
}

/**
 * 表示文のASTノードを構築します.
 * @param {String} outf 出力関数名.
 * @param {Object} val 値のASTノード.
 * @param {String} newLine 改行の有無.
 * @returns 表示文のASTノード.
 */
DNCL.Nodes.hyoujisuru = function (outf, val, newLine) {
    return {
        js_expr: function (fields) {
            return outf + "(" + val.js_expr(fields) + (newLine ? "+'\\n'" : "") + ");\n";
        },
        dncl_expr: function () {
            if (newLine == "NL") {
                return val.dncl_expr() + " を表示する\n";
            }
            return val.dncl_expr() + " を" + (newLine ? "改行して" : "改行なしで") + "表示する\n";
        }
    };
}

/**
 * 拡張繰り返し文のASTノードを構築します.
 * @param {Object} cnt_variable カウンタ変数のトークン.
 * @param {Object} target 列挙のターゲットの配列値のASTノード.
 * @param {Object} proc <処理>のASTノード.
 * @param {Object} noyouso キーワード「の要素」のトークン.
 * @param {Number} level インデントレベル.
 * @returns 拡張繰り返し文のASTノード.
 */
DNCL.Nodes.x_for = function (cnt_variable, target, proc, noyouso, level) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            fields.define(cnt_variable.expression);
            let t = "$" + cnt_variable.expression;
            let tgi = "_$" + cnt_variable.expression + "i";
            let tgv = "_$" + cnt_variable.expression + "v";
            let lim = "_$" + cnt_variable.expression + "l";
            let ini = "var " + tgv + "=" + "_vars(_valck(" + target.js_expr(fields) + ",'object'," + noyouso.row + "," + noyouso.col + ",'拡張繰り返し文の対象が配列ではありません．'))," +
                lim + "=" + "_len(" + tgv + ")," + tgi + "=0";
            let nex = t + "=_get(" + tgv + "," + tgi + ");";
            return "for(" + ini + ";" + tgi + "<" + lim + ";" + tgi + "++){var " + nex + "\n" +
                proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return target.dncl_expr() + " の要素 " + cnt_variable.expression + " について,\n" + proc.dncl_expr() + dncl_tab + "を繰り返す\n";
        }
    };
}

/**
 * 順次繰り返し文(増やしながら)のASTノードを構築します.
 * @param {Object} cnt_variable カウンタ変数のトークン.
 * @param {Object} from <初期値>のASTノード.
 * @param {Object} to <終了値>のASTノード.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} proc <処理>のASTノード.
 * @param {Number} level インデントレベル.
 * @param {Object} kara キーワード「から」のトークン.
 * @param {Object} made キーワード「まで」のトークン.
 * @param {Object} zutu キーワード「ずつ」のトークン.
 * @returns 順次繰り返し文(増やしながら)のASTノード.
 */
DNCL.Nodes.for_inc = function (cnt_variable, from, to, delta, proc, level, kara, made, zutu) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            fields.define(cnt_variable.expression);
            let i = "$" + cnt_variable.expression;
            let _t = "_t" + i, _d = "_d" + i;
            let from_ = from.js_expr(fields);
            from_ = "_valck(" + from_ + ",'number'," + kara.row + "," + kara.col + ",'順次繰返し文の初期値が数値ではありません．')";
            let to_ = to.js_expr(fields);
            to_ = "_valck(" + to_ + ",'number'," + made.row + "," + made.col + ",'順次繰返し文の終了値が数値ではありません．')";
            let delta_ = delta.js_expr(fields);
            delta_ = "_valck(" + delta_ + ",'number'," + zutu.row + "," + zutu.col + ",'順次繰返し文の増分が数値ではありません．')";
            return "for(var " + i + "=" + from_ + "," + _t + "=" + to_ + "," + _d + "=" + delta_ +
                ";" + i + "<=" + _t + ";" + i + "+=" + _d + "){\n" + proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return cnt_variable.expression + " を " + from.dncl_expr() + " から " + to.dncl_expr() + " まで " + delta.dncl_expr() + " ずつ増やしながら,\n" + proc.dncl_expr() + dncl_tab + "を繰り返す\n";
        }
    };
}

/**
 * 順次繰り返し文(減らしながら)のASTノードを構築します.
 * @param {Object} cnt_variable カウンタ変数のトークン.
 * @param {Object} from <初期値>のASTノード.
 * @param {Object} to <終了値>のASTノード.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} proc <処理>のASTノード.
 * @param {Number} level インデントレベル.
 * @param {Object} kara キーワード「から」のトークン.
 * @param {Object} made キーワード「まで」のトークン.
 * @param {Object} zutu キーワード「ずつ」のトークン.
 * @returns 順次繰り返し文(減らしながら)のASTノード.
 */
DNCL.Nodes.for_dec = function (cnt_variable, from, to, delta, proc, level, kara, made, zutu) {
    let tab = DNCL.Nodes.getTab(level);
    let dncl_tab = DNCL.Nodes.getDNCLTab(level);
    return {
        js_expr: function (fields) {
            fields.define(cnt_variable.expression);
            let i = "$" + cnt_variable.expression;
            let _t = "_t" + i, _d = "_d" + i;
            let from_ = from.js_expr(fields);
            from_ = "_valck(" + from_ + ",'number'," + kara.row + "," + kara.col + ",'順次繰返し文の初期値が数値ではありません．')";
            let to_ = to.js_expr(fields);
            to_ = "_valck(" + to_ + ",'number'," + made.row + "," + made.col + ",'順次繰返し文の終了値が数値ではありません．')";
            let delta_ = delta.js_expr(fields);
            delta_ = "_valck(" + delta_ + ",'number'," + zutu.row + "," + zutu.col + ",'順次繰返し文の増分が数値ではありません．')";
            return "for(var " + i + "=" + from_ + "," + _t + "=" + to_ + "," + _d + "=" + delta_ +
                ";" + i + ">=" + _t + ";" + i + "-=" + _d + "){\n" + proc.js_expr(fields) + tab + "}\n";
        },
        dncl_expr: function () {
            return cnt_variable.expression + " を " + from.dncl_expr() + " から " + to.dncl_expr() + " まで " + delta.dncl_expr() + " ずつ減らしながら,\n" + proc.dncl_expr() + dncl_tab + "を繰り返す\n";
        }
    };
}

/**
 * 変数操作文(<変数>を<増分>増やす)のASTノードを構築します.
 * @param {Object} variable カウンタ変数のトークン.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} t キーワード「増やす」のトークン.
 * @returns 変数操作文(<変数>を<増分>増やす)のASTノード.
 */
DNCL.Nodes.inc_var = function (variable, delta, t) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(variable.expression)) throw DNCL.Parser.report(variable, "変数'" + variable.expression + "'は初期化されていません．");
            let v = "$" + variable.expression;
            let d = delta.js_expr(fields);
            d = "_valck(" + d + ",'number'," + t.row + "," + t.col + ",'変数操作文の増分が数値ではありません．')";
            let sv = "_valck(" + v + ",'number'," + variable.row + "," + variable.col + ",'変数操作文の変数が数値ではありません．')";
            return v + "=" + sv + "+" + d + ";\n";
        },
        dncl_expr: function () {
            return variable.expression + " を " + delta.dncl_expr() + " 増やす\n";
        }
    };
}

/**
 * 変数操作文(<変数>を<増分>減らす)のASTノードを構築します.
 * @param {Object} variable カウンタ変数のトークン.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} t キーワード「増やす」のトークン.
 * @returns 変数操作文(<変数>を<増分>減らす)のASTノード.
 */
DNCL.Nodes.dec_var = function (variable, delta, t) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(variable.expression)) throw DNCL.Parser.report(variable, "変数'" + variable.expression + "'は初期化されていません．");
            let v = "$" + variable.expression;
            let d = delta.js_expr(fields);
            d = "_valck(" + d + ",'number'," + t.row + "," + t.col + ",'変数操作文の増分が数値ではありません．')";
            let sv = "_valck(" + v + ",'number'," + variable.row + "," + variable.col + ",'変数操作文の変数が数値ではありません．')";
            return v + "=" + sv + "-" + d + ";\n";
        },
        dncl_expr: function () {
            return variable.expression + " を " + delta.dncl_expr() + " 減らす\n";
        }
    };
}

/**
 * 変数操作文(<配列>を<増分>増やす)のASTノードを構築します.
 * @param {Object} variable カウンタ変数のトークン.
 * @param {Object} arr 配列参照のASTノード.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} t キーワード「増やす」のトークン.
 * @returns 変数操作文(<配列>を<増分>増やす)のASTノード.
 */
DNCL.Nodes.inc_arr = function (variable, arr, delta, t) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(variable.expression)) throw DNCL.Parser.report(variable, "変数'" + variable.expression + "'は初期化されていません．");
            let d_exp = "$" + variable.expression;
            let arr_expr = arr.js_expr(fields);
            let d = delta.js_expr(fields);
            d = "_valck(" + d + ",'number'," + t.row + "," + t.col + ",'変数操作文の増分が数値ではありません．')";
            let arrCk = "_valck(" + d_exp + ",'object'," + variable.row + "," + variable.col + ",'変数操作文の変数が配列ではありません．')";
            let d_ = "_getValFromArr(0," + arr_expr + "," + arrCk + ")";
            let numCk = "_valck(" + d_ + ",'number'," + variable.row + "," + variable.col + ",'変数操作文の配列変数の値が数値ではありません．')";
            return "_setValToArr(" + numCk + "+" + d + ",0," + arr_expr + "," + d_exp + ");\n";
        },
        dncl_expr: function () { return arr.dncl_expr() + " を " + delta.dncl_expr() + " 増やす\n"; }
    };
}

/**
 * 変数操作文(<配列>を<増分>減らす)のASTノードを構築します.
 * @param {Object} variable カウンタ変数のトークン.
 * @param {Object} arr 配列参照のASTノード.
 * @param {Object} delta <増分>のASTノード.
 * @param {Object} t キーワード「減らす」のトークン.
 * @returns 変数操作文(<配列>を<増分>減らす)のASTノード.
 */
DNCL.Nodes.dec_arr = function (variable, arr, delta, t) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(variable.expression)) throw DNCL.Parser.report(variable, "変数'" + variable.expression + "'は初期化されていません．");
            let d_exp = "$" + variable.expression;
            let arr_expr = arr.js_expr(fields);
            let d = delta.js_expr(fields);
            d = "_valck(" + d + ",'number'," + t.row + "," + t.col + ",'変数操作文の増分が数値ではありません．')";
            let arrCk = "_valck(" + d_exp + ",'object'," + variable.row + "," + variable.col + ",'変数操作文の変数が配列ではありません．')";
            let d_ = "_getValFromArr(0," + arr_expr + "," + arrCk + ")";
            let numCk = "_valck(" + d_ + ",'number'," + variable.row + "," + variable.col + ",'変数操作文の配列変数の値が数値ではありません．')";
            return "_setValToArr(" + numCk + "-" + d + ",0," + arr_expr + "," + d_exp + ");\n";
        },
        dncl_expr: function () {
            return arr.dncl_expr() + " を " + delta.dncl_expr() + " 減らす\n";
        }
    };
}

/**
 * 「<値>を返す」のASTノードを構築します.
 * @param {Object} val <値>のASTノード.
 * @returns 「<値>を返す」のASTノード.
 */
DNCL.Nodes.return_stmt = function (val) {
    return {
        js_expr: function (fields) { return "return " + val.js_expr(fields) + ";\n"; },
        dncl_expr: function () { return val.dncl_expr() + " を返す\n"; }
    };
}

/**
 * 「(<値>)」のASTノードを構築します.
 * @param {Object} node <値>のASTノード.
 * @returns 「(<値>)」のASTノード.
 */
DNCL.Nodes.bracket_fact = function (node) {
    return {
        js_expr: function (fields) { return "(" + node.js_expr(fields) + ")"; },
        dncl_expr: function () { return "(" + node.dncl_expr() + ")"; }
    };
}

/**
 * 数値のASTノードを構築します.
 * @param {Object} p 数値のトークン.
 * @returns 数値のASTノード.
 */
DNCL.Nodes.number = function (p) {
    return { js_expr: function (fields) { return p.expression; }, dncl_expr: function () { return p.expression; } };
}

/**
 * 論理値「true」のASTノードを構築します.
 * @param {Object} p 論理値「true」のトークン.
 * @returns 論理値「true」のASTノード.
 */
DNCL.Nodes.true_value = function (p) {
    return { js_expr: function (fields) { return "true"; }, dncl_expr: function () { return p.expression; } };
}

/**
 * 論理値「false」のASTノードを構築します.
 * @param {Object} p 論理値「false」のトークン.
 * @returns 論理値「false」のASTノード.
 */
DNCL.Nodes.false_value = function (p) {
    return { js_expr: function (fields) { return "false"; }, dncl_expr: function () { return p.expression; } };
}

/**
 * 値「undefined」のASTノードを構築します.
 * @param {Object} p 値「undefined」のトークン.
 * @returns 値「undefined」のASTノード.
 */
DNCL.Nodes.undefined_value = function (p) {
    return { js_expr: function (fields) { return "undefined"; }, dncl_expr: function () { return p.expression; } };
}

/**
 * 値「NaN」のASTノードを構築します.
 * @param {Object} p 値「NaN」のトークン.
 * @returns 値「NaN」のASTノード.
 */
DNCL.Nodes.nan_value = function (p) {
    return { js_expr: function (fields) { return "NaN"; }, dncl_expr: function () { return p.expression; } };
}

/**
 * 変数のASTノードを構築します.
 * @param {Object} p 変数名のトークン.
 * @returns 変数のASTノード.
 */
DNCL.Nodes.variable = function (p) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(p.expression)) throw DNCL.Parser.report(p, "変数'" + p.expression + "'は初期化されていません．");
            return "$" + p.expression;
        },
        dncl_expr: function () { return p.expression; }
    };
}

/**
 * 文字列のASTノードを構築します.
 * @param {Object} p 文字列のトークン.
 * @returns 文字列のASTノード.
 */
DNCL.Nodes.string = function (p) {
    return {
        js_expr: function (fields) { return '"' + p.expression + '"'; },
        dncl_expr: function () { return '"' + p.expression + '"'; }
    };
}

/**
 * 関数呼び出しまたは手続き呼び出しのASTノードを構築します.
 * @param {Object} f_name 関数名または手続き名のトークン.
 * @param {Array<Object>} params パラメータのASTノード.
 * @param {Boolean} inner_call 数式中で呼び出されたかを示す値.
 * @returns 関数呼び出しのASTノード.
 */
DNCL.Nodes.func_call = function (f_name, params, inner_call) {
    return {
        js_expr: function (fields) {
            let is_p = DNCL.Nodes.isProcedure(f_name.expression);
            let fp = is_p ? "手続き" : "関数";
            if (inner_call && is_p) throw DNCL.Parser.report(f_name, "手続き'" + f_name.expression + "'の呼び出しは式の中に記述できません．");
            if (!fields.isDefined(f_name.expression)) throw DNCL.Parser.report(f_name, fp + "'" + f_name.expression + "'は定義されていません．");
            DNCL.Nodes.called(f_name.expression);
            let f_info = DNCL.Nodes.getFuncInfo(f_name.expression);
            let buff = [];
            for (let i in params) {
                buff.push(params[i].js_expr(fields));
            }
            if (f_info.paramCount != buff.length) throw DNCL.Parser.report(f_name, fp + "'" + f_name.expression + "'の引数は" + f_info.paramCount + "個です．");
            return "$" + f_name.expression + "(" + buff.join(",") + ")" + (inner_call ? "" : "\n");
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in params) {
                buff.push(params[i].dncl_expr());
            }
            return f_name.expression + "(" + buff.join(",") + ")" + (inner_call ? "" : "\n");
        }
    };
}

/**
 * 演算子による配列初期化のASTノードを構築します.
 * @param {Array<Object>} lengths 各次元の大きさのASTノード.
 * @param {Object} t 配列初期化子のトークン.
 * @returns 演算子による配列初期化のASTノード.
 */
DNCL.Nodes.array_init = function (lengths, t) {
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let i in lengths) {
                buff.push(lengths[i].js_expr(fields));
            }
            return "_createArray([" + buff.join(',') + "], 0, _createObj()," + t.row + "," + t.col + ")";
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in lengths) {
                buff.push(lengths[i].dncl_expr());
            }
            return "[" + buff.join(",") + "]";
        }
    };
}

/**
 * 配列初期化のASTノードを構築します.
 * @param {Array<Object>} values 配列の要素のASTノード.
 * @returns 配列初期化のASTノード.
 */
DNCL.Nodes.array_value = function (values) {
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let i in values) {
                buff.push(values[i].js_expr(fields));
            }
            return buff.length == 0 ? "_createObj()" : "_initObj([" + buff.join(",") + "])";
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in values) {
                buff.push(values[i].dncl_expr());
            }
            return "{" + buff.join(",") + "}";
        }
    };
}

/**
 * 配列変数の参照のASTノードを構築します.
 * @param {Object} vari 配列変数のトークン.
 * @param {Array<Object>} indices インデックスのASTノード.
 * @param {Number} arr_from 配列の先頭インデックス.
 * @param {String} sender 数式中での参照かを示す値.
 * @returns 配列変数の照のASTノード.
 */
DNCL.Nodes.array_getVal = function (vari, indices, arr_from, sender) {
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let i in indices) {
                buff.push("_hash(" + indices[i].js_expr(fields) + "," + arr_from + ")");
            }
            let d_exp = "$" + vari.expression;
            if (sender == "INNER_FOMULA" && !fields.isDefined(vari.expression)) throw DNCL.Parser.report(vari, "変数'" + vari.expression + "'は配列として初期化されていません．");
            let arrCk = "_valck(undefined,'number'," + vari.row + "," + vari.col + ",\"変数'" + vari.expression + "'は配列ではありません．\")";
            return "(typeof " + d_exp + "== 'object'||typeof " + d_exp + "=='string'?_getValFromArr(0,[" + buff.join(",") + "]," + d_exp + "):" + arrCk + ")";
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in indices) {
                buff.push(indices[i].dncl_expr());
            }
            return vari.expression + "[" + buff.join(",") + "]";
        }
    };
}

/**
 * 配列変数の参照子のASTノードを構築します.
 * @param {Object} vari 配列変数のトークン.
 * @param {Array<Object>} indices インデックスのASTノード.
 * @param {Number} arr_from 配列の先頭インデックス.
 * @param {String} sender 数式中での参照かを示す値.
 * @returns 配列変数の参照子のASTノード.
 */
DNCL.Nodes.array_ref = function (vari, indices, arr_from, sender) {
    return {
        js_expr: function (fields) {
            let buff = [];
            for (let i in indices) {
                buff.push("_hash(" + indices[i].js_expr(fields) + "," + arr_from + ")");
            }
            if (sender == "INNER_FOMULA" && !fields.isDefined(vari.expression)) throw DNCL.Parser.report(vari, "変数'" + vari.expression + "'は配列として初期化されていません．");
            return "[" + buff.join(",") + "]";
        },
        dncl_expr: function () {
            let buff = [];
            for (let i in indices) {
                buff.push(indices[i].dncl_expr());
            }
            return vari.expression + "[" + buff.join(",") + "]";
        }
    };
}

/**
 * ブロックコメントのASTノードを構築します.
 * @param {Array<String>} cmt JavaScriptのブロックコメントの各行.
 * @param {Array<String>} dncl_cmt DNCLのブロックコメントの各行.
 * @returns ブロックコメントのASTノード.
 */
DNCL.Nodes.b_comment = function (cmt, dncl_cmt) {
    return {
        js_expr: function (fields) { return "/*" + cmt.join('') + "*/\n"; },
        dncl_expr: function () { return "/*" + dncl_cmt.join('') + "*/\n"; }
    };
}

/**
 * インラインコメントのASTノードを構築します.
 * @param {Object} c インラインコメントの中身.
 * @returns インラインコメントのASTノード.
 */
DNCL.Nodes.i_comment = function (c) {
    return {
        js_expr: function (fields) { return "//" + c.expression + "\n"; },
        dncl_expr: function () { return "//" + c.expression + "\n"; }
    };
}
