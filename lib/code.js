'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Format string like sprintf() in PHP
 */
function formatString(s) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return s.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

/**
 * Class for building code
 */

var Code = function () {
  function Code() {
    _classCallCheck(this, Code);

    this.code = '';
  }

  _createClass(Code, [{
    key: 'makeString',
    value: function makeString(s) {
      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      values = values.map(JSON.stringify);
      return formatString.apply(undefined, [s].concat(_toConsumableArray(values)));
    }
  }, {
    key: 'append',
    value: function append() {
      this.code += this.makeString.apply(this, arguments);
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

exports.default = Code;
;