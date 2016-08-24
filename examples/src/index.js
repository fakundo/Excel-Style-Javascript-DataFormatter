import beautify from 'js-beautify';
import { DataFormatter } from '../../lib';

let dataFormatter = new DataFormatter({
  debug: true,
  UTCOffset: 0,
  transformCode: beautify
});

dataFormatter.format('2000', 'Number', '0.0E+0');
