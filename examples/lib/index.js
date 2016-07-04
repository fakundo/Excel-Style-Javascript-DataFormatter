'use strict';

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _lib = require('../../lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dataFormatter = new _lib.DataFormatter({
  debug: true,
  UTCOffset: 0,
  transformCode: _jsBeautify2.default
});

dataFormatter.format('40', 'Number', '[>10][Red]0;[Green]-0.0;[Blue]0.0000');