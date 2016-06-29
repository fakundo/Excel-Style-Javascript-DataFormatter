import { Code, gcd, each, extend } from './utils';

class Dataformatter {

  constructor(opts = {}) {
    // Set default options
    this.opts = extend({
      locale: 'ru',
      debug: false
    }, opts);

    this.setLocale(this.opts.locale);
  }

  setLocale(locale) {
    const localeData = require('./locales/' + locale + '.js');
    this.locale = localeData.default;
    // Clear saved memoized functions
    this.memoized = {};
  }

  initCode() {
    const { debug } = this.opts;
    return new Code({ debug });
  }

  createGCDFunctionCode() {
    let code = this.initCode();

    code.append(`
      function gcd() {
        let r;
        while (b) {
          r = a % b;
          a = b;
          b = r;
        }
        return a;
      };
    `);

    return code.toString();
  }

  createFillNumberPatternFunctionCode() {
    let code = this.initCode();

    code.append(`
      function fillNumberPattern(n, pattern, direction) {
        var i, j, mostLeftDigit, ref, ref1, ref2, ref3, ref4, ref5, s, separateThousands;

        n = n.toString();
        s = '';
        if (direction === 'right') {
          j = 0;
          i = -1;
          while (++i < pattern.length) {
            switch (pattern[i]) {
              case '0':
                s += (ref = n[j]) != null ? ref : '0';
                j++;
                break;
              case '#':
                s += (ref1 = n[j]) != null ? ref1 : '';
                j++;
                break;
              case '?':
                s += (ref2 = n[j]) != null ? ref2 : ' ';
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
          // Should we separate thousands
          separateThousands = false;
          pattern = pattern.replace(/(0|#|\?)(,+?)(0|#|\?)/g, function(a, m1, m2, m3) {
            separateThousands = true;
            return m1 + m3;
          });
          // Add separation
          if (separateThousands) {
            j = n.length - 3;
            while ((n[0] === '-' ? j > 1 : j > 0)) {
              n = n.substr(0, j) + DataFormatter.locale.thousands_separator + n.substr(j);
              j -= 3;
            }
          }
          j = n.length - 1;
          i = pattern.length;
          while (i--) {
            switch (pattern[i]) {
              case '0':
                s = ((ref3 = n[j]) != null ? ref3 : '0') + s;
                mostLeftDigit = i;
                j--;
                break;
              case '#':
                s = ((ref4 = n[j]) != null ? ref4 : '') + s;
                mostLeftDigit = i;
                j--;
                break;
              case '?':
                s = ((ref5 = n[j]) != null ? ref5 : ' ') + s;
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
            s = s.substr(0, mostLeftDigit) + n.substr(0, j + 1) + s.substr(mostLeftDigit);
          }
        }
        return s;
      }
    `);

    return code.toString();
  }

  createRestoreOriginsFunctionCode(s, repl) {
    let code = this.initCode();

    code.append(`
      function restoreOrigins(s, origins) {
        return s = s.replace(/\[(?:(\$*?)|(.*?))\]/g, function(a, m1) {
          if (m1 && repl[m1.length]) {
            return repl[m1.length];
          } else {
            return '';
          }
        });
      }
    `);

    return code.toString();
  }

  createGeneralFormatCode() {
    let code = this.initCode();

    code.append(`
      res.value = n;
      if (type == 'Number') {
        if (!isNaN(n) && n != '') {
          if (n < 1e21 && n > -1e21) {
            n = parseFloat(n);
            res.value = n;
            if (n != parseInt(n / 1)) {
              res.value = (Math.round(n*100)/100).toString().replace(/\\./, {0});
            }
          }
          else {
            res.value = n.toString().toUpperCase();
          }
        }
      }
      else if(type == 'DateTime' && !isNaN((new Date(n)).getTime())){
        res.value = Math.abs(
          (new Date(n)).getTime()-(new Date('1899-12-31T00:00:00.000')).getTime()
        )/1000/60/60/24;
      }
    ` , this.locale.decimalSeparator);

    return code.toString();
  }

  createTextCode(section) {
    let code = this.initCode();

    // Replace @
    code.append(`
      res.value = {0}.replace(/@/, n);
    `, section);

    return code.toString();
  }

  createNumberExponentialCode(exponentialMatch) {
    let patternIntegerPart = exponentialMatch[1];
    let patternFractialPart = exponentialMatch[2];
    let patternPowPart = exponentialMatch[3];
    let patternSignPart = exponentialMatch[4] || '';
    let code = this.initCode();
    let integerPart;
    let fractialPart;

    let zerosCount = (s)=> s.match(/0|\?|#/g).length;

    // Integer part
    if (!patternIntegerPart) {
      patternIntegerPart = '#';
      integerPart = 10;
    }
    else {
      integerPart = Math.pow(10, zerosCount(patternIntegerPart));
    }

    // Fractial part
    if (!patternPowPart) {
      patternPowPart = '';
      fractialPart = 1;
    }
    else {
      fractialPart = Math.pow(10, zerosCount(patternPowPart));
    }

    // Integer part
    code.append(`
      var m = 0;
      var sign = n < 0 ? -1 : 1;

      n = Math.abs(n);

      if (n != 0) {

       while(n < {1} || Math.round(n * {0}) / {0} < {1}){
         n *= 10;
         m ++;
       }

       while(n >= {1} || Math.round(n * {0}) / {0} >= {1}){
         n /= 10;
         m --;
       }
      }

      n = (Math.round(n * sign * {0}) / {0}).toString().split('.');

      res.value = fillNumberPattern(parseInt(n[0]), {2});
    `, fractialPart, integerPart, patternIntegerPart);

    // Fractial part
    if (patternFractialPart) {
      code.append(`
        res.value += {0};
      `, this.locale.decimalSeparator);

      if (patternPowPart) {
        code.append(`
          res.value += fillNumberPattern(parseInt(n[1] ? n[1] : 0, {0}, 'right'));
        `, patternPowPart);
      }
    }

    // Pow part
    code.append(`
      res.value += 'E' + (m > 0 ? '-' : '+') + fillNumberPattern(Math.abs(m), {0});
    `, patternSignPart);

    return code.toString();
  }

  createNumberFractialCode(fractialMatch) {
    let code = this.initCode();
    let patternIntegerPart = fractialMatch[1] || '#';
    let patternFractialPart = fractialMatch[2] || '#';
    // TODO watch here
    let zeroPos = patternIntegerPart.length - 1;

    while (
      patternIntegerPart[zeroPos] === '0' &&
      patternIntegerPart[zeroPos] !== '?' &&
      patternIntegerPart[zeroPos] !== '#' &&
      patternIntegerPart[zeroPos] !== ' ' &&
      zeroPos > 0
    ) {
      zeroPos --;
    }

    let leftPatternIntegerPart = patternIntegerPart.substr(0, zeroPos);
    let rightPatternIntegerPart = patternIntegerPart.substr(zeroPos);

    if (!leftPatternIntegerPart) {
      code.append(`
        var m = n.toString().split(".");
        m = m[1] ? Math.pow(10, m[1].length) : 1;
        n = Math.floor(n * m);

        var factor= gcd(n, m);
        res.value = fillNumberPattern(n / factor, {0}) + '/' + fillNumberPattern(m / factor, {1});
      `,
        rightPatternIntegerPart,
        patternFractialPart
      );
    }
    else {
      code.append(`
        var f = 0;
        var c = 1;
        var factor = 1;
        var m = n.toString().split('.');

        if (m[1]) {
          c = Math.pow(10, m[1].length);
          f = parseInt(m[1]);
          factor = DataFormatter.gcd(f, c);
        }

        res.value = fillNumberPattern(Math.floor(n), {0}) + fillNumberPattern(f / factor, {1}) + '/' + fillNumberPattern(c / factor, {2});

      `,
        leftPatternIntegerPart,
        rightPatternIntegerPart,
        patternFractialPart
      );
    }

    return code.toString();
  }

  createNumberDecimalCode(decimalMatch) {
    let code = this.initCode();
    let patternIntegerPart = decimalMatch[1] || '0';
    let patternFractialPart = decimalMatch[2] || '';
    let fractialPart;
    let factor = 1;

    let zerosCount = (s)=> s.match(/0|\?|#/g).length;

    if (!patternFractialPart) {
      fractialPart = '';
    }
    else {
      fractialPart = Math.pow(10, zerosCount(patternFractialPart));
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
      n = (Math.round(n * {0}) / {0}).toString().split('.');

      res.value = fillNumberPattern(parseInt(n[0]), {1}) + {2} + fillNumberPattern(parseInt(n[1] || 0), {3}, 'right');
    `,
      fractialPart,
      patternIntegerPart,
      this.locale.decimalSeparator,
      patternFractialPart
    );

    return code.toString();
  }

  createNumberIntegerCode(section) {
    let code = this.initCode();

    code.append(`
      res.value = fillNumberPattern(Math.round(n), {0});
    `, section);

    return code.toString();
  }

  createNumberCode(section, shouldAbsNumber) {
    let code = this.initCode();

    // Parse to float
    code.append(`n = parseFloat(n);`);

    // Abs number
    if (shouldAbsNumber) {
      code.append(`n = Math.abs(n);`);
    }

    // Exponential form regexp
    let exponentialMatch = section.match(/(.*?)(?:(\.)(.*?))?e(?:\+|\-)(.*)/i);

    if (exponentialMatch) {
      code.appendRaw(this.createNumberExponentialCode(exponentialMatch));
    }
    else {
      let factor = 1;

      // Spaces before end
      section = section.replace(/(0|#|\?)(,+)([^0?#]*)$/, (a, m1, m2, m3)=> {
        factor *= Math.pow(1000, m2.length);
        return m1 + m2;
      });

      // Percents
      let percentMatch = section.match(/%/g);
      if (percentMatch) {
        factor /= Math.pow(100, percentMatch.length);
      }

      // Factor
      if (factor !== 1) {
        code.append(`
          n /= {0};
        `, factor);
      }

      let fractialMatch;
      let decimalMatch;

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

      code.append(`
        if (n >= 1e21 || n <= -1e21) {
          res.value = n.toString().toUpperCase();
        }
      `);
    }

    // TODO condition HERE


    return code.toString();
  }

  createDateTimeElapsedCode(section) {
    let code = this.initCode();

    code.append(`
      var m;
      var foundHours;
      var foundMinutes;

      n = Math.abs(n.getTime() - (new Date('1899-12-31T00:00:00.000')).getTime());
    `);

    // Remove days, months, years from pattern
    section = section.replace(/a|p|am|pm|mmm|mmmm|mmmmm|d|y/gi, '');

    if (/h/i.test(section)) {
      code.append(`foundHours = true;`);
    }

    if (/m/i.test(section)) {
      code.append(`foundMinutes = true;`);
    }

    code.append(`
      res.value = {0}.replace(/(hh)|(h)|(mm)|(m)|(ss)|(s)/gi, function(a, hh, h, mm, m, ss, s) {

        if (hh) {
          return (m = parseInt(n/1000/60/60))<10 ? '0' + m : m;
        }
        if (h) {
          return parseInt(n/1000/60/60);
        }
        if (mm) {
          m = foundHours ? parseInt(n/1000/60%60) : parseInt(n/1000/60);
          return m < 10 ? '0' + m : m;
        }
        if (m) {
          m = foundHours ? parseInt(n/1000/60%60) : parseInt(n/1000/60);
          return m;
        }
        if (ss) {
          m = foundMinutes ? parseInt(n/1000%60) : parseInt(n/1000);
          return m < 10 ? '0' + m : m;
        }
        if (s) {
          m = foundMinutes ? parseInt(n/1000%60) : parseInt(n/1000);
          return m;
        }

        return '';
      });
    `, section);

    return code.toString();
  }

  createDateTimeNormalCode(section) {
    let code = this.initCode();

    code.append(`
      var foundAMPM
      res.value = {0}.replace(/((?:am\\/pm)|(?:a\\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi, function(a, ampm, fmin, fmin2, mmin, mmin2){

        if (ampm) {
          foundAMPM = true;
          return '[]';
        }
        if (fmin) {
          m = n.getMinutes();
          return fmin + (m < 10 ? '0' + m : m);
        }
        if (fmin2) {
          m = n.getMinutes();
          return (m < 10 ? '0' + m : m) + fmin2;
        }
        if (mmin) {
          return mmin + n.getMinutes();
        }
        if (mmin2) {
          return n.getMinutes() + mmin2;
        }
        return '';
      });

      res.value = res.value.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\\[])/gi, function(a, ss, s, hh, h, dddd, ddd, dd, d, mmmmm, mmmm, mmm, mm, m, yyyy, yy, ampm){

        if (ss) {
          m = n.getSeconds();
          return m < 10 ? '0' + m : m;
        }
        if (s) {
          return n.getSeconds();
        }
        if (hh) {
          m = n.getHours();
          if (foundAMPM) m=m % 12;
          return m < 10 ? '0' + m : m;
        }
        if (h) {
          if (foundAMPM) m=m % 12;
          return n.getHours();
        }
        if (hh) {
          m=n.getHours();
          return m < 10 ? '0' + m : m;
        }
        if (dddd) {
          return DataFormatter.locale.days[n.getDay()];
        }
        if (ddd) {
          return DataFormatter.locale.days_short[n.getDay()];
        }
        if (dd) {
          m = n.getDate();
          return m < 10 ? '0' + m : m;
        }
        if (d) {
          return n.getDate();
        }
        if (mmmmm) {
          return DataFormatter.locale.months_short[n.getMonth()][0];
        }
        if (mmmm) {
          return DataFormatter.locale.months[n.getMonth()];
        }
        if (mmm) {
          return DataFormatter.locale.months_short[n.getMonth()];
        }
        if (mm) {
          m=n.getMonth()+1;
          return m < 10 ? '0' + m : m;
        }
        if (m) {
          return n.getMonth() + 1;
        }
        if (yyyy) {
          return n.getFullYear();
        }
        if (yy) {
          return n.getFullYear().toString().substr(2);
        }
        if (ampm) {
          return n.getHours() < 12 ? 'AM' : 'PM';
        }
        return '';
      });
    `, section);

    return code.toString();
  }

  createDateTimeCode(section) {
    let code = this.initCode();
    let elapsed = false;

    section = section.replace(/\[(h+?|m+?|s+?|y+?)]/ig, (a, m1)=> {
      elapsed = true;
      return m1;
    });

    let dateTimeCode = elapsed ?
                       this.createDateTimeElapsedCode(section) :
                       this.createDateTimeNormalCode(section);

    // TODO check is date

    code.append(`
      if (!isNaN((new Date(n)).getTime())) {
        n = new Date(n);
        ${dateTimeCode}
      }
    `);

    return code.toString();
  }

  createSectionCode(section, sectionIndex, sectionsCount) {
    this.log('Start section:', section);

    // Start creating code for function
    let code = this.initCode();

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
        condition = code.makeString(`type == "Number" && n${cond}`);
        break;

      // Standard condition for positive number
      case sectionIndex === 0 && sectionsCount > 2:
        condition = code.makeString(`type == "Number" && n > 0`);
        break;

      // Standard condition for first section of two
      case sectionIndex === 0 && sectionsCount > 1:
        condition = code.makeString(`type == "Number" && n >= 0`);
        break;

      // Standard condition for negative number
      case sectionIndex === 1 && sectionsCount > 2:
        condition = code.makeString(`type == "Number" && n < 0`);
        shouldAbsNumber = true;
        break;

      // Otherwise
      case sectionIndex === 2 && sectionsCount > 3:
        condition = code.makeString(`type == "Number"`);
        break;

    }

    // By default value = section
    code.append(`var res={value:{0}};`, section);

    // Alignment
    code.append(`if (type == "Number" || type == "DateTime") res.align = "right";`);

    // Text color
    let colorMatch = section.match(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/i);
    if (colorMatch) {
      code.append(`res.color={0}`, colorMatch[1]);
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

  createPatternCode(pattern) {
    let origins = [];
    let replaces = '';

    // Find quotes, slash symbols
    let patternReplaced = pattern.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, function(a, m1, m2, m3) {
      // Quote found
      if (m1) {
        //origins += ",\"" + (m1.replace(/("|'|\\)/g, "\\$1")) + "\"";
        origins.push(m1.replace(/("|'|\\)/g, "\\$1"));
        return `[${(replaces += '$')}]`;
      }
      // Slash found
      if (m2) {
        //origins += ",\"" + (m2.replace(/("|'|\\)/g, "\\$1")) + "\"";
        origins.push(m2.replace(/("|'|\\)/g, "\\$1"));
        return `[${(replaces += '$')}]`
      }
      // Space found
      if (m3) {
        //origins += '," "';
        origins.push(' ');
        return `[${(replaces += '$')}]`;
      }
      return '';
    });

    // Split pattern to sections
    let sections = patternReplaced.split(/;/);

    // Init code
    let code = this.initCode();

    // Append replaced origins to code
    code.append('var origins = {0};', origins);

    // Remove unnesessary sections
    sections = sections.slice(0, 4);

    // Loop trough sections
    each(sections, (section, sectionIndex)=>
      this.createSectionCode(section, sectionIndex, sections.length)
    );
  }

  format(n, type, pattern) {
    this.log(`Input: n=${n}, type=${type}, pattern=${pattern}`);

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

  log() {
    if (this.opts.debug) {
      console.log(...arguments);
    }
  }

};


// Create instance
const inst = new Dataformatter({ debug: true });

// Add AMD support
if (typeof define === 'function' && define.amd) {
  define('dataformatter', ()=> inst);
}
// CommonJS
else if (typeof module === 'object' && module.exports) {
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
