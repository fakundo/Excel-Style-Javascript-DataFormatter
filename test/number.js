const { assert } = require('chai');
const dataFormatter = require('../lib');

describe('Number', ()=> {

  it('Decimal form', ()=> {
    assert.equal(dataFormatter.format('1', 'Number', '0.0').value, '1,0');
    assert.equal(dataFormatter.format('143', 'Number', '0.0#').value, '143,0');
    assert.equal(dataFormatter.format('45.12', 'Number', '0.0#').value, '45,12');
    assert.equal(dataFormatter.format('45.123', 'Number', '0.0').value, '45,1');
    assert.equal(dataFormatter.format('3.3', 'Number', '###.###').value, '3,3');
    assert.equal(dataFormatter.format('-32', 'Number', '#.????').value, '-32,0   ');
    assert.equal(dataFormatter.format('9322', 'Number', '### .###').value, '9,322');
    assert.equal(dataFormatter.format('9322', 'Number', '###.### ').value, '9,322');
  });

});
