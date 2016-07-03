'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var zeroDate = new Date('1899-12-31T00:00:00.000');
var defaultLocale = 'en-US';

var DataFormatter = function () {
  function DataFormatter() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, DataFormatter);

    // Set default options
    this.opts = (0, _utils.extend)({
      debug: false,
      locale: defaultLocale,
      transformCode: function transformCode(code) {
        return code;
      }
    }, opts);

    this.setLocale(this.opts.locale);
  }

  _createClass(DataFormatter, [{
    key: 'clearMemoizedFunctions',
    value: function clearMemoizedFunctions() {
      this.memoized = {};
    }
  }, {
    key: 'setLocale',
    value: function setLocale(locale) {
      var localeData = require('./locales/' + locale + '.js');
      if (!localeData) {
        localeData = require('./locales/' + defaultLocale + '.js');
      }
      this.locale = localeData.default;
      this.clearMemoizedFunctions();
    }
  }, {
    key: 'log',
    value: function log(message) {
      if (this.opts.debug) {
        console.log(message);
      }
    }

    /**
     * Greatest common divisor
     */

  }, {
    key: 'gcd',
    value: function gcd(a, b) {
      var r = void 0;
      while (b) {
        r = a % b;
        a = b;
        b = r;
      }
      return a;
    }
  }, {
    key: 'toFixed',
    value: function toFixed(n, decimals) {
      var factor = Math.pow(10, decimals);
      return Math.round(n * factor) / factor;
    }
  }, {
    key: 'applyNumberPattern',
    value: function applyNumberPattern(n, pattern, direction) {
      n = n.toString();
      var s = '';

      if (direction === 'right') {
        var j = 0;
        var i = -1;
        var patLen = pattern.length;

        while (++i < patLen) {
          switch (pattern[i]) {
            case '0':
              s += n[j] || '0';
              j++;
              break;
            case '#':
              s += n[j] || '';
              j++;
              break;
            case '?':
              s += n[j] || ' ';
              j++;
              break;
            case '[':
              while (i < pattern.length && pattern[i] !== ']') {
                s += pattern[i];
                i++;
              }
              i--;
              break;
            default:
              s += pattern[i];
          }
        }
      } else {
        // Should separate thousands
        var separateThousands = false;
        var mostLeftDigit = void 0;

        pattern = pattern.replace(/(0|#|\?)(,+?)(0|#|\?)/g, function (a, m1, m2, m3) {
          separateThousands = true;
          return m1 + m3;
        });

        // Add separation
        if (separateThousands) {
          var _j2 = n.length - 3;
          while (n[0] === '-' ? _j2 > 1 : _j2 > 0) {
            n = n.substr(0, _j2) + this.locale.thousandSeparator + n.substr(_j2);
            _j2 -= 3;
          }
        }

        var _j = n.length - 1;
        var _i = pattern.length;

        while (_i--) {
          switch (pattern[_i]) {
            case '0':
              s = (n[_j] || '0') + s;
              mostLeftDigit = _i;
              _j--;
              break;
            case '#':
              s = (n[_j] || '') + s;
              mostLeftDigit = _i;
              _j--;
              break;
            case '?':
              s = (n[_j] || ' ') + s;
              mostLeftDigit = _i;
              _j--;
              break;
            case ']':
              while (_i > 0 && pattern[_i] !== '[') {
                s = pattern[_i] + s;
                _i--;
              }
              _i++;
              break;
            default:
              s = pattern[_i] + s;
          }
        }
        // Add remaining digits, example: n=1234, ptrn=00, result must be 1234 instead of 34
        if (_j >= 0 && mostLeftDigit !== null) {
          s = s.substr(0, mostLeftDigit) + n.substr(0, _j + 1) + s.substr(mostLeftDigit);
        }
      }

      return s;
    }
  }, {
    key: 'restoreOrigins',
    value: function restoreOrigins(value, origins) {
      return value.toString().replace(/\[(?:(\$*?)|(.*?))\]/g, function (a, m1) {
        return m1 && origins[m1.length - 1] || '';
      });
    }
  }, {
    key: 'formatAsNumberDecimal',
    value: function formatAsNumberDecimal(n, decimals, patternIntegerPart, patternDecimalPart) {

      n = this.toFixed(n, decimals).toString().split('.');
      var integerPart = parseInt(n[0]);
      var decimalPart = parseInt(n[1] || 0);

      return this.applyNumberPattern(integerPart, patternIntegerPart) + this.locale.decimalSeparator + this.applyNumberPattern(decimalPart, patternDecimalPart, 'right');
    }
  }, {
    key: 'formatAsNumberFractial',
    value: function formatAsNumberFractial(n, patternNumeratorPart, patternDenominatorPart) {
      var m = n.toString().split(".");
      m = m[1] ? Math.pow(10, m[1].length) : 1;
      n = Math.floor(n * m);

      var factor = this.gcd(n, m);

      return this.applyNumberPattern(n / factor, patternNumeratorPart) + '/' + this.applyNumberPattern(m / factor, patternDenominatorPart);
    }
  }, {
    key: 'formatAsNumberFractialMixed',
    value: function formatAsNumberFractialMixed(n, leftPatternNumeratorPart, rightPatternNumeratorPart, patternDenominatorPart) {
      var f = 0;
      var c = 1;
      var factor = 1;
      var m = n.toString().split('.');

      if (m[1]) {
        c = Math.pow(10, m[1].length);
        f = parseInt(m[1]);
        factor = this.gcd(f, c);
      }

      return this.applyNumberPattern(Math.floor(n), leftPatternNumeratorPart) + this.applyNumberPattern(f / factor, rightPatternNumeratorPart) + '/' + this.applyNumberPattern(c / factor, patternDenominatorPart);
    }
  }, {
    key: 'formatAsNumberExponential',
    value: function formatAsNumberExponential(n, integerPart, decimalPart, patternIntegerPart, patternDecimalPart, patternPowPart) {

      var sign = n < 0 ? -1 : 1;
      var pow = 0;

      if (n !== 0) {

        n = Math.abs(n);

        var integerPartDivision = Math.pow(10, integerPart);

        while (n < integerPartDivision || this.toFixed(n, decimalPart) < integerPartDivision) {
          n *= 10;
          pow++;
        }

        while (n >= integerPartDivision || this.toFixed(n, decimalPart) >= integerPartDivision) {
          n /= 10;
          pow--;
        }
      }

      n = this.toFixed(n * sign, decimalPart).toString().split('.');

      // Build res
      var res = '';

      // Integer part
      res += this.applyNumberPattern(parseInt(n[0]), patternIntegerPart);

      // Decimal part
      if (patternDecimalPart) {
        res += this.locale.decimalSeparator + this.applyNumberPattern(parseInt(n[1]), patternDecimalPart, 'right');
      }

      // Pow part
      res += 'E' + (pow > 0 ? '-' : '+') + this.applyNumberPattern(Math.abs(pow), patternPowPart);

      return res;
    }
  }, {
    key: 'formatAsDateTimeElapsed',
    value: function formatAsDateTimeElapsed(n, foundDays, foundHours, foundMinutes, pattern) {
      var _this = this;

      n = Math.abs(n.getTime() - zeroDate.getTime());

      var seconds = parseInt(n / 1000);
      var minutes = parseInt(seconds / 60);
      var hours = parseInt(minutes / 60);
      var days = parseInt(hours / 24);

      hours = foundDays ? hours % 24 : hours;
      minutes = foundHours ? minutes % 60 : minutes;
      seconds = foundMinutes ? seconds % 60 : seconds;

      return pattern.replace(/(dd)|(d)|(hh)|(h)|(mm)|(m)|(ss)|(s)/gi, function (a, dd, d, hh, h, mm, m, ss, s) {

        if (dd) {
          return _this.applyNumberPattern(days, '00');
        }

        if (d) {
          return days;
        }

        if (hh) {
          return _this.applyNumberPattern(hours, '00');
        }

        if (h) {
          return hours;
        }

        if (mm) {
          return _this.applyNumberPattern(minutes, '00');
        }

        if (m) {
          return minutes;
        }

        if (ss) {
          return _this.applyNumberPattern(seconds, '00');
        }

        if (s) {
          return seconds;
        }

        return '';
      });
    }
  }, {
    key: 'formatAsDateTimeNormal',
    value: function formatAsDateTimeNormal(n, pattern) {
      var _this2 = this;

      var _locale = this.locale;
      var days = _locale.days;
      var daysShort = _locale.daysShort;
      var months = _locale.months;
      var monthsShort = _locale.monthsShort;

      var foundAMPM = false;

      var year = n.getFullYear();
      var month = n.getMonth();
      var date = n.getDate();
      var weekDay = n.getDay();
      var hours = n.getHours();
      var minutes = n.getMinutes();
      var seconds = n.getSeconds();

      // Build res
      var res = pattern.replace(/((?:am\/pm)|(?:a\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi, function (a, ampm, fmin, fmin2, mmin, mmin2) {

        if (ampm) {
          foundAMPM = true;
          return '[]';
        }

        if (fmin) {
          return fmin + _this2.applyNumberPattern(minutes, '00');
        }

        if (fmin2) {
          return _this2.applyNumberPattern(minutes, '00') + fmin2;
        }

        if (mmin) {
          return mmin + minutes;
        }

        if (mmin2) {
          return minutes + mmin2;
        }

        return '';
      });

      return res.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\[\])/gi, function (a, ss, s, hh, h, dddd, ddd, dd, d, mmmmm, mmmm, mmm, mm, m, yyyy, yy, ampm) {

        if (ss) {
          return _this2.applyNumberPattern(seconds, '00');
        }

        if (s) {
          return seconds;
        }

        if (hh) {
          return _this2.applyNumberPattern(foundAMPM ? hours % 12 : hours, '00');
        }

        if (h) {
          return foundAMPM ? hours % 12 : hours;
        }

        if (dddd) {
          return days[weekDay];
        }

        if (ddd) {
          return daysShort[weekDay];
        }

        if (dd) {
          return _this2.applyNumberPattern(date, '00');
        }

        if (d) {
          return date;
        }

        if (mmmmm) {
          return monthsShort[month][0];
        }

        if (mmmm) {
          return months[month];
        }

        if (mmm) {
          return monthsShort[month];
        }

        if (mm) {
          return _this2.applyNumberPattern(month + 1, '00');
        }

        if (m) {
          return month + 1;
        }

        if (yyyy) {
          return year;
        }

        if (yy) {
          return year.toString().substr(2);
        }

        if (ampm) {
          return hours < 12 ? 'AM' : 'PM';
        }

        return '';
      });
    }
  }, {
    key: 'createTextCode',
    value: function createTextCode(section) {
      var code = new _utils.Code();

      code.append('\n      res.value = {0}.replace(/@/, n);\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createGeneralCode',
    value: function createGeneralCode() {
      var code = new _utils.Code();
      var numberCode = this.createNumberCode('0.00');
      var dateTimeCode = this.createDateTimeCode('[d]');

      code.append('\n      if (type === "Number") {\n        ' + numberCode + '\n      }\n      if (type === "DateTime") {\n        ' + dateTimeCode + '\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createNumberExponentialCode',
    value: function createNumberExponentialCode(exponentialMatch) {
      var patternIntegerPart = exponentialMatch[1];
      var patternDecimalPart = exponentialMatch[2];
      var patternPowPart = exponentialMatch[3];
      var code = new _utils.Code();
      var integerPart = void 0;
      var decimalPart = void 0;

      var zerosCount = function zerosCount(s) {
        return s.match(/0|\?|#/g).length;
      };

      // Integer part
      if (!patternIntegerPart) {
        patternIntegerPart = '#';
        integerPart = 1;
      } else {
        integerPart = zerosCount(patternIntegerPart);
      }

      // Decimal part
      if (!patternDecimalPart) {
        patternDecimalPart = '';
        decimalPart = 0;
      } else {
        decimalPart = zerosCount(patternDecimalPart);
      }

      code.append('\n      result.value = this.formatAsNumberExponential(n, {0}, {1}, {2}, {3}, {4});\n    ', integerPart, decimalPart, patternIntegerPart, patternDecimalPart, patternPowPart);

      return code.toString();
    }
  }, {
    key: 'createNumberFractialCode',
    value: function createNumberFractialCode(fractialMatch) {
      var code = new _utils.Code();
      var patternNumeratorPart = fractialMatch[1] || '#';
      var patternDenominatorPart = fractialMatch[2] || '#';
      // TODO watch here
      var zeroPos = patternNumeratorPart.length - 1;

      while (patternNumeratorPart[zeroPos] === '0' && patternNumeratorPart[zeroPos] !== '?' && patternNumeratorPart[zeroPos] !== '#' && patternNumeratorPart[zeroPos] !== ' ' && zeroPos > 0) {
        zeroPos--;
      }

      var leftPatternNumeratorPart = patternNumeratorPart.substr(0, zeroPos);
      var rightPatternNumeratorPart = patternNumeratorPart.substr(zeroPos);

      if (!leftPatternNumeratorPart) {
        code.append('\n        result.value = this.formatAsNumberFractial(n, {0}, {1});\n      ', rightPatternNumeratorPart, patternDenominatorPart);
      }
      // Mixed fraction
      else {
          code.append('\n        result.value = this.formatAsNumberFractialMixed(n, {0}, {1}, {2});\n      ', leftPatternNumeratorPart, rightPatternNumeratorPart, patternDenominatorPart);
        }

      return code.toString();
    }
  }, {
    key: 'createNumberDecimalCode',
    value: function createNumberDecimalCode(decimalMatch) {
      var code = new _utils.Code();
      var patternIntegerPart = decimalMatch[1] || '0';
      var patternDecimalPart = decimalMatch[2] || '';
      var decimals = void 0;
      var factor = 1;

      var zerosCount = function zerosCount(s) {
        return s.match(/0|\?|#/g).length;
      };

      if (!patternDecimalPart) {
        decimals = 0;
      } else {
        decimals = zerosCount(patternDecimalPart);
      }

      // Spaces before .
      patternIntegerPart = patternIntegerPart.replace(/(0|#|\?)(,+)([^0?#]*)$/, function (a, m1, m2, m3) {
        factor *= Math.pow(1000, m2.length);
        return m1 + m3;
      });

      if (factor !== 1) {
        code.append('\n        n /= {0};\n      ', factor);
      }

      code.append('\n      result.value = this.formatAsNumberDecimal(n, {0}, {1}, {2});\n    ', decimals, patternIntegerPart, patternDecimalPart);

      return code.toString();
    }
  }, {
    key: 'createNumberIntegerCode',
    value: function createNumberIntegerCode(section) {
      var code = new _utils.Code();

      code.append('\n      n = Math.round(n);\n      result.value = this.applyNumberPattern(n, {0});\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createNumberCode',
    value: function createNumberCode(section, shouldAbsNumber) {
      var numberCode = new _utils.Code();

      // Abs
      if (shouldAbsNumber) {
        numberCode.append('\n        n = Math.abs(n);\n      ');
      }

      // Exponential form regexp
      var exponentialMatch = section.match(/(.*?)(?:\.(.*?))?e(?:\+|\-)(.*)/i);

      if (exponentialMatch) {

        // Exponential form
        numberCode.append(this.createNumberExponentialCode(exponentialMatch));
      } else {
        var factor = 1;

        // Spaces before end
        section = section.replace(/(0|#|\?)(\s+)([^0?#]*)$/, function (a, m1, m2, m3) {
          factor *= Math.pow(1000, m2.length);
          return m1 + m3;
        });

        // Percents
        var percentMatch = section.match(/%/g);
        if (percentMatch) {
          factor /= Math.pow(100, percentMatch.length);
        }

        // Factor
        if (factor !== 1) {
          numberCode.append('\n          n /= {0};\n        ', factor);
        }

        var fractialMatch = void 0;
        var decimalMatch = void 0;

        switch (true) {

          // Fractial form
          case !!(fractialMatch = section.match(/(.*?)\/(.*)/)):
            numberCode.append(this.createNumberFractialCode(fractialMatch));
            break;

          // Decimal form
          case !!(decimalMatch = section.match(/(.*?)\.(.*)/)):
            numberCode.append(this.createNumberDecimalCode(decimalMatch));
            break;

          // Integer form
          default:
            numberCode.append(this.createNumberIntegerCode(section));

        }
      }

      // Final code
      var code = new _utils.Code();

      // Parse to float
      code.append('\n      n = parseFloat(n);\n    ');

      // Checks
      code.append('\n      if (!isNaN(n)) {\n        if (n >= 1e21 || n <= -1e21) {\n          result.value = n.toString().toUpperCase();\n        }\n        else {\n          ' + numberCode + '\n        }\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createDateTimeElapsedCode',
    value: function createDateTimeElapsedCode(section) {
      var code = new _utils.Code();

      var foundDays = /d/i.test(section);
      var foundHours = /h/i.test(section);
      var foundMinutes = /m/i.test(section);

      code.append('\n      result.value = this.formatAsDateTimeElapsed(n, {0}, {1}, {2}, {3});\n    ', foundDays, foundHours, foundMinutes, section);

      return code.toString();
    }
  }, {
    key: 'createDateTimeNormalCode',
    value: function createDateTimeNormalCode(section) {
      var code = new _utils.Code();

      code.append('\n      result.value = this.formatAsDateTimeNormal(n, {0});\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createDateTimeCode',
    value: function createDateTimeCode(section) {
      var code = new _utils.Code();
      var elapsed = false;

      section = section.replace(/\[(h+?|m+?|s+?|y+?)]/ig, function (a, m1) {
        elapsed = true;
        return m1;
      });

      var dateTimeCode = elapsed ? this.createDateTimeElapsedCode(section) : this.createDateTimeNormalCode(section);

      code.append('\n      n = new Date(n);\n      if (!isNaN(n.getTime())) {\n        ' + dateTimeCode + '\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createSectionCode',
    value: function createSectionCode(section, sectionIndex, sectionsCount) {
      // Start creating code for function
      var code = new _utils.Code();

      var condition = void 0;
      var shouldAbsNumber = false;

      // Find condition for sector or add standard sector condition (positive number, negative number, etc.)
      var conditionMatch = section.match(/\[((?:>|>=|<|<=|=|<>)[0-9\.]+?)]/);

      switch (true) {

        // Found condition
        case !!conditionMatch:
          var cond = conditionMatch[1].replace(/<>/, '!=').replace('/=/', '==');
          condition = 'type == "Number" && parseFloat(n)' + cond;
          break;

        // Standard condition for first section of 3+
        case sectionIndex === 0 && sectionsCount > 2:
          condition = 'type == "Number" && parseFloat(n) > 0';
          break;

        // Standard condition for first section of 2
        case sectionIndex === 0 && sectionsCount === 2:
          condition = 'type == "Number" && parseFloat(n) >= 0';
          break;

        // Standard condition for negative number
        case sectionIndex === 1:
          condition = 'type == "Number" && parseFloat(n) < 0';
          shouldAbsNumber = true;
          break;

      }

      // Text color
      var colorMatch = section.match(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/i);
      if (colorMatch) {
        code.append('\n        result.color = {0};\n      ', colorMatch[1]);
      }

      // Remove all [], except our replacements and elapsed days, hours, minutes, seconds
      section = section.replace(/(\[((?!((\$*?)|(d*?)|(h*?)|(m*?)|(s*?))]).*?)])/, '');

      // Format code
      var formatCode = new _utils.Code();

      // Defaults
      formatCode.append('\n      result.value = {0};\n      result.pattern = {0};\n    ', section);

      switch (true) {

        // General format
        case /General/i.test(section):
          formatCode.append(this.createGeneralCode(section));
          break;

        // Text
        case /@/.test(section):
          formatCode.append(this.createTextCode(section));
          break;

        // Number
        case /#|\?|0/.test(section):
          if (!condition) {
            condition = 'type === "Number"';
          }
          formatCode.append(this.createNumberCode(section, shouldAbsNumber));
          break;

        // DateTime
        case /h|m|s|y|d/i.test(section):
          if (!condition) {
            condition = 'type === "DateTime"';
          }
          formatCode.append(this.createDateTimeCode(section));
          break;

      }

      // Add return statement
      formatCode.append('\n      return makeResult.call(this);\n    ');

      // Build final section code
      if (condition) {
        code.append('\n        // Section\n        if (' + condition + ') {\n          ' + formatCode + '\n        }\n        // End section\n      ');
      } else {
        code.append('\n        // Section\n        ' + formatCode + '\n        // End section\n      ');
      }

      return code.toString();
    }
  }, {
    key: 'createPatternCode',
    value: function createPatternCode(pattern) {
      var _this3 = this;

      var origins = [];
      var replaces = '';

      // Find quotes, slash symbols
      var patternReplaced = pattern.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, function (a, m1, m2, m3) {
        // Quote found
        if (m1) {
          origins.push(m1.replace(/("|'|\\)/g, "\\$1"));
          return '[' + (replaces += '$') + ']';
        }
        // Slash found
        if (m2) {
          origins.push(m2.replace(/("|'|\\)/g, "\\$1"));
          return '[' + (replaces += '$') + ']';
        }
        // Space found
        if (m3) {
          origins.push(' ');
          return '[' + (replaces += '$') + ']';
        }
        return '';
      });

      // Split pattern to sections
      var sections = patternReplaced.split(/;/);

      // Init code
      var code = new _utils.Code();

      // Start variables
      code.append('\n      var result = {\n        value: "",\n        align: type === "Number" || type === "DateTime" ? "right" : "",\n        color: "",\n        pattern: ""\n      };\n\n      function makeResult() {\n        var origins = {0};\n        result.value = this.restoreOrigins(result.value, origins);\n        result.pattern = this.restoreOrigins(result.pattern, origins);\n        return result;\n      };\n    ', origins);

      // Remove unnesessary sections
      sections = sections.slice(0, 4);

      // Loop trough sections
      sections.forEach(function (section, sectionIndex) {
        return code.append(_this3.createSectionCode(section, sectionIndex, sections.length));
      });

      return code.toString();
    }
  }, {
    key: 'format',
    value: function format(n, type, pattern) {
      this.log('Input:');
      this.log('n = ' + n + ', type = ' + type + ', pattern = ' + pattern);

      n = n.toString();
      pattern = pattern.toString();

      // Find predefined format
      if (this.locale.formats[pattern]) {
        pattern = this.locale.formats[pattern];
      }

      // Create function
      if (!this.memoized[pattern]) {
        var code = this.createPatternCode(pattern);

        // Transform code
        code = this.opts.transformCode(code);

        // Memoize function
        this.memoized[pattern] = Function('n', 'type', code);

        // Log code
        this.log('Code:');
        this.log(code);
      }

      // Call function
      var result = this.memoized[pattern].call(this, n, type);

      // Log result
      this.log('Result:');
      this.log(result);

      return result;
    }
  }]);

  return DataFormatter;
}();

;

// Create instance
var dataFormatter = new DataFormatter();

// Add AMD support
if (typeof define === 'function' && define.amd) {
  define('dataFormatter', function () {
    return dataFormatter;
  });
  define('DataFormatter', function () {
    return DataFormatter;
  });
}
// CommonJS
else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
    module.exports = dataFormatter;
    module.exports.DataFormatter = DataFormatter;
  }
  // Window
  else {
      global.dataFormatter = dataFormatter;
      global.DataFormatter = DataFormatter;
    }