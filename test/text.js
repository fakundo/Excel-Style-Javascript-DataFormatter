const { assert } = require('chai');
const dataFormatter = require('../lib');

describe('Text', ()=> {

  it('Text', ()=> {
    assert.equal(dataFormatter.format('23434', 'Text', '0.0').value, '0.0');
    assert.equal(dataFormatter.format('test', 'Text', '1@1').value, '1test1');
  });

});
