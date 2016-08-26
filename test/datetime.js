const { assert } = require('chai');
const df = new (require('../lib'))();

df.setUTCOffset(0);

describe('DateTime', ()=> {

  it('Elapsed', ()=> {
    assert.equal(df.format('2013-05-21T13:12:00.000', 'DateTime', '[hh]:mm:ss').value, '993946:12:00');
  });

  it('Normal', ()=> {
    assert.equal(df.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd').value, '2013 05 22');
    assert.equal(df.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd am/pm').value, '2013 05 22 PM');
    assert.equal(df.format('2013-05-21T13:12:00.000', 'DateTime', 'hh-mm-ss').value, '13-12-00');
    assert.equal(df.format('2013-05-21T13:12:00.000', 'DateTime', 'hh-mm-ss am/pm').value, '01-12-00 PM');
  });

});
