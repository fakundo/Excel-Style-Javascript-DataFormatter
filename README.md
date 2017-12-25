# Excel-Style Javascript Data Formatter

[![npm](https://img.shields.io/npm/v/excel-style-dataformatter.svg?maxAge=2592000)](https://www.npmjs.org/package/excel-style-dataformatter)

## Current version supports
- Number formatting (decimal form, fractional form, percents, etc.)
- Date formatting (elapsed time, am/pm)
- Predefined excel formats (Fixed, Standard, etc.)
- Localization

# Install

```
npm install excel-style-dataformatter
```

```
bower install excel-style-dataformatter
```

# Usage

## CommonJS

```js
import DataFormatter from 'excel-style-dataformatter';
const dataFormatter = new DataFormatter();
const result = dataFormatter.format('99', 'Number', 'Currency');
```

#### With locales
```js
import DataFormatter from 'excel-style-dataformatter';
import ru from 'excel-style-dataformatter/lib/ru';

// Create instance with defined locales
const options = { locales: [ru] };
const dataFormatter = new DataFormatter(options);

// Switch locale
dataFormatter.setLocale('ru');

const result = dataFormatter.format('99', 'Number', 'Currency');
```

## Browser

```html
<script src="excel-style-dataformatter/lib/index.js"></script>
<script src="excel-style-dataformatter/lib/locales/ru.js"></script>
<script>
  // Create instance
  var dataFormatter = new window.DataFormatter({
    locales: [window.DataFormatter_ru]
  });

  // Default locale
  document.write(dataFormatter.format('123.44', 'Number', 'Currency').value);

  // Switch to russian
  dataFormatter.setLocale('ru');
  document.write(dataFormatter.format('123.44', 'Number', 'Currency').value);
</script>
```

## AMD

```html
<script>
  require(['excel-style-dataformatter/lib/index', 'excel-style-dataformatter/lib/locales/ru'], function() {

    require(['DataFormatter', 'DataFormatter_ru'], function(DataFormatter, ru) {
      // Create instance
      var dataFormatter = new DataFormatter({ 
        locales: [ru] 
      });

      // Default locale
      document.write(dataFormatter.format('99', 'Number', 'Currency').value);

      // Switch to russian
      dataFormatter.setLocale('ru');
      document.write(dataFormatter.format('99', 'Number', 'Currency').value);
    });

  });
</script>
```

# Available options
```
locale {string} - default locale
locales {string} - defined locales
UTCOffset {number|null} - UTC offset for dates in minutes
transformCode {function}
debug {boolean}
```

# API

* `.format(value, type, format)`
* `.defineLocales(locales)`
* `.setLocale(locale)`
* `.setUTCOffset(offset)`
