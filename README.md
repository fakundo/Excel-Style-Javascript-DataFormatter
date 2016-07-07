#Excel-Style Javascript Data Formatter

##Current version supports
- Number formatting (decimal form, fractional form, percents, etc.)
- Date formatting (elapsed time, am/pm)
- Predefined excel formats (Fixed, Standard, etc.)
- Localization

#Install

```
npm install excel-style-dataformatter
```

```
bower install excel-style-dataformatter
```

#Usage

##CommonJS

```js
import dataFormatter from 'excel-style-dataformatter';
const result = dataFormatter.format('99', 'Number', 'Currency');
```

####Creating your own instance
```js
import { DataFormatter } from 'excel-style-dataformatter';
const options = { debug: true };
const dataFormatter = new DataFormatter(options);
const result = dataFormatter.format('123', 'Number', '[Red]0;[Green]0.0');
```

####Available options
```
debug {boolean}
locale {string}
transformCode {function}
UTCOffset {number|null} - UTC offset for dates in minutes
```

##Browser

```html
<!DOCTYPE html>
<html>
<head>
  <script src="dist/excel-style-dataformatter.js"></script>
</head>
<body>
  <script>
    var result = dataFormatter.format('2013-05-22T13:19:59.000','DateTime','yyyy mm dd');
    document.write(result.value);

    // Creating your own instance
    var myDataFormatter = new DataFormatter({ debug: true });
    var myResult = myDataFormatter.format('13.4', 'Number', 'General');
    document.write(myResult.value);
  </script>
</body>
</html>
```

##AMD

```html
<!DOCTYPE html>
<html>
<head>
  <script src="require.js"></script>
</head>
<body>
  <script>
    require(['dist/excel-style-dataformatter.js'], function() {

      require(['dataFormatter', 'DataFormatter'], function(dataFormatter, DataFormatter) {

        var result = dataFormatter.format('Test', 'String', '[>100][Red]0.0;[>10][Green]-0;[Blue]"Zero";@');
        document.write(result.value);

        // Creating your own instance
        var myDataFormatter = new DataFormatter({ debug: true });
        var myResult = myDataFormatter.format('0', 'Number', 'Yes/No');
        document.write(myResult.value);
      });

    });
  </script>
</body>
</html>
```
