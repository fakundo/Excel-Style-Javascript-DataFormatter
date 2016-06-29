'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.each = each;
exports.map = map;
exports.extend = extend;
exports.formatString = formatString;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Invokes func for every element
 */
function each(obj, func) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      func(obj[key], key);
    }
  }
};

/**
 * Transform values
 */
function map(obj, func) {
  var res = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      res.push(func(obj[key], key));
    }
  }
  return res;
};

/**
 * Extends object
 */
function extend(a) {
  for (var _len = arguments.length, b = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    b[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < b.length; i++) {
    for (var j in b[i]) {
      if (b[i].hasOwnProperty(j)) {
        a[j] = b[i][j];
      }
    }
  }
  return a;
};

/**
 * Format string like sprintf() in PHP
 */
function formatString(s) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return s.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

/**
 * Class for building code
 */

var Code = exports.Code = function () {
  function Code() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Code);

    // Default opts
    this.opts = extend({
      debug: false
    }, opts);

    this.code = '';
  }

  _createClass(Code, [{
    key: 'makeString',
    value: function makeString(s) {
      for (var _len3 = arguments.length, values = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        values[_key3 - 1] = arguments[_key3];
      }

      values = map(values, function (val) {
        return JSON.stringify(val);
      });
      return formatString.apply(undefined, [s].concat(_toConsumableArray(values)));
    }
  }, {
    key: 'append',
    value: function append() {
      this.code += this.makeString.apply(this, arguments);
      if (this.opts.debug) this.code += '\n';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.code;
    }
  }, {
    key: 'appendRaw',
    value: function appendRaw(str) {
      this.code += str;
    }
  }]);

  return Code;
}();

;