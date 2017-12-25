import beautify from 'js-beautify';
import DataFormatter from '../../dev';

let dataFormatter = new DataFormatter({
  debug: true,
  UTCOffset: 0,
  transformCode: beautify
});

dataFormatter.format('-200056641', 'Number', '#,###,;(#,###,)');
