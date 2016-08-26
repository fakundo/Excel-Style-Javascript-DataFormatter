const { assert } = require('chai');
const df = new (require('../lib'))();

describe('General', ()=> {

  it('Number', ()=> {
    assert.equal(df.format('13.4', 'Number', 'General').value, '13.40');
  });

  it('DateTime', ()=> {
    assert.equal(df.format('2016-07-03T22:11:23.709', 'DateTime', 'General').value, '42553');
  });

});
