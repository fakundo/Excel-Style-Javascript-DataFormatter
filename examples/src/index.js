import beautify from 'js-beautify';
import { DataFormatter } from '../../lib';

let dataFormatter = new DataFormatter({
  debug: true,
  UTCOffset: 0,
  transformCode: beautify
});

dataFormatter.format('40', 'Number', '[>10][Red]0;[Green]-0.0;[Blue]0.0000');
