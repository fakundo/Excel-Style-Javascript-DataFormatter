const { assert } = require('chai');
const dataFormatter = require('../lib');

dataFormatter.setUTCOffset(0);

describe('DateTime', ()=> {

  it('Elapsed', ()=> {
    assert.equal(dataFormatter.format('2013-05-21T13:12:00.000', 'DateTime', '[hh]:mm:ss').value, '993946:12:00');
  });

  it('Normal', ()=> {
    assert.equal(dataFormatter.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd').value, '2013 05 22');
    assert.equal(dataFormatter.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd am/pm').value, '2013 05 22 PM');
    assert.equal(dataFormatter.format('2013-05-21T13:12:00.000', 'DateTime', 'hh-mm-ss').value, '13-12-00');
    assert.equal(dataFormatter.format('2013-05-21T13:12:00.000', 'DateTime', 'hh-mm-ss am/pm').value, '01-12-00 PM');
  });

});
