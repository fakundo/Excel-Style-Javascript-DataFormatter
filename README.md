Excel-Style Javascript Data Formatter
==================================================

Current version supports:
--------------------------------------
1. Number formatting (decimal form, fractional form, percents, etc.)
2. Date formatting (elapsed time, am/pm)
3. Predefined excel formats (Fixed, Standard, etc.)
4. Localization

Usage:
--------------------------------------
```js
DataFormatter.format("12.34","Number","0.0") //12.3
DataFormatter.format("99.99","Number","Currency") //99,99р.
DataFormatter.format("-18000","Number","0.00E+0") //-1,80E+4
DataFormatter.format("0.0000034","Number","0.00E+0") //3,40E-6
DataFormatter.format("0.453","Number","0.0%") //45,3%
DataFormatter.format("9322","Number","### .##") //9,32
DataFormatter.format("123000","Number","0,0-0") //123 00-0

DataFormatter.format("2013-05-22T13:19:59.000","DateTime","yyyy mm dd") //2013 05 22
DataFormatter.format("2013-05-21T13:12:00.000","DateTime","hh-mm-ss am/pm") //05-12-00 PM
DataFormatter.format("2013-05-21T13:12:00.000","DateTime","[hh]:mm:ss") //993973:12:00

DataFormatter.format("123","Number","[Red]0;[Green]0.0") //123
DataFormatter.format("tet","String","[>100][Red]0;[>10][Green]-0.0;[Blue]0.0000;ccvc@") //ccvctet
```