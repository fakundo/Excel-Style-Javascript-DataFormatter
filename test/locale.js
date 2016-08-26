const { assert } = require('chai');
const df = new (require('../lib'))();
const ru = require('../lib/locales/ru');

df.defineLocales([ ru ]);

describe('Locale', ()=> {

  it('Set locale', ()=> {
    df.setLocale('ru');
    assert.equal(df.format('1', 'Number', 'Yes/No').value, 'Да');

    df.setLocale('en-US');
    assert.equal(df.format('1', 'Number', 'Yes/No').value, 'Yes');

    df.setLocale('elven');
    assert.equal(df.format('1', 'Number', 'Yes/No').value, 'Yes');
  });

});
