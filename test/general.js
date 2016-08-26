const { assert } = require('chai');
const dataFormatter = require('../lib');

describe('General', ()=> {

  it('Number', ()=> {
    assert.equal(dataFormatter.format('13.4', 'Number', 'General').value, '13.40');
  });

  it('DateTime', ()=> {
    assert.equal(dataFormatter.format('2016-07-03T22:11:23.709', 'DateTime', 'General').value, '42553');
  });

});
