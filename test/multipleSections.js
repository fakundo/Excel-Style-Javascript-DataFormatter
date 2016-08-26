const { assert } = require('chai');
const df = new (require('../lib'))();

describe('Multiple Sections', ()=> {

  it('Two sections', ()=> {
    assert.equal(df.format('123', 'Number', '[Red]0;[Green]-0.0').value, '123');
    assert.equal(df.format('0', 'Number', '[Red]0;[Green]-0.0').value, '0');
    assert.equal(df.format('-10', 'Number', '[Red]0;[Green]-0.0').value, '-10.0');
  });

  it('Three sections', ()=> {
    assert.equal(df.format('10', 'Number', '[Red]0;[Green]-0.0;[Blue]0.0000').value, '10');
    assert.equal(df.format('0', 'Number', '[Red]0;[Green]-0.0;[Blue]0.0000').value, '0.0000');
    assert.equal(df.format('-10', 'Number', '[Red]0;[Green]-0.0;[Blue]0.0000').value, '-10.0');
    assert.equal(df.format('5', 'Number', '[>10][Red]0;[Green]-0.0;[Blue]0.0000').value, '5.0000');
    assert.equal(df.format('-5', 'Number', '[>10][Red]0;[Green]-0.0;[Blue]0.0000').value, '-5.0');
    assert.equal(df.format('40', 'Number', '[>10][Red]0;[Green]-0.0;[Blue]0.0000').value, '40');
    assert.equal(df.format('20', 'Number', '[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000').value, '-20.0');
    assert.equal(df.format('140', 'Number', '[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000').value, '140');
    assert.equal(df.format('3', 'Number', '[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000').value, '3.0000');
  });

  it('Four sections', ()=> {
    assert.equal(df.format('3', 'Number', '[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000;ccvc@').value, '3.0000');
    assert.equal(df.format('tet', 'String', '[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000;ccvc@').value, 'ccvctet');
    assert.equal(df.format('30', 'Number', '[>1000][Red]0;[>100][Green]-0.0;[>10][Blue]0.0000;ccvc@').value, '30.0000');
  });

});
