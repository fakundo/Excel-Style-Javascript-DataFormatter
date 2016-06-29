'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dataformatter = function () {
  function Dataformatter() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Dataformatter);

    // Set default options
    this.opts = (0, _utils.extend)({
      locale: 'ru',
      debug: false
    }, opts);

    this.setLocale(this.opts.locale);
  }

  _createClass(Dataformatter, [{
    key: 'setLocale',
    value: function setLocale(locale) {
      var localeData = require('./locales/' + locale + '.js');
      this.locale = localeData.default;
      // Clear saved memoized functions
      this.memoized = {};
    }
  }, {
    key: 'initCode',
    value: function initCode() {
      var debug = this.opts.debug;

      return new _utils.Code({ debug: debug });
    }
  }, {
    key: 'createGCDFunctionCode',
    value: function createGCDFunctionCode() {
      var code = this.initCode();

      code.append('\n      function gcd() {\n        let r;\n        while (b) {\n          r = a % b;\n          a = b;\n          b = r;\n        }\n        return a;\n      };\n    ');

      return code.toString();
    }
  }, {
    key: 'createFillNumberPatternFunctionCode',
    value: function createFillNumberPatternFunctionCode() {
      var code = this.initCode();

      code.append('\n      function fillNumberPattern(n, pattern, direction) {\n        var i, j, mostLeftDigit, ref, ref1, ref2, ref3, ref4, ref5, s, separateThousands;\n\n        n = n.toString();\n        s = \'\';\n        if (direction === \'right\') {\n          j = 0;\n          i = -1;\n          while (++i < pattern.length) {\n            switch (pattern[i]) {\n              case \'0\':\n                s += (ref = n[j]) != null ? ref : \'0\';\n                j++;\n                break;\n              case \'#\':\n                s += (ref1 = n[j]) != null ? ref1 : \'\';\n                j++;\n                break;\n              case \'?\':\n                s += (ref2 = n[j]) != null ? ref2 : \' \';\n                j++;\n                break;\n              case \'[\':\n                while (i < pattern.length && pattern[i] !== \']\') {\n                  s += pattern[i];\n                  i++;\n                }\n                i--;\n                break;\n              default:\n                s += pattern[i];\n            }\n          }\n        } else {\n          // Should we separate thousands\n          separateThousands = false;\n          pattern = pattern.replace(/(0|#|?)(,+?)(0|#|?)/g, function(a, m1, m2, m3) {\n            separateThousands = true;\n            return m1 + m3;\n          });\n          // Add separation\n          if (separateThousands) {\n            j = n.length - 3;\n            while ((n[0] === \'-\' ? j > 1 : j > 0)) {\n              n = n.substr(0, j) + DataFormatter.locale.thousands_separator + n.substr(j);\n              j -= 3;\n            }\n          }\n          j = n.length - 1;\n          i = pattern.length;\n          while (i--) {\n            switch (pattern[i]) {\n              case \'0\':\n                s = ((ref3 = n[j]) != null ? ref3 : \'0\') + s;\n                mostLeftDigit = i;\n                j--;\n                break;\n              case \'#\':\n                s = ((ref4 = n[j]) != null ? ref4 : \'\') + s;\n                mostLeftDigit = i;\n                j--;\n                break;\n              case \'?\':\n                s = ((ref5 = n[j]) != null ? ref5 : \' \') + s;\n                mostLeftDigit = i;\n                j--;\n                break;\n              case \']\':\n                while (i > 0 && pattern[i] !== \'[\') {\n                  s = pattern[i] + s;\n                  i--;\n                }\n                i++;\n                break;\n              default:\n                s = pattern[i] + s;\n            }\n          }\n          // Add remaining digits, example: n=1234, ptrn=00, result must be 1234 instead of 34\n          if (j >= 0 && mostLeftDigit !== null) {\n            s = s.substr(0, mostLeftDigit) + n.substr(0, j + 1) + s.substr(mostLeftDigit);\n          }\n        }\n        return s;\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createRestoreOriginsFunctionCode',
    value: function createRestoreOriginsFunctionCode(s, repl) {
      var code = this.initCode();

      code.append('\n      function restoreOrigins(s, origins) {\n        return s = s.replace(/[(?:($*?)|(.*?))]/g, function(a, m1) {\n          if (m1 && repl[m1.length]) {\n            return repl[m1.length];\n          } else {\n            return \'\';\n          }\n        });\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createGeneralFormatCode',
    value: function createGeneralFormatCode() {
      var code = this.initCode();

      code.append('\n      res.value = n;\n      if (type == \'Number\') {\n        if (!isNaN(n) && n != \'\') {\n          if (n < 1e21 && n > -1e21) {\n            n = parseFloat(n);\n            res.value = n;\n            if (n != parseInt(n / 1)) {\n              res.value = (Math.round(n*100)/100).toString().replace(/\\./, {0});\n            }\n          }\n          else {\n            res.value = n.toString().toUpperCase();\n          }\n        }\n      }\n      else if(type == \'DateTime\' && !isNaN((new Date(n)).getTime())){\n        res.value = Math.abs(\n          (new Date(n)).getTime()-(new Date(\'1899-12-31T00:00:00.000\')).getTime()\n        )/1000/60/60/24;\n      }\n    ', this.locale.decimalSeparator);

      return code.toString();
    }
  }, {
    key: 'createTextCode',
    value: function createTextCode(section) {
      var code = this.initCode();

      // Replace @
      code.append('\n      res.value = {0}.replace(/@/, n);\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createNumberExponentialCode',
    value: function createNumberExponentialCode(exponentialMatch) {
      var patternIntegerPart = exponentialMatch[1];
      var patternFractialPart = exponentialMatch[2];
      var patternPowPart = exponentialMatch[3];
      var patternSignPart = exponentialMatch[4] || '';
      var code = this.initCode();
      var integerPart = void 0;
      var fractialPart = void 0;

      var zerosCount = function zerosCount(s) {
        return s.match(/0|\?|#/g).length;
      };

      // Integer part
      if (!patternIntegerPart) {
        patternIntegerPart = '#';
        integerPart = 10;
      } else {
        integerPart = Math.pow(10, zerosCount(patternIntegerPart));
      }

      // Fractial part
      if (!patternPowPart) {
        patternPowPart = '';
        fractialPart = 1;
      } else {
        fractialPart = Math.pow(10, zerosCount(patternPowPart));
      }

      // Integer part
      code.append('\n      var m = 0;\n      var sign = n < 0 ? -1 : 1;\n\n      n = Math.abs(n);\n\n      if (n != 0) {\n\n       while(n < {1} || Math.round(n * {0}) / {0} < {1}){\n         n *= 10;\n         m ++;\n       }\n\n       while(n >= {1} || Math.round(n * {0}) / {0} >= {1}){\n         n /= 10;\n         m --;\n       }\n      }\n\n      n = (Math.round(n * sign * {0}) / {0}).toString().split(\'.\');\n\n      res.value = fillNumberPattern(parseInt(n[0]), {2});\n    ', fractialPart, integerPart, patternIntegerPart);

      // Fractial part
      if (patternFractialPart) {
        code.append('\n        res.value += {0};\n      ', this.locale.decimalSeparator);

        if (patternPowPart) {
          code.append('\n          res.value += fillNumberPattern(parseInt(n[1] ? n[1] : 0, {0}, \'right\'));\n        ', patternPowPart);
        }
      }

      // Pow part
      code.append('\n      res.value += \'E\' + (m > 0 ? \'-\' : \'+\') + fillNumberPattern(Math.abs(m), {0});\n    ', patternSignPart);

      return code.toString();
    }
  }, {
    key: 'createNumberFractialCode',
    value: function createNumberFractialCode(fractialMatch) {
      var code = this.initCode();
      var patternIntegerPart = fractialMatch[1] || '#';
      var patternFractialPart = fractialMatch[2] || '#';
      // TODO watch here
      var zeroPos = patternIntegerPart.length - 1;

      while (patternIntegerPart[zeroPos] === '0' && patternIntegerPart[zeroPos] !== '?' && patternIntegerPart[zeroPos] !== '#' && patternIntegerPart[zeroPos] !== ' ' && zeroPos > 0) {
        zeroPos--;
      }

      var leftPatternIntegerPart = patternIntegerPart.substr(0, zeroPos);
      var rightPatternIntegerPart = patternIntegerPart.substr(zeroPos);

      if (!leftPatternIntegerPart) {
        code.append('\n        var m = n.toString().split(".");\n        m = m[1] ? Math.pow(10, m[1].length) : 1;\n        n = Math.floor(n * m);\n\n        var factor= gcd(n, m);\n        res.value = fillNumberPattern(n / factor, {0}) + \'/\' + fillNumberPattern(m / factor, {1});\n      ', rightPatternIntegerPart, patternFractialPart);
      } else {
        code.append('\n        var f = 0;\n        var c = 1;\n        var factor = 1;\n        var m = n.toString().split(\'.\');\n\n        if (m[1]) {\n          c = Math.pow(10, m[1].length);\n          f = parseInt(m[1]);\n          factor = DataFormatter.gcd(f, c);\n        }\n\n        res.value = fillNumberPattern(Math.floor(n), {0}) + fillNumberPattern(f / factor, {1}) + \'/\' + fillNumberPattern(c / factor, {2});\n\n      ', leftPatternIntegerPart, rightPatternIntegerPart, patternFractialPart);
      }

      return code.toString();
    }
  }, {
    key: 'createNumberDecimalCode',
    value: function createNumberDecimalCode(decimalMatch) {
      var code = this.initCode();
      var patternIntegerPart = decimalMatch[1] || '0';
      var patternFractialPart = decimalMatch[2] || '';
      var fractialPart = void 0;
      var factor = 1;

      var zerosCount = function zerosCount(s) {
        return s.match(/0|\?|#/g).length;
      };

      if (!patternFractialPart) {
        fractialPart = '';
      } else {
        fractialPart = Math.pow(10, zerosCount(patternFractialPart));
      }

      // Spaces before .
      patternIntegerPart = patternIntegerPart.replace(/(0|#|\?)(,+)([^0?#]*)$/, function (a, m1, m2, m3) {
        factor *= Math.pow(1000, m2.length);
        return m1 + m3;
      });

      if (factor !== 1) {
        code.append('\n        n /= {0};\n      ', factor);
      }

      code.append('\n      n = (Math.round(n * {0}) / {0}).toString().split(\'.\');\n\n      res.value = fillNumberPattern(parseInt(n[0]), {1}) + {2} + fillNumberPattern(parseInt(n[1] || 0), {3}, \'right\');\n    ', fractialPart, patternIntegerPart, this.locale.decimalSeparator, patternFractialPart);

      return code.toString();
    }
  }, {
    key: 'createNumberIntegerCode',
    value: function createNumberIntegerCode(section) {
      var code = this.initCode();

      code.append('\n      res.value = fillNumberPattern(Math.round(n), {0});\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createNumberCode',
    value: function createNumberCode(section, shouldAbsNumber) {
      var code = this.initCode();

      // Parse to float
      code.append('n = parseFloat(n);');

      // Abs number
      if (shouldAbsNumber) {
        code.append('n = Math.abs(n);');
      }

      // Exponential form regexp
      var exponentialMatch = section.match(/(.*?)(?:(\.)(.*?))?e(?:\+|\-)(.*)/i);

      if (exponentialMatch) {
        code.appendRaw(this.createNumberExponentialCode(exponentialMatch));
      } else {
        var factor = 1;

        // Spaces before end
        section = section.replace(/(0|#|\?)(,+)([^0?#]*)$/, function (a, m1, m2, m3) {
          factor *= Math.pow(1000, m2.length);
          return m1 + m2;
        });

        // Percents
        var percentMatch = section.match(/%/g);
        if (percentMatch) {
          factor /= Math.pow(100, percentMatch.length);
        }

        // Factor
        if (factor !== 1) {
          code.append('\n          n /= {0};\n        ', factor);
        }

        var fractialMatch = void 0;
        var decimalMatch = void 0;

        switch (true) {

          // Fractial form
          case !!(fractialMatch = section.match(/(.*?)\/(.*)/)):
            code.appendRaw(this.createNumberFractialCode(fractialMatch));
            break;

          // Decimal form
          case !!(decimalMatch = section.match(/(.*?)\.(.*)/)):
            code.appendRaw(this.createNumberDecimalCode(decimalMatch));
            break;

          // Integer form
          default:
            code.appendRaw(this.createNumberIntegerCode(section));
            break;

        }

        code.append('\n        if (n >= 1e21 || n <= -1e21) {\n          res.value = n.toString().toUpperCase();\n        }\n      ');
      }

      // TODO condition HERE

      return code.toString();
    }
  }, {
    key: 'createDateTimeElapsedCode',
    value: function createDateTimeElapsedCode(section) {
      var code = this.initCode();

      code.append('\n      var m;\n      var foundHours;\n      var foundMinutes;\n\n      n = Math.abs(n.getTime() - (new Date(\'1899-12-31T00:00:00.000\')).getTime());\n    ');

      // Remove days, months, years from pattern
      section = section.replace(/a|p|am|pm|mmm|mmmm|mmmmm|d|y/gi, '');

      if (/h/i.test(section)) {
        code.append('foundHours = true;');
      }

      if (/m/i.test(section)) {
        code.append('foundMinutes = true;');
      }

      code.append('\n      res.value = {0}.replace(/(hh)|(h)|(mm)|(m)|(ss)|(s)/gi, function(a, hh, h, mm, m, ss, s) {\n\n        if (hh) {\n          return (m = parseInt(n/1000/60/60))<10 ? \'0\' + m : m;\n        }\n        if (h) {\n          return parseInt(n/1000/60/60);\n        }\n        if (mm) {\n          m = foundHours ? parseInt(n/1000/60%60) : parseInt(n/1000/60);\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (m) {\n          m = foundHours ? parseInt(n/1000/60%60) : parseInt(n/1000/60);\n          return m;\n        }\n        if (ss) {\n          m = foundMinutes ? parseInt(n/1000%60) : parseInt(n/1000);\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (s) {\n          m = foundMinutes ? parseInt(n/1000%60) : parseInt(n/1000);\n          return m;\n        }\n\n        return \'\';\n      });\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createDateTimeNormalCode',
    value: function createDateTimeNormalCode(section) {
      var code = this.initCode();

      code.append('\n      var foundAMPM\n      res.value = {0}.replace(/((?:am\\/pm)|(?:a\\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi, function(a, ampm, fmin, fmin2, mmin, mmin2){\n\n        if (ampm) {\n          foundAMPM = true;\n          return \'[]\';\n        }\n        if (fmin) {\n          m = n.getMinutes();\n          return fmin + (m < 10 ? \'0\' + m : m);\n        }\n        if (fmin2) {\n          m = n.getMinutes();\n          return (m < 10 ? \'0\' + m : m) + fmin2;\n        }\n        if (mmin) {\n          return mmin + n.getMinutes();\n        }\n        if (mmin2) {\n          return n.getMinutes() + mmin2;\n        }\n        return \'\';\n      });\n\n      res.value = res.value.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\\[])/gi, function(a, ss, s, hh, h, dddd, ddd, dd, d, mmmmm, mmmm, mmm, mm, m, yyyy, yy, ampm){\n\n        if (ss) {\n          m = n.getSeconds();\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (s) {\n          return n.getSeconds();\n        }\n        if (hh) {\n          m = n.getHours();\n          if (foundAMPM) m=m % 12;\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (h) {\n          if (foundAMPM) m=m % 12;\n          return n.getHours();\n        }\n        if (hh) {\n          m=n.getHours();\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (dddd) {\n          return DataFormatter.locale.days[n.getDay()];\n        }\n        if (ddd) {\n          return DataFormatter.locale.days_short[n.getDay()];\n        }\n        if (dd) {\n          m = n.getDate();\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (d) {\n          return n.getDate();\n        }\n        if (mmmmm) {\n          return DataFormatter.locale.months_short[n.getMonth()][0];\n        }\n        if (mmmm) {\n          return DataFormatter.locale.months[n.getMonth()];\n        }\n        if (mmm) {\n          return DataFormatter.locale.months_short[n.getMonth()];\n        }\n        if (mm) {\n          m=n.getMonth()+1;\n          return m < 10 ? \'0\' + m : m;\n        }\n        if (m) {\n          return n.getMonth() + 1;\n        }\n        if (yyyy) {\n          return n.getFullYear();\n        }\n        if (yy) {\n          return n.getFullYear().toString().substr(2);\n        }\n        if (ampm) {\n          return n.getHours() < 12 ? \'AM\' : \'PM\';\n        }\n        return \'\';\n      });\n    ', section);

      return code.toString();
    }
  }, {
    key: 'createDateTimeCode',
    value: function createDateTimeCode(section) {
      var code = this.initCode();
      var elapsed = false;

      section = section.replace(/\[(h+?|m+?|s+?|y+?)]/ig, function (a, m1) {
        elapsed = true;
        return m1;
      });

      var dateTimeCode = elapsed ? this.createDateTimeElapsedCode(section) : this.createDateTimeNormalCode(section);

      // TODO check is date

      code.append('\n      if (!isNaN((new Date(n)).getTime())) {\n        n = new Date(n);\n        ' + dateTimeCode + '\n      }\n    ');

      return code.toString();
    }
  }, {
    key: 'createSectionCode',
    value: function createSectionCode(section, sectionIndex, sectionsCount) {
      this.log('Start section:', section);

      // Start creating code for function
      var code = this.initCode();

      var condition = void 0;
      var shouldAbsNumber = false;

      // Find condition for sector or add standard sector condition (positive number, negative number, etc.)
      var conditionMatch = section.match(/\[((?:>|>=|<|<=|=|<>)[0-9\.]+?)]/);

      switch (true) {

        // Found condition
        case !!conditionMatch:
          var cond = conditionMatch[1].replace(/<>/, '!=').replace('/=/', '==');
          condition = code.makeString('type == "Number" && n' + cond);
          break;

        // Standard condition for positive number
        case sectionIndex === 0 && sectionsCount > 2:
          condition = code.makeString('type == "Number" && n > 0');
          break;

        // Standard condition for first section of two
        case sectionIndex === 0 && sectionsCount > 1:
          condition = code.makeString('type == "Number" && n >= 0');
          break;

        // Standard condition for negative number
        case sectionIndex === 1 && sectionsCount > 2:
          condition = code.makeString('type == "Number" && n < 0');
          shouldAbsNumber = true;
          break;

        // Otherwise
        case sectionIndex === 2 && sectionsCount > 3:
          condition = code.makeString('type == "Number"');
          break;

      }

      // By default value = section
      code.append('var res={value:{0}};', section);

      // Alignment
      code.append('if (type == "Number" || type == "DateTime") res.align = "right";');

      // Text color
      var colorMatch = section.match(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/i);
      if (colorMatch) {
        code.append('res.color={0}', colorMatch[1]);
      }

      // Remove all [], except our replacements and elapsed hours, minutes, seconds
      section = section.replace(/(\[((?!((\$*?)|(h*?)|(m*?)|(s*?))]).*?)])/, '');

      switch (true) {

        // General format
        case /General/i.test(section):
          code.appendRaw(this.createGeneralFormatCode());
          break;

        // Text
        case /@/.test(section):
          code.appendRaw(this.createTextCode(section));
          break;

        // Number
        case /#|\?|0/.test(section):
          code.appendRaw(this.createNumberCode(section, shouldAbsNumber));
          break;

        // DateTime
        case /h|m|s|y/i.test(section):
          code.appendRaw(this.createDateTimeCode(section));
          break;

      }

      this.log('Section code:', code.toString());
      return;
    }
  }, {
    key: 'createPatternCode',
    value: function createPatternCode(pattern) {
      var _this = this;

      var origins = [];
      var replaces = '';

      // Find quotes, slash symbols
      var patternReplaced = pattern.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, function (a, m1, m2, m3) {
        // Quote found
        if (m1) {
          //origins += ",\"" + (m1.replace(/("|'|\\)/g, "\\$1")) + "\"";
          origins.push(m1.replace(/("|'|\\)/g, "\\$1"));
          return '[' + (replaces += '$') + ']';
        }
        // Slash found
        if (m2) {
          //origins += ",\"" + (m2.replace(/("|'|\\)/g, "\\$1")) + "\"";
          origins.push(m2.replace(/("|'|\\)/g, "\\$1"));
          return '[' + (replaces += '$') + ']';
        }
        // Space found
        if (m3) {
          //origins += '," "';
          origins.push(' ');
          return '[' + (replaces += '$') + ']';
        }
        return '';
      });

      // Split pattern to sections
      var sections = patternReplaced.split(/;/);

      // Init code
      var code = this.initCode();

      // Append replaced origins to code
      code.append('var origins = {0};', origins);

      // Remove unnesessary sections
      sections = sections.slice(0, 4);

      // Loop trough sections
      (0, _utils.each)(sections, function (section, sectionIndex) {
        return _this.createSectionCode(section, sectionIndex, sections.length);
      });
    }
  }, {
    key: 'format',
    value: function format(n, type, pattern) {
      this.log('Input: n=' + n + ', type=' + type + ', pattern=' + pattern);

      n = n.toString();
      pattern = pattern.toString();

      // Find predefined format
      if (this.locale.formats[pattern]) {
        pattern = this.locale.formats[pattern];
      }

      // Return memoized function
      if (this.memoized[pattern]) {
        return this.memoized[pattern];
      }
      // Or create new
      else {
          this.createPatternCode(pattern);
        }
    }
  }, {
    key: 'log',
    value: function log() {
      if (this.opts.debug) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    }
  }]);

  return Dataformatter;
}();

;

// Create instance
var inst = new Dataformatter({ debug: true });

// Add AMD support
if (typeof define === 'function' && define.amd) {
  define('dataformatter', function () {
    return inst;
  });
}
// CommonJS
else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
    module.exports = inst;
  }
  // Window
  else {
      global.dataformatter = inst;
    }

//inst.format('123', 'Number', '[Red]0"руб";[Green]0.0\\"hex');

//inst.format('123', 'Number', '[>1000][Red]0;[>100][Green]-0.0;[>10][Blue]0.0000;ccvc@');

//inst.format('123', 'Number', 'General');

//inst.format('123', 'Number', ' 00000  . 0000000   ');

//inst.format('123', 'Number', '00#0/000');

//inst.format('123', 'Number', '###%');

//inst.format('123', 'Number', '000.0000E+0');

//inst.format('2013-05-21T13:12:00.000', 'DateTime', '[hh]:mm:ss');

inst.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd');