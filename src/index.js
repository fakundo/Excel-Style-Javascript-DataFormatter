import { Code } from './utils';

const defaultLocale = 'en-US';

class DataFormatter {

  /**
   * Constructor
   * Available options are:
   *   debug {boolean} - enable debug mode
   *   UTCOffset {number|null} - UTC offset for dates in minutes
   *   locale {string}
   *   transformCode {function} - code transformer
   * @param {object} options
   */
  constructor({
    debug = false,
    UTCOffset = null,
    locale = defaultLocale,
    transformCode = (code)=> code
  } = {}) {

    this.memoized = {};
    this.debug = debug;
    this.UTCOffset = UTCOffset;
    this.transformCode = transformCode;
    this.zeroDate = this.createDate('1899-12-31T00:00:00.000');

    this.setLocale(locale);
  }

  /**
   * Resets memoized pattern functions
   */
  clearMemoizedFunctions() {
    this.memoized = {};
  }

  /**
   * Sets locale
   * If locale doesn't exist, sets default
   * @param {string} locale
   */
  setLocale(locale) {
    let localeData = require('./locales/' + locale + '.js');
    if (!localeData) {
      localeData = require('./locales/' + defaultLocale + '.js');
    }
    this.locale = localeData.default;
    this.clearMemoizedFunctions();
  }

  /**
   * Sets UTC offset for dates
   * @param {number|null} UTCOffset in minutes
   */
  setUTCOffset(UTCOffset) {
    this.UTCOffset = UTCOffset;
  }

  /**
   * Creates new date instance
   */
  createDate() {
    let date = new Date(...arguments);

    if (this.UTCOffset !== null) {
      let clientOffset = date.getTimezoneOffset();
      let newOffset = this.UTCOffset + clientOffset;
      let newOffsetMs = newOffset * 60 * 1000;

      date.setTime(date.getTime() + newOffsetMs);
    }

    return date;
  }

  /**
   * Logger
   */
  log(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  /**
   * Rounds value
   * @param  {[type]} n        Value to be round
   * @param  {[type]} decimals Amount of decimal digits
   * @return {number}          Rounded value
   */
  roundDecimals(n, decimals) {
    const pow = Math.pow(10, decimals);
    return Math.round(n * pow) / pow;
  }

  /**
   * Greatest common divisor
   */
  gcd(a, b) {
    let r;
    while (b) {
      r = a % b;
      a = b;
      b = r;
    }
    return Math.abs(a);
  }

  applyNumberPattern(n, pattern, direction) {
    n = n.toString();
    let s = '';

    if (direction === 'right') {
      let j = 0;
      let i = -1;
      let patLen = pattern.length

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
    }
    else {
      // Should separate thousands
      let separateThousands = false;
      let mostLeftDigit;

      pattern = pattern.replace(/(0|#|\?)(,+?)(0|#|\?)/g, (a, m1, m2, m3)=> {
        separateThousands = true;
        return m1 + m3;
      });

      // Add separation
      if (separateThousands) {
        let j = n.length - 3;
        while ((n[0] === '-' ? j > 1 : j > 0)) {
          n = n.substr(0, j) + this.locale.thousandSeparator + n.substr(j);
          j -= 3;
        }
      }

      let j = n.length - 1;
      let i = pattern.length;

      while (i--) {
        switch (pattern[i]) {
          case '0':
            s = (n[j] || '0') + s;
            mostLeftDigit = i;
            j--;
            break;
          case '#':
            s = (n[j] || '') + s;
            mostLeftDigit = i;
            j--;
            break;
          case '?':
            s = (n[j] || ' ') + s;
            mostLeftDigit = i;
            j--;
            break;
          case ']':
            while (i > 0 && pattern[i] !== '[') {
              s = pattern[i] + s;
              i--;
            }
            i++;
            break;
          default:
            s = pattern[i] + s;
        }
      }
      // Add remaining digits, example: n=1234, ptrn=00, result must be 1234 instead of 34
      if (j >= 0 && mostLeftDigit !== null) {
        s = s.substr(0, mostLeftDigit) +
            n.substr(0, j + 1) +
            s.substr(mostLeftDigit);
      }
    }

    return s;
  }

  restoreOrigins(value, origins) {
    return value.toString().replace(/\[(?:(\$*?)|(.*?))\]/g, (a, m1)=>
      m1 && origins[m1.length - 1] || a
    );
  }

  formatAsNumberDecimal(n, decimals, patternIntegerPart, patternDecimalPart) {

    n = this.roundDecimals(n, decimals).toString().split('.');
    let integerPart = n[0];
    let decimalPart = n[1] || 0;

    return this.applyNumberPattern(integerPart, patternIntegerPart) +
      this.locale.decimalSeparator +
      this.applyNumberPattern(decimalPart, patternDecimalPart, 'right');
  }

  formatAsNumberFractial(n, patternNumeratorPart, patternDenominatorPart) {
    let m = n.toString().split(".");
    m = m[1] ? Math.pow(10, m[1].length) : 1;
    n = Math.floor(n * m);

    let factor = this.gcd(n, m);

    return this.applyNumberPattern(n / factor, patternNumeratorPart) +
      '/' +
      this.applyNumberPattern(m / factor, patternDenominatorPart);
  }

  formatAsNumberFractialMixed(n, leftPatternNumeratorPart, rightPatternNumeratorPart, patternDenominatorPart) {
    let f = 0;
    let c = 1;
    let factor = 1;
    let m = n.toString().split('.');

    if (m[1]) {
      c = Math.pow(10, m[1].length);
      f = parseInt(m[1]);
      factor = this.gcd(f, c);
    }

    return this.applyNumberPattern(parseInt(n), leftPatternNumeratorPart) +
      this.applyNumberPattern(f / factor, rightPatternNumeratorPart) +
      '/' +
      this.applyNumberPattern(c / factor, patternDenominatorPart);
  }

  formatAsNumberExponential(n, integerPartLength, decimalPartLength, patternIntegerPart, patternDecimalPart, patternPowPart) {

    let sign = n < 0 ? -1 : 1;
    let pow = 0;

    if (n !== 0) {

      n = Math.abs(n);

      let integerPartDivision = Math.pow(10, integerPartLength);

      while(n < integerPartDivision || this.roundDecimals(n, decimalPartLength) < integerPartDivision){
        n *= 10;
        pow ++;
      }

      while(n >= integerPartDivision || this.roundDecimals(n, decimalPartLength) >= integerPartDivision){
        n /= 10;
        pow --;
      }

    }

    n = this.roundDecimals(n * sign, decimalPartLength).toString().split('.');

    // Build res
    let res = '';

    // Integer part
    res += this.applyNumberPattern(parseInt(n[0]), patternIntegerPart);

    // Decimal part
    if (patternDecimalPart) {
      res += this.locale.decimalSeparator +
        this.applyNumberPattern(parseInt(n[1] || 0), patternDecimalPart, 'right');
    }

    // Pow part
    res += 'E' +
      (pow > 0 ? '-' : '+') +
      this.applyNumberPattern(Math.abs(pow), patternPowPart);

    return res;
  }

  formatAsDateTimeElapsed(n, foundDays, foundHours, foundMinutes, pattern) {

    n = Math.abs(n.getTime() - this.zeroDate.getTime());

    let seconds = parseInt(n / 1000);
    let minutes = parseInt(seconds / 60);
    let hours = parseInt(minutes / 60);
    let days = parseInt(hours / 24);

    hours = foundDays ? hours % 24 : hours;
    minutes = foundHours ? minutes % 60 : minutes;
    seconds = foundMinutes ? seconds % 60 : seconds;

    return pattern.replace(/(dd)|(d)|(hh)|(h)|(mm)|(m)|(ss)|(s)/gi, (a, dd, d, hh, h, mm, m, ss, s)=> {

      if (dd) {
        return this.applyNumberPattern(days, '00');
      }

      if (d) {
        return days;
      }

      if (hh) {
        return this.applyNumberPattern(hours, '00');
      }

      if (h) {
        return hours;
      }

      if (mm) {
        return this.applyNumberPattern(minutes, '00');
      }

      if (m) {
        return minutes;
      }

      if (ss) {
        return this.applyNumberPattern(seconds, '00');
      }

      if (s) {
        return seconds;
      }

      return '';
    });
  }

  formatAsDateTimeNormal(n, pattern) {
    let { days, daysShort, months, monthsShort } = this.locale;
    let foundAMPM = false;

    let year = n.getFullYear();
    let month = n.getMonth();
    let date = n.getDate();
    let weekDay = n.getDay();
    let hours = n.getHours();
    let minutes = n.getMinutes();
    let seconds = n.getSeconds();

    // Build res
    let res = pattern.replace(/((?:am\/pm)|(?:a\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi, (a, ampm, fmin, fmin2, mmin, mmin2)=> {

      if (ampm) {
        foundAMPM = true;
        return '[]';
      }

      if (fmin) {
        return fmin + this.applyNumberPattern(minutes, '00');
      }

      if (fmin2) {
        return this.applyNumberPattern(minutes, '00') + fmin2;
      }

      if (mmin) {
        return mmin + minutes;
      }

      if (mmin2) {
        return minutes + mmin2;
      }

      return '';
    });

    return res.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\[\])/gi, (a, ss, s, hh, h, dddd, ddd, dd, d, mmmmm, mmmm, mmm, mm, m, yyyy, yy, ampm)=> {

      if (ss) {
        return this.applyNumberPattern(seconds, '00');
      }

      if (s) {
        return seconds;
      }

      if (hh) {
        return this.applyNumberPattern(foundAMPM ? hours % 12 : hours, '00');
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
        return this.applyNumberPattern(date, '00');
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
        return this.applyNumberPattern(month + 1, '00');
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

  createTextCode(section) {
    let code = new Code();

    code.append(`
      result.value = {0}.replace(/@/, n);
    `, section);

    return code.toString();
  }

  createGeneralCode() {
    let code = new Code();
    let numberCode = this.createNumberCode('#.00');
    let dateTimeCode = this.createDateTimeCode('[d]');

    code.append(`
      if (type === "Number") {
        ${numberCode}
      }
      if (type === "DateTime") {
        ${dateTimeCode}
      }
    `);

    return code.toString();
  }

  createNumberExponentialCode(exponentialMatch) {
    let patternIntegerPart = exponentialMatch[1];
    let patternDecimalPart = exponentialMatch[2];
    let patternPowPart = exponentialMatch[3];
    let code = new Code();
    let integerPartLength;
    let decimalPartLength;

    let zerosCount = (s)=> s.match(/0|\?|#/g).length;

    // Integer part
    if (!patternIntegerPart) {
      patternIntegerPart = '#';
      integerPartLength = 1;
    }
    else {
      integerPartLength = zerosCount(patternIntegerPart);
    }

    // Decimal part
    if (!patternDecimalPart) {
      patternDecimalPart = '';
      decimalPartLength = 0;
    }
    else {
      decimalPartLength = zerosCount(patternDecimalPart);
    }

    code.append(`
      result.value = this.formatAsNumberExponential(n, {0}, {1}, {2}, {3}, {4});
    `,
      integerPartLength,
      decimalPartLength,
      patternIntegerPart,
      patternDecimalPart,
      patternPowPart
    );

    return code.toString();
  }

  createNumberFractialCode(fractialMatch) {
    let code = new Code();
    let patternNumeratorPart = fractialMatch[1] || '#';
    let patternDenominatorPart = fractialMatch[2] || '#';
    // TODO watch here
    let zeroPos = patternNumeratorPart.length - 1;

    while (
      patternNumeratorPart[zeroPos] === '0' &&
      patternNumeratorPart[zeroPos] !== '?' &&
      patternNumeratorPart[zeroPos] !== '#' &&
      patternNumeratorPart[zeroPos] !== ' ' &&
      zeroPos > 0
    ) {
      zeroPos --;
    }

    let leftPatternNumeratorPart = patternNumeratorPart.substr(0, zeroPos);
    let rightPatternNumeratorPart = patternNumeratorPart.substr(zeroPos);

    if (!leftPatternNumeratorPart) {
      code.append(`
        result.value = this.formatAsNumberFractial(n, {0}, {1});
      `,
        rightPatternNumeratorPart,
        patternDenominatorPart
      );
    }
    // Mixed fraction
    else {
      code.append(`
        result.value = this.formatAsNumberFractialMixed(n, {0}, {1}, {2});
      `,
        leftPatternNumeratorPart,
        rightPatternNumeratorPart,
        patternDenominatorPart
      );
    }

    return code.toString();
  }

  createNumberDecimalCode(decimalMatch) {
    let code = new Code();
    let patternIntegerPart = decimalMatch[1] || '0';
    let patternDecimalPart = decimalMatch[2] || '';
    let decimals;
    let factor = 1;

    let zerosCount = (s)=> s.match(/0|\?|#/g).length;

    if (!patternDecimalPart) {
      decimals = 0;
    }
    else {
      decimals = zerosCount(patternDecimalPart);
    }

    // Spaces before .
    patternIntegerPart = patternIntegerPart.replace(/(0|#|\?)(,+)([^0?#]*)$/, (a, m1, m2, m3)=> {
      factor *= Math.pow(1000, m2.length);
      return m1 + m3;
    });

    if (factor !== 1) {
      code.append(`
        n /= {0};
      `, factor);
    }

    code.append(`
      result.value = this.formatAsNumberDecimal(n, {0}, {1}, {2});
    `,
      decimals,
      patternIntegerPart,
      patternDecimalPart
    );

    return code.toString();
  }

  createNumberIntegerCode(section) {
    let code = new Code();

    code.append(`
      n = Math.round(n);
      result.value = this.applyNumberPattern(n, {0});
    `, section);

    return code.toString();
  }

  createNumberCode(section, shouldAbsNumber) {
    let numberCode = new Code();

    // Abs
    if (shouldAbsNumber) {
      numberCode.append(`
        n = Math.abs(n);
      `);
    }

    // Exponential form regexp
    let exponentialMatch = section.match(/(.*?)(?:\.(.*?))?e(?:\+|\-)(.*)/i);

    if (exponentialMatch) {

      // Exponential form
      numberCode.append(this.createNumberExponentialCode(exponentialMatch));

    }
    else {
      let factor = 1;

      // Spaces before end and decimal separator (.)
      section = section.replace(/(0|#|\?)(\s+)([^0?#]*?)($|\.)/, (a, m1, m2, m3, m4)=> {
        factor *= Math.pow(1000, m2.length);
        return m1 + m3 + m4;
      });

      // Percents
      let percentMatch = section.match(/%/g);
      if (percentMatch) {
        factor /= Math.pow(100, percentMatch.length);
      }

      // Factor
      if (factor !== 1) {
        numberCode.append(`
          n /= {0};
        `, factor);
      }

      let fractialMatch;
      let decimalMatch;

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
    let code = new Code();

    // Parse to float
    code.append(`
      n = parseFloat(n);
    `);

    // Checks
    code.append(`
      if (!isNaN(n)) {
        if (n >= 1e21 || n <= -1e21) {
          result.value = n.toString().toUpperCase();
        }
        else {
          ${numberCode}
        }
      }
    `);

    return code.toString();
  }

  createDateTimeElapsedCode(section) {
    let code = new Code();

    let foundDays = /d/i.test(section);
    let foundHours = /h/i.test(section);
    let foundMinutes = /m/i.test(section);

    code.append(`
      result.value = this.formatAsDateTimeElapsed(n, {0}, {1}, {2}, {3});
    `,
      foundDays,
      foundHours,
      foundMinutes,
      section
    );

    return code.toString();
  }

  createDateTimeNormalCode(section) {
    let code = new Code();

    code.append(`
      result.value = this.formatAsDateTimeNormal(n, {0});
    `, section);

    return code.toString();
  }

  createDateTimeCode(section) {
    let code = new Code();
    let elapsed = false;

    section = section.replace(/\[(h+?|m+?|s+?|y+?|d+?)]/ig, (a, m1)=> {
      elapsed = true;
      return m1;
    });

    let dateTimeCode = elapsed ?
                       this.createDateTimeElapsedCode(section) :
                       this.createDateTimeNormalCode(section);

    code.append(`
      n = this.createDate(n);
      if (!isNaN(n.getTime())) {
        ${dateTimeCode}
      }
    `);

    return code.toString();
  }

  createSectionCode(section, sectionIndex, sectionsCount) {
    // Start creating code for function
    let code = new Code();

    let condition;
    let shouldAbsNumber = false;

    // Find condition for sector or add standard sector condition (positive number, negative number, etc.)
    let conditionMatch = section.match(/\[((?:>|>=|<|<=|=|<>)[0-9\.]+?)]/);

    switch(true) {

      // Found condition
      case !!conditionMatch:
        let cond = conditionMatch[1]
          .replace(/<>/, '!=')
          .replace('/=/', '==');
        condition = `type == "Number" && parseFloat(n)${cond}`;
        break;

      // Standard condition for first section of 3+
      case sectionIndex === 0 && sectionsCount > 2:
        condition = `type == "Number" && parseFloat(n) > 0`;
        break;

      // Standard condition for first section of 2
      case sectionIndex === 0 && sectionsCount === 2:
        condition = `type == "Number" && parseFloat(n) >= 0`;
        break;

      // Standard condition for negative number
      case sectionIndex === 1:
        condition = `type == "Number" && parseFloat(n) < 0`;
        shouldAbsNumber = true;
        break;

    }

    // Find text color
    section = section.replace(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/gi, (a, m1)=> {
      code.append(`
        result.color = {0};
      `, m1);
      return '';
    });

    // Remove all [], except our replacements and elapsed days, hours, minutes, seconds
    section = section.replace(/(\[((?!((\$*?)|(d*?)|(h*?)|(m*?)|(s*?))]).*?)])/, '');

    // Format code
    let formatCode = new Code();

    // Defaults
    formatCode.append(`
      result.value = {0};
      result.pattern = {0};
    `, section);

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
    formatCode.append(`
      return makeResult.call(this);
    `);

    // Build final section code
    if (condition) {
      code.append(`
        // Section
        if (${condition}) {
          ${formatCode}
        }
        // End section
      `);
    }
    else {
      code.append(`
        // Section
        ${formatCode}
        // End section
      `);
    }

    return code.toString();
  }

  createPatternCode(pattern) {
    let origins = [];
    let replaces = '';

    // Find quotes, slash symbols
    let patternReplaced = pattern.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, function(a, m1, m2, m3) {
      // Quote found
      if (m1) {
        origins.push(m1.replace(/("|'|\\)/g, "\\$1"));
        return `[${(replaces += '$')}]`;
      }
      // Slash found
      if (m2) {
        origins.push(m2.replace(/("|'|\\)/g, "\\$1"));
        return `[${(replaces += '$')}]`
      }
      // Space found
      if (m3) {
        origins.push(' ');
        return `[${(replaces += '$')}]`;
      }
      return '';
    });

    // Split pattern to sections
    let sections = patternReplaced.split(/;/);

    // Init code
    let code = new Code();

    // Start variables
    code.append(`
      var result = {
        value: "",
        align: type === "Number" || type === "DateTime" ? "right" : "",
        color: "",
        pattern: ""
      };

      function makeResult() {
        var origins = {0};
        result.value = this.restoreOrigins(result.value, origins);
        result.pattern = this.restoreOrigins(result.pattern, origins);
        return result;
      };
    `, origins);

    // Remove unnesessary sections
    sections = sections.slice(0, 4);

    // Loop trough sections
    sections.forEach((section, sectionIndex)=>
      code.append(this.createSectionCode(section, sectionIndex, sections.length))
    );

    // Return statement
    code.append(`
      result.value = {0};
      result.pattern = {0};
      return makeResult.call(this);
    `, patternReplaced);

    return code.toString();
  }

  format(n, type, pattern) {
    this.log(`Input:`);
    this.log(`n = ${n}, type = ${type}, pattern = ${pattern}`);

    n = n.toString();
    pattern = pattern.toString();

    // Find predefined format
    if (this.locale.formats[pattern]) {
      pattern = this.locale.formats[pattern];
    }

    // Create function
    if (!this.memoized[pattern]) {
      let code = this.createPatternCode(pattern);

      // Transform code
      code = this.transformCode(code);

      // Memoize function
      this.memoized[pattern] = Function('n', 'type', code);

      // Log code
      this.log('Code:');
      this.log(code);
    }

    // Call function
    const result = this.memoized[pattern].call(this, n, type);

    // Log result
    this.log('Result:');
    this.log(result);

    return result;
  }

}

// Create instance
const dataFormatter = new DataFormatter();

// CommonJS
module.exports = dataFormatter;
module.exports.DataFormatter = DataFormatter;

// AMD
if (typeof global.define === 'function' && global.define.amd) {
  global.define('dataFormatter', ()=> dataFormatter);
  global.define('DataFormatter', ()=> DataFormatter);
}
// Window
else {
  global.dataFormatter = dataFormatter;
  global.DataFormatter = DataFormatter;
}
