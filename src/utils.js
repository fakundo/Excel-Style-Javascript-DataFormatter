/**
 * Format string like sprintf() in PHP
 */
export function formatString(s, ...args) {
  return s.replace(/{(\d+)}/g, (match, number)=>
    typeof args[number] != 'undefined' ? args[number] : match
  );
}

/**
 * Class for building code
 */
export class Code {

  constructor() {
    this.code = '';
  }

  makeString(s, ...values) {
    values = values.map(JSON.stringify);
    return formatString(s, ...values);
  }

  append() {
    this.code += this.makeString(...arguments);
  }

  toString() {
    return this.code;
  }

}
