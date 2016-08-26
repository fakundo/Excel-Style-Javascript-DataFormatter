const { assert } = require('chai');
const dataFormatter = require('../lib');

describe('Number', ()=> {

  it('Decimal form', ()=> {
    assert.equal(dataFormatter.format('1', 'Number', '0.0').value, '1.0');
    assert.equal(dataFormatter.format('143', 'Number', '0.0#').value, '143.0');
    assert.equal(dataFormatter.format('45.12', 'Number', '0.0#').value, '45.12');
    assert.equal(dataFormatter.format('45.123', 'Number', '0.0').value, '45.1');
    assert.equal(dataFormatter.format('3.3', 'Number', '###.###').value, '3.3');
    assert.equal(dataFormatter.format('-32', 'Number', '#.????').value, '-32.0   ');
    assert.equal(dataFormatter.format('-0.251', 'Number', '#,##0.00').value, '-0.25');
  });

  it('Exponential form', ()=> {
    assert.equal(dataFormatter.format('22.0', 'Number', '0.0E+0').value, '2.2E+1');
    assert.equal(dataFormatter.format('99.9', 'Number', '0E+0').value, '1E+2');
    assert.equal(dataFormatter.format('23.55555', 'Number', '0.000E+0').value, '2.356E+1');
    assert.equal(dataFormatter.format('-18000', 'Number', '0.00E+0').value, '-1.80E+4');
    assert.equal(dataFormatter.format('0.0000034', 'Number', '0.00E+0').value, '3.40E-6');
    assert.equal(dataFormatter.format('0', 'Number', '0E+0').value, '0E+0');
    assert.equal(dataFormatter.format('1000000000', 'Number', '0.0E+0').value, '1.0E+9');
  });

  it('Fractions', ()=> {
    assert.equal(dataFormatter.format('0.75', 'Number', '0/0').value, '3/4');
    assert.equal(dataFormatter.format('13.5', 'Number', '0 0/0').value, '13 1/2');
    assert.equal(dataFormatter.format('-0.5', 'Number', '0/0').value, '-1/2');
    assert.equal(dataFormatter.format('-10.5', 'Number', '0 0/0').value, '-10 1/2');
  });

  it('Integer', ()=> {
    assert.equal(dataFormatter.format('123', 'Number', '0 ').value, '0');
    assert.equal(dataFormatter.format('123', 'Number', '0').value, '123');
    assert.equal(dataFormatter.format('123', 'Number', '0%').value, '12300%');
    assert.equal(dataFormatter.format('123', 'Number', '0_-_-_-').value, '123   ');
    assert.equal(dataFormatter.format('123', 'Number', '0\\asd').value, '123asd');
    assert.equal(dataFormatter.format('123', 'Number', 'asd').value, 'asd');
    assert.equal(dataFormatter.format('123', 'Number', '0-0').value, '12-3');
    assert.equal(dataFormatter.format('123000', 'Number', '0,0-0').value, '123 00-0');
    assert.equal(dataFormatter.format('123000', 'Number', '0,0-0 ').value, '12-3');
    assert.equal(dataFormatter.format('-0', 'Number', '#').value, '0');
  });

  it('Division spaces', ()=> {
    assert.equal(dataFormatter.format('9322', 'Number', '### .###').value, '9.322');
    assert.equal(dataFormatter.format('9322', 'Number', '###.### ').value, '9.322');
  });

  it('Percents', ()=> {
    assert.equal(dataFormatter.format('0.453', 'Number', '0.0%').value, '45.3%');
    assert.equal(dataFormatter.format('0.453', 'Number', '0.0%%').value, '4530.0%%');
    assert.equal(dataFormatter.format('53', 'Number', '0.##%').value, '5300.0%');
    assert.equal(dataFormatter.format('432', 'Number', '0.## %').value, '43.2%');
    assert.equal(dataFormatter.format('-10', 'Number', '0%').value, '-1000%');
  });

});
