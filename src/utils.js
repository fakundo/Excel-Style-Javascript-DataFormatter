/**
 * Invokes func for every element
 */
export function each(obj, func) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      func(obj[key], key);
    }
  }
};

/**
 * Transform values
 */
export function map(obj, func) {
  var res = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      res.push(func(obj[key], key));
    }
  }
  return res;
};

/**
 * Extends object
 */
export function extend(a, ...b) {
  for(let i = 0; i < b.length; i++) {
    for (let j in b[i]) {
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
export function formatString(s, ...args) {
  return s.replace(/{(\d+)}/g, (match, number)=>
    typeof args[number] != 'undefined' ? args[number] : match
  );
};

/**
 * Class for building code
 */
export class Code {

  constructor(opts = {}) {
    // Default opts
    this.opts = extend({
      debug: false
    }, opts);

    this.code = '';
  }

  makeString(s, ...values) {
    values = map(values, (val)=> JSON.stringify(val));
    return formatString(s, ...values);
  };

  append() {
    this.code += this.makeString(...arguments);
    if (this.opts.debug) this.code += '\n';
  }

  toString() {
    return this.code;
  }

  appendRaw(str) {
    this.code += str;
  }

};
