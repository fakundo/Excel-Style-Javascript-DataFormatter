'use strict';

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _dev = require('../../dev');

var _dev2 = _interopRequireDefault(_dev);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dataFormatter = new _dev2.default({
  debug: true,
  UTCOffset: 0,
  transformCode: _jsBeautify2.default
});

dataFormatter.format('2000', 'Number', '0.0E+0');