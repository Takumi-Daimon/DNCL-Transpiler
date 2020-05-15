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
     * Transpile DNCL to JavaScript source code.
     * @param {String} dncl Target source code written by DNCL.
     * @return {Object} Object consists of transpiled JavaScript source code and formatted DNCL.
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
     * Definition of native functions and built-in functions.
     */
    Functions: {
        /**
         * Constructs initializer combined ative functions and built-in functions.
         * The combined built-in functions are consist of only invoked.
         * @return {String} Initializer combined ative functions and built-in functions.
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
         * Definition of utility functions written by native language(JavaScript). 
         * Caution!!!! Do not edit!!!!
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
            function _gthan_eq(_l, _r, _line, _at) { if (_operation(_l, "≧", _r)) return _l >= _r; _throw(_line, _at, _type(_l) + "と" + _type(_r) + "の≧演算はありません．"); }
        ],
        /**
         * All built-in functions must defined in this object and followed format below.
         * ・<API_NAME>：Name of built-in function.
         * ・params：Arguments.
         * ・paramCount：Number of arguments.
         * ・native_f：Built-in function named $<API_NAME>.
         *  DNCL.Functions.BuiltinFuncs = {
         *      <API_NAME> : {
         *          params: ["x","y","z",...],
         *          paramCount: <Number of arguments>,
         *          native_f: function $<API_NAME>(x) { <PROCESS> }
         *      }
         *  }
         */
        BuiltinFuncs: {}
    },
    /**
     * Options.
     */
    Setting: {
        /**
         * Represents initial index of the array.
         * @type Numbar
         */
        array_begins_from: 1,
        /**
         * Represents output function.
         * @type String
         */
        output_func: 'alert',
        /**
         * Represents whether generated source code includes comments.
         * @type Boolean
         */
        includes_comment: true,
        /**
         * Represents error marker.
         * @type String
         */
        errorMarker: '★'
    },
    /**
     * Definition of symbols.
     */
    Symbols: {
        "+": "PLUS", "＋": "PLUS", "-": "MINUS", "－": "MINUS", "*": "MUL", "＊": "MUL", "×": "MUL", "/": "DIV", "÷": "DIV_FLOOR", "%": "MOD", "％": "MOD", "(": "BRA_B", "（": "BRA_B", ")": "BRA_E", "）": "BRA_E", ",": "COMMA", "，": "COMMA", "、": "COMMA", "←": "L_ARROW", "=": "EQUAL", "＝": "EQUAL", "!": "NOT", "!=": "NOT_EQUAL", "≠": "NOT_EQUAL", "<": "L_THAN", "＜": "L_THAN",
        ">": "G_THAN", "＞": "G_THAN", "<=": "L_THAN_EQUAL", "≦": "L_THAN_EQUAL", ">=": "G_THAN_EQUAL", "≧": "G_THAN_EQUAL", "\n": "NEW_LINE", '"': "STR_B", '”': "STR_B", '「': "STR_B", '」': "STR_E", "{": "BLO_B", "｛": "BLO_B", "}": "BLO_E", "｝": "BLO_E", "[": "ARR_B", "［": "ARR_B", "]": "ARR_E", "］": "ARR_E", "/*": "B_COMMENT_B", "*/": "B_COMMENT_E", "//": "I_COMMENT_B"
    },
    /**
     * Definition of meta-character.
     */
    MetaString: {
        "\\n": "\\n", "\\t": "\\t", "\\\\": "\\\\", "\\\"": "\\\""
    },
    /**
     * Definition of enclosure.
     */
    EnclosurePair: {
        '"': '"', '”': '”', "「": "」", "/*": "*/", "//": "\n"
    },
    /**
     * Definition of keywords.
     */
    Keywords: {
        "を": "WO", "は": "HA", "と": "TO", "改行": "KAIGYOU", "表示する": "HYOUJISURU", "繰り返す": "KURIKAESU", "ならば": "NARABA", "から": "KARA", "まで": "MADE", "ずつ": "ZUTU", "返す": "KAESU", "かつ": "KATU", "または": "MATAHA", "もし": "MOSI", "そうでなく": "SOUDENAKU", "そうでなければ": "SOUDENAKEREBA",
        "になるまで": "NINARUMADE", "実行する": "JIKKOUSURU", "実行し": "JIKKOUSI", "繰り返し": "KURIKAESI", "関数": "KANSU", "の間": "NOAIDA", "減らしながら": "HERASINAGARA", "増やしながら": "HUYASINAGARA", "して": "SITE", "なしで": "NASIDE", "でない": "DENAI", "増やす": "HUYASU", "減らす": "HERASU",
        "true": "TRUE", "false": "FALSE", "True": "TRUE", "False": "FALSE", "undefined": "UNDEFINED", "NaN": "NAN"
    },
    /**
     * Definition of alphabets.
     */
    Alphabets: {
        "a": "a", "ａ": "a", "A": "A", "Ａ": "A", "b": "b", "ｂ": "b", "B": "B", "Ｂ": "B", "c": "c", "ｃ": "c", "C": "C", "Ｃ": "C", "d": "d", "ｄ": "d", "D": "D", "Ｄ": "D", "e": "e", "ｅ": "e", "E": "E", "Ｅ": "E", "f": "f", "ｆ": "f", "F": "F", "Ｆ": "F", "g": "g", "ｇ": "g", "G": "G", "Ｇ": "G", "h": "h", "ｈ": "h", "H": "H", "Ｈ": "H", "i": "i", "ｉ": "i", "I": "I", "Ｉ": "I", "j": "j", "ｊ": "j", "J": "J", "Ｊ": "J", "k": "k", "ｋ": "k", "K": "K", "Ｋ": "K", "l": "l", "ｌ": "l", "L": "L", "Ｌ": "L", "m": "m", "ｍ": "m", "M": "M", "Ｍ": "M",
        "n": "n", "ｎ": "n", "N": "N", "Ｎ": "N", "o": "o", "ｏ": "o", "O": "O", "Ｏ": "O", "p": "p", "ｐ": "p", "P": "P", "Ｐ": "P", "q": "q", "ｑ": "q", "Q": "Q", "Ｑ": "Q", "r": "r", "ｒ": "r", "R": "R", "Ｒ": "R", "s": "s", "ｓ": "s", "S": "S", "Ｓ": "S", "t": "t", "ｔ": "t", "T": "T", "Ｔ": "T", "u": "u", "ｕ": "u", "U": "U", "Ｕ": "U", "v": "v", "ｖ": "v", "V": "V", "Ｖ": "V", "w": "w", "ｗ": "w", "W": "W", "Ｗ": "W", "x": "x", "ｘ": "x", "X": "X", "Ｘ": "X", "y": "y", "ｙ": "y", "Y": "Y", "Ｙ": "Y", "z": "z", "ｚ": "z", "Z": "Z", "Ｚ": "Z"
    },
    /**
     * Definition of digits.
     */
    Numbers: {
        "0": "0", "０": "0", "1": "1", "１": "1", "2": "2", "２": "2", "3": "3", "３": "3", "4": "4", "４": "4",
        "5": "5", "５": "5", "6": "6", "６": "6", "7": "7", "７": "7", "8": "8", "８": "8", "9": "9", "９": "9",
    },
    Lexer: {
        /**
         * Initialize fields.
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
         * Registers the field's name.
         * @param {String} name The field's name.
         */
        define: function (name) { this.definedName["@" + name] = true; },
        /**
         * Determines whetner the field's name is used.
         * @param {String} exp The field's name.
         * @return {Boolean} True if the field's name is used.
         */
        isDefined: function (name) { return this.definedName["@" + name]; },
        /**
         * Determines whetner the target string is digit.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is digit.
         */
        isNum: function (exp) { return this.numbers[exp] != undefined; },
        /**
         * Determines whetner the target string is Japanese.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is Japanese.
         */
        isJapanese: function (exp) { return !this.isSymbol(exp) && /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/.test(exp); },
        /**
         * Determines whetner the target string is alphabet.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is alphabet.
         */
        isAlphabet: function (exp) { return this.alphabets[exp] != undefined; },
        /**
         * Determines whetner the target string is symbol.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is symbol.
         */
        isSymbol: function (exp) { return this.symbols[exp] != undefined; },
        /**
         * Determines whetner the target string is meta-character.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is meta-character.
         */
        isMetaString: function (exp) { return this.metaString[exp] != undefined; },
        /**
         * Determines whetner the target string is key word.
         * @param {String} exp The target string.
         * @return {Boolean} True if the target string is key word.
         */
        isKeywod: function (exp) { return this.keywords["@" + exp] != undefined; },
        /**
         * Returns the type corresponding to the target string.
         * @param {String} exp The target string represents key word.
         * @return {String} Type of the key word.
         */
        getKeywod: function (exp) { return this.keywords["@" + exp]; },
        /**
         * Returns enclosure corresponding to the target string.
         * @param {String} exp The target string represents enclosure.
         * @return {String} The enclosure corresponding to target string.
         */
        getEnclosure: function (exp) { return this.enclosures[exp]; },
        /**
         * Determines whetner any characters are remaining.
         * @return {Boolean} True if any characters are remaining.
         */
        hasNext: function () { return this.pos < this.code.length; },
        /**
         * Skips empty characters.
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
         * Skips and returns a character.
         * @return {String} Skipped character.
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
         * Returns current character.
         * @return {String} Current character.
         */
        peek: function () { return this.code[this.pos]; },
        /**
         * Returns formatted Japanese character.
         * @return {String} Formatted Japanese character.
         */
        formatJapanese: function (x) { return this.alph_num_formats[x] ? this.alph_num_formats[x] : x; }
    },
    /**
     * Provides the methods for scanning AST.
     */
    Nodes: {
        /**
         * Initialize fields.
         * @constructor
         */
        init: function () {
            this.line_count = 1;
            this.defined_funcs = [];
            this.called_funcs = [];
            for (let i in DNCL.Functions.BuiltinFuncs) this.registerFuncInfo(i, DNCL.Functions.BuiltinFuncs[i])
        },
        /**
         * Returns the tab character which manipulated appropriate indent level.
         * This function is used for JavaScript code.
         * @param {Number} level Indent level.
         * @return {String} Tab character manipulated appropriate indent level.
         */
        getTab: function (level) {
            return new Array(level).fill("    ", 0, level).join('');
        },
        /**
         * Returns the tab character which manipulated appropriate indent level.
         * This function is used for JavaScript code.
         * @param {Number} level Indent level.
         * @return {String} Tab character manipulated appropriate indent level.
         */
        getDNCLTab: function (level) {
            return new Array(level).fill("\t", 0, level).join('');
        },
        /**
         * Determines whetner the target function is called.
         * @param {String} name Name of the target function.
         * @return {Boolean} True if the target function is called.
         */
        isCalled: function (name) { return this.called_funcs["@" + name]; },
        /**
         * Registers whetner the target function is called.
         * @param {String} name Name of the target function.
         */
        called: function (name) { this.called_funcs["@" + name] = true; },
        /**
         * Registers the infomation of the function.
         * @param {String} name Name of the target function.
         * @param {Object} info Infomation of the function.
         */
        registerFuncInfo: function (name, info) { this.defined_funcs["@" + name] = info; },
        /**
         * Returns infomation of the target function.
         * @param {String} name Name of the target function.
         * @return {Object} Object contains infomation of the target function.
         */
        getFuncInfo: function (name) { return this.defined_funcs["@" + name]; },
        /**
         * Returns the object to store fields.
         * @return {Object} Object provides the method to store field names.
         */
        dynamic_fields: function () {
            let apis = [];
            for (let i in DNCL.Nodes.defined_funcs) apis[i] = true;
            return {
                /**
                 * Array to store the registered name.
                 */
                defined_names: apis,
                /**
                 * Registers the name of the target field.
                 * @param {String} name Name of the target field.
                 */
                define: function (name) { this.defined_names["@" + name] = true; },
                /**
                 * Determines whetner the target function is defined.
                 * @param {String} name Name of the target field.
                 * @return {Boolean} True if the target field is defined.
                 */
                isDefined: function (name) { return this.defined_names["@" + name]; },

                toString: function () {
                    let buff = [], n;
                    for (let i in this.defined_names) {
                        if (!DNCL.Nodes.defined_funcs[i]) {
                            n = i.slice(1);
                            buff.push("'" + n + "':" + "typeof $" + n + "=='undefined'?undefined:$" + n);
                        }
                    }
                    return "{" + buff.join(",") + "}";
                }
            };
        }
    },
    /**
     * Provides the methods for constract AST.
     */
    Parser: {
        /**
         * Initialize fields.
         * @constructor
         * @param {Object} tokens Array consists of tokens.
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
         * Skips and returns a token.
         * @return {Object} Skipped token.
         */
        read: function () { return this.tokens[this.pos++]; },
        /**
         * Returns current token.
         * @return {Object} Current token.
         */
        peek: function () { return this.tokens[this.pos]; },
        /**
         * Skips new-line character.
         */
        skipEmpty: function () { let c = []; while (this.peek().type == "NEW_LINE") { c.push(this.read()); } return c; },
        /**
         * Determines if token's type represents value.
         * @param {String} t String value represents token's type
         * @return {Boolean} Returns true if t represents value.
         */
        isValue: function (t) { return t == "KAIGYOU" || t == "ARR_B" || t == "MINUS" || t == "VARIABLE" || t == "STRING" || t == "NUMBER" || t == "BRA_B" || t == "BLO_B" || t == "TRUE" || t == "FALSE" || t == "UNDEFINED" || t == "NAN"; },
        /**
         * Creates the error view.
         * @param {Object} p Token ocuured error.
         * @return {String} Inputted source code inserted marker at the position error ocuured.
         */
        createView: function (p) {
            let lines = DNCL.Lexer.code.split('\n');
            let pre = lines[p.row - 2] ? (lines[p.row - 2] + "\n") : "";
            let cur = lines[p.row - 1];
            let nex = lines[p.row] ? ("\n" + lines[p.row]) : "";
            return pre + cur.slice(0, p.col - 1) + this._errorMarker_ + cur.slice(p.col - 1) + nex;
        },
        /**
         * Creates the error message from token and given message.
         * @param {Object} p Token ocuured error.
         * @param {String} msg Error message.
         * @return {Object} Object value contains generated error message and position.
         */
        report: function (p, msg) { return { errorView: this.createView(p), lineNumber: p.row, charAt: p.col, message: p.row + "行目," + p.col + "文字目：" + msg.replace(/\n/g, "'改行'") }; }
    }
}

/**
 * Analyzes digit part.
 * @return {String} String value represents digit.
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
 * Analyzes alphabet part.
 * @return {String} Alphameric string value represents variable.
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
 * Analyzes Japanese part.
 * @return {Object} The object represents token.
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
 * Analyzes "string" part.
 * @param {String} enclosure String enclosure.
 * @return {Object} The object represents token.
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
 * Analyzes inline comment part.
 * @param {String} enclosure Inline-comment's enclosure.
 * @return {Object} The object represents token.
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
 * Analyzes block comment part.
 * @param {String} enclosure Block comment's enclosure.
 * @return {Object} The object represents token.
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
 * Analyzes symbol part.
 * @return {Object} The object represents token.
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
 * Returns array consists of tokens.
 * @return {Array<Object>} Array consists of tokens.
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
 * Analyzes inline comment.
 * @return {Object} AST node.
 */
DNCL.Parser.i_comment = function () {
    let c = this.read();
    return DNCL.Nodes.i_comment(c);
}

/**
 * Analyzes block comment.
 * @return {Object} AST node.
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
 * Analyzes processes.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
        } else if (p.type == "KANSU" && !this.inner_function && this.indent_level == 0) {
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
 * Analyzes function statement.
 * @return {Object} AST node.
 */
DNCL.Parser.func_def = function () {
    this.read();
    let variable = this.peek();
    if (variable.type != "VARIABLE") throw this.report(variable, "関数名がありません．");
    this.read();
    let p = this.peek();
    if (p.type != "BRA_B") throw this.report(p, "関数定義のキーワード'('がありません．");
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
    if (p.type != "HA") throw this.report(p, "関数定義のキーワード'は'がありません．");
    this.read();
    this.inner_function = true;
    this.indent_level++;
    let proc = this.process(0);
    this.indent_level--;
    this.inner_function = false;
    p = this.peek();
    if (p.type != "JIKKOUSURU") throw this.report(p, "関数定義のキーワード'実行する'がありません．");
    this.read();
    DNCL.Nodes.registerFuncInfo(variable.expression, { params: params_, paramCount: params_.length });
    return DNCL.Nodes.func_def(variable, params_, proc);
}

/**
 * Analyzes do-while statement.
 * @return {Object} AST node.
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
 * Analyzes while statement.
 * @param {Object} bool Condition expressed by AST.
 * @return {Object} AST node.
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
 * Analyzes if, if-else, if-[else if,...]-else statement.
 * @return {Object} AST node.
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
 * Analyzes substitution statement.
 * @param {Number} pre_pos Position for back-tracking.
 * @return {Object} AST node.
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
                return DNCL.Nodes.dainyu(vars, this.indent_level, cmt, e, commas);
            }
        } else {
            throw this.report(p, "代入文中の'" + p.expression + "'は無効です．");
        }
    }
}


/**
 * Analyzes print, println statement.
 * @param {Object} val Value expressed by AST.
 * @return {Object} AST node.
 */
DNCL.Parser.hyoujisuru = function (val, newLine) {
    let outf = this._output_func_;
    return DNCL.Nodes.hyoujisuru(outf, val, newLine);
}

/**
 * Analyzes "for" statement.
 * @param {Number} pre_pos Position for back-tracking.
 * @return {Object} AST node.
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
 * Analyzes increment and decrement statement.
 * @param {Number} pre_pos Position for back-tracking.
 * @return {Object} AST node.
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
 * Analyzes the part from "...を...".
 * @param {Object} val Value expressed by AST.
 * @param {Number} pre_pos Position for back-tracking.
 * @return {Object} AST node.
 */
DNCL.Parser.wo = function (val, pre_pos) {
    this.read();
    let p = this.peek();
    switch (p.type) {
        case "HYOUJISURU":
            this.read();
            return this.hyoujisuru(val, "NL");
        case "KAESU":
            if (!this.inner_function) throw this.report(p, "関数の外に'返す'を記述することはできません．");
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
 * Wrapper function represents non-terminal : <VALUE>.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
 */
DNCL.Parser.value = function (sender) {
    return this.boolean(sender);
}

/**
 * Analyzes boolean operation.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes compare operation.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes addition and subtraction.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes multiple, division and modulo operation.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes number, variable, string and array.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes initialization of array.
 * @param {String} sender The invoker name.
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
 * Analyzes function call part.
 * @param {Object} f_name Token represents function name.
 * @param {Boolean} inner_call Value represents whether called in fomula.
 * @return {Object} AST node.
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
 * Analyzes array value.
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes the part references array.
 * @param {Object} vari The object represents variable. 
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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
 * Analyzes the part getting value of array.
 * @param {Object} vari The object represents variable. 
 * @param {String} sender The invoker name.
 * @return {Object} AST node.
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

DNCL.Nodes.func_def = function (variable, params_, proc) {
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
            return "関数 " + variable.expression + "(" + params_.join(',') + ")は\n" + proc.dncl_expr() + "を実行する\n\n";
        }
    };
}

DNCL.Nodes.atojyouken_kurikaesi = function (bool, proc, level, t) {
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

DNCL.Nodes.maejyouken_kurikaesi = function (bool, proc, level, t) {
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

DNCL.Nodes.if_mono_proc = function (bool, proc, level, t) {
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

DNCL.Nodes.if_stmt_ = function (bool, proc, level, t) {
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

DNCL.Nodes.elseif_stmt = function (s_bool, s_proc, level, t) {
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

DNCL.Nodes.elseif_stmt_ = function (s_bool, s_proc, level, t) {
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
                let nl = newL.length == 0 ? "" : ("\n" + tab);
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
                let nl = newL.length == 0 ? "" : ("\n" + dncl_tab);
                return buff.join('') + nl + cmt.dncl_expr();
            }
            return buff.join('') + "\n";
        }
    };
}

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

DNCL.Nodes.kaigyou = function () {
    return {
        js_expr: function (fields) { return "''"; },
        dncl_expr: function () { return "改行"; }
    };
}

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

DNCL.Nodes.return_stmt = function (val) {
    return {
        js_expr: function (fields) { return "return " + val.js_expr(fields) + ";\n"; },
        dncl_expr: function () { return val.dncl_expr() + " を返す\n"; }
    };
}

DNCL.Nodes.bracket_fact = function (node) {
    return {
        js_expr: function (fields) { return "(" + node.js_expr(fields) + ")"; },
        dncl_expr: function () { return "(" + node.dncl_expr() + ")"; }
    };
}

DNCL.Nodes.number = function (p) {
    return { js_expr: function (fields) { return p.expression; }, dncl_expr: function () { return p.expression; } };
}

DNCL.Nodes.true_value = function (p) {
    return { js_expr: function (fields) { return "true"; }, dncl_expr: function () { return p.expression; } };
}

DNCL.Nodes.false_value = function (p) {
    return { js_expr: function (fields) { return "false"; }, dncl_expr: function () { return p.expression; } };
}

DNCL.Nodes.undefined_value = function (p) {
    return { js_expr: function (fields) { return "undefined"; }, dncl_expr: function () { return p.expression; } };
}

DNCL.Nodes.nan_value = function (p) {
    return { js_expr: function (fields) { return "NaN"; }, dncl_expr: function () { return p.expression; } };
}

DNCL.Nodes.variable = function (p) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(p.expression)) throw DNCL.Parser.report(p, "変数'" + p.expression + "'は初期化されていません．");
            return "$" + p.expression;
        },
        dncl_expr: function () { return p.expression; }
    };
}

DNCL.Nodes.string = function (p) {
    return {
        js_expr: function (fields) { return '"' + p.expression + '"'; },
        dncl_expr: function () { return '"' + p.expression + '"'; }
    };
}

DNCL.Nodes.func_call = function (f_name, params, inner_call) {
    return {
        js_expr: function (fields) {
            if (!fields.isDefined(f_name.expression)) throw DNCL.Parser.report(f_name, "関数'" + f_name.expression + "'は定義されていません．");
            DNCL.Nodes.called(f_name.expression);
            let f_info = DNCL.Nodes.getFuncInfo(f_name.expression);
            let buff = [];
            for (let i in params) {
                buff.push(params[i].js_expr(fields));
            }
            if (f_info.paramCount != buff.length) throw DNCL.Parser.report(f_name, "関数'" + f_name.expression + "'の引数は" + f_info.paramCount + "個です．");
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

DNCL.Nodes.b_comment = function (cmt, dncl_cmt) {
    return {
        js_expr: function (fields) { return "/*" + cmt.join('') + "*/\n"; },
        dncl_expr: function () { return "/*" + dncl_cmt.join('') + "*/\n"; }
    };
}

DNCL.Nodes.i_comment = function (c) {
    return {
        js_expr: function (fields) { return "//" + c.expression + "\n"; },
        dncl_expr: function () { return "//" + c.expression + "\n"; }
    };
}