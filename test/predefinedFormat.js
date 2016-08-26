const { assert } = require('chai');
const dataFormatter = require('../lib');

describe('Predefined format', ()=> {

  it('General Number', ()=> {
    assert.equal(dataFormatter.format('233.44', 'Number', 'General Number').value, '233.4');
  });

  it('Currency', ()=> {
    assert.equal(dataFormatter.format('99.99', 'Number', 'Currency').value, '$ 99.99');
  });

  it('Fixed', ()=> {
    assert.equal(dataFormatter.format('0.333222', 'Number', 'Fixed').value, '0.33');
  });

  it('Standard', ()=> {
    assert.equal(dataFormatter.format('-100', 'Number', 'Standard').value, '-100.00');
  });

  it('Percent', ()=> {
    assert.equal(dataFormatter.format('0.783', 'Number', 'Percent').value, '78.30%');
  });

  it('Scientific', ()=> {
    assert.equal(dataFormatter.format('134.99', 'Number', 'Scientific').value, '1.35E+02');
  });

  it('Yes/No', ()=> {
    assert.equal(dataFormatter.format('0', 'Number', 'Yes/No').value, 'No');
  });

});
