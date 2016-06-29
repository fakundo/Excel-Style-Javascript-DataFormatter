'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dataformatter = function () {
  function Dataformatter() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$locale = _ref.locale;
    var locale = _ref$locale === undefined ? 'ru' : _ref$locale;

    _classCallCheck(this, Dataformatter);

    this.setLocale(locale);
  }

  _createClass(Dataformatter, [{
    key: 'setLocale',
    value: function setLocale(locale) {
      var localeData = require('./locales/' + locale + '.js');
      this.locale = localeData;
      // Clear saved functions
      this.functions = {};
    }
  }]);

  return Dataformatter;
}();

;

var d = new Dataformatter();