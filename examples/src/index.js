import beautify from 'js-beautify';
import { DataFormatter } from '../../lib';

let dataFormatter = new DataFormatter({
  debug: false,
  transformCode: beautify
});

//console.log(dataFormatter.format('-1.2433', 'Number', 'Currency'))
//console.log(dataFormatter.format('-1.2433', 'Number', 'General'))
//console.log(dataFormatter.format('1', 'Number', '[Red]@asd'))
//console.log(dataFormatter.format('0.75', 'Number', '0/0'))
//console.log(dataFormatter.format('13.5', 'Number', '0 0/0'))
//console.log(dataFormatter.format('4222.3', 'Number', '00.#E+00'))
//console.log(dataFormatter.format('-18000', 'Number', '0.00E+0'))
//console.log(dataFormatter.format('0.0000034', 'Number', '0.00E+0'))
//console.log(dataFormatter.format('2013-05-22T13:19:59.000', 'DateTime', 'yyyy mm dd'))
//console.log(dataFormatter.format('2013-05-22T13:19:59.000', 'DateTime', '"Elapsed" [hh] "hours and" [mm] "minutes"'))
//console.log(dataFormatter.format('99.99', 'Number', '#,##0.00р.;[Red]-#,##0.00р.'))
//dataFormatter.format(30, "Number", '[Red]"Да";"Да";"Нет"');
//dataFormatter.format(-30, "Number", '"Да";"Нет"');
dataFormatter.format('9322', 'Number', '###.###');

// TODO add test for TEXT
// TODO во всех тестах указывать ТАЙМЗОНУ!!!
// TODO добавить англ локаль
// TODO добавить нормальное описани в package.json и README.md
