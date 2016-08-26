const { assert } = require('chai');
const df = new (require('../lib'))();

describe('Text', ()=> {

  it('Text', ()=> {
    assert.equal(df.format('23434', 'Text', '0.0').value, '0.0');
    assert.equal(df.format('test', 'Text', '1@1').value, '1test1');
  });

});
