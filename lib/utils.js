'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Code = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.formatString = formatString;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Code = exports.Code = function () {
  function Code() {
    (0, _classCallCheck3.default)(this, Code);

    this.code = '';
  }

  (0, _createClass3.default)(Code, [{
    key: 'makeString',
    value: function makeString(s) {
      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      values = values.map(_stringify2.default);
      return formatString.apply(undefined, [s].concat((0, _toConsumableArray3.default)(values)));
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
  }]);
  return Code;
}();

;