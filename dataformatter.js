/**
 * DataFormatter - v1.0
 * https://github.com/Fakundo/Excel-Style-Javascript-DataFormatter
 * Copyright (C) 2013 Roman Samoylov
 */
DataFormatter = {

	//saved functions for each pattern
	functions: {},

	//russian locale
	locale: {

		//months
		months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
		months_short: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Сен', 'Окт', 'Ноя', 'Дек'],

		//days
		days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
		days_short: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'], //sunday first

		//separators
		thousands_separator: ' ',
		decimal_separator: ',',

		//excel predefined formats
		formats: {
			'General Number': '#.#',
			'Currency': '#,##0.00р.;[Red]-#,##0.00р.',
			'Fixed': '0.00',
			'Standard': '#,##0.00',
			'Percent': '0.00%',
			'Scientific': '0.00E+00',
			'Yes/No': '"Да";"Да";"Нет"',
			'True/False': '"Истина";"Истина";"Ложь"',
			'On/Off': '"Вкл";"Вкл";"Выкл"'
		}
	},

	/**
	 * Fills pattern with number
	 * @param n - number
	 * @param ptrn - pattern
	 * @param dir - direction, left for integer part, right for fractional part
	 * @returns {string} - result of applying mask
	 */
	fillNumberPattern: function (n, ptrn, dir) {

		n = n.toString();

		var s = '', i, j;

		if (dir == "right") {

			j = 0;

			for (i = 0; i < ptrn.length; i++) {

				switch (ptrn[i]) {

					case '0':
					{
						s += n[j] ? n[j] : '0';
						j++;
						break;
					}
					case '#':
					{
						s += n[j] ? n[j] : '';
						j++;
						break;
					}
					case '?':
					{
						s += n[j] ? n[j] : ' ';
						j++;
						break;
					}
					case '[':
					{
						while (i < ptrn.length && ptrn[i] != ']') {
							s += ptrn[i];
							i++;
						}
						i--;
						break;
					}
					default:
					{
						s += ptrn[i];
					}
				}
			}

		} else {

			var most_left_digit, separate_thousands;

			//should we separate thousands
			ptrn = ptrn.replace(/(0|#|\?)(,+?)(0|#|\?)/g, function (a, m1, m2, m3) {
				separate_thousands = true;
				return m1 + m3;
			});

			//add separation
			if (separate_thousands) {
				for (j = n.length - 3; n[0] == '-' ? j > 1 : j > 0; j -= 3) {
					n = n.substr(0, j) + DataFormatter.locale.thousands_separator + n.substr(j);
				}
			}

			j = n.length - 1;

			for (i = ptrn.length - 1; i >= 0; i--) {

				switch (ptrn[i]) {

					case '0':
					{
						s = (n[j] ? n[j] : '0') + s;
						most_left_digit = i;
						j--;
						break;
					}
					case '#':
					{
						s = (n[j] ? n[j] : '') + s;
						most_left_digit = i;
						j--;
						break;
					}
					case '?':
					{
						s = (n[j] ? n[j] : ' ') + s;
						most_left_digit = i;
						j--;
						break;
					}
					case ']':
					{
						while (i > 0 && ptrn[i] != '[') {
							s = ptrn[i] + s;
							i--;
						}
						i++;
						break;
					}
					default:
					{
						s = ptrn[i] + s;
					}

				}

			}

			//add remaining digits, example: n=1234, ptrn=00, result must be 1234 instead of 34
			if (j >= 0 && most_left_digit != null) {
				s = s.substr(0, most_left_digit) + n.substr(0, j + 1) + s.substr(most_left_digit);
			}
		}

		return s;
	},

	/**
	 * Makes replaces in string
	 * @param s - string for replaces
	 * @param repl - array of replacements
	 * @returns {*}
	 */
	makeReplaces: function (s, repl) {
		return s.replace(/\[(?:(\$*)|(.*))]/g, function (a, m1) {
			return m1 && repl[m1.length] ? repl[m1.length] : '';
		});
	},

	/**
	 * Main function for formatting data
	 * @param n - data
	 * @param type - type of data (Number, DateTime, String)
	 * @param pattern - pattern for data
	 * @returns {*} object {
	 *     value: <result of formatting>
	 *     [,color: <color, example: if ptrn=[Red]00 then color=Red>]
	 *     [,align: <align, =right for numbers>]
	 *   }
	 */
	format: function (n, type, pattern) {

		pattern = pattern.toString();

		//if function for this pattern already exists
		if (DataFormatter.functions[pattern]) return DataFormatter.functions[pattern](n, type);

		var i,
			limit,
			code = '',
			code_tmp,
			ptrn,
			condition,
			abs,
			sectors,
			repl_$ = '',
			repl = '';

		sectors = pattern;

		//predefined excel formats
		if (DataFormatter.locale.formats[sectors]) sectors = DataFormatter.locale.formats[sectors];

		//replace strings in quotes and slashed symbols to $$$, remove unnecessary symbols
		sectors = sectors.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, function (a, m1, m2, m3) {
			//quotes
			if (m1) {
				repl += ',"' + m1.replace(/("|'|\\)/g, "\\$1") + '"';
				return '[' + (repl_$ += '$') + ']';
			}
			//slashes
			if (m2) {
				repl += ',"' + m2.replace(/("|'|\\)/g, "\\$1") + '"';
				return '[' + (repl_$ += '$') + ']';
			}
			//spaces
			if (m3) {
				repl += '," "';
				return '[' + (repl_$ += '$') + ']';
			}
			return '';
		});

		//split pattern to sectors
		sectors = sectors.split(/;/);

		//maximum number of sectors is 4
		limit = Math.min(4, sectors.length);

		//foreach sector
		for (i = 0; i < limit; i++) {

			condition = '';
			abs = false;

			//find condition for sector or add standard sector condition (positive number, negative number, etc.)
			condition = sectors[i].match(/\[((?:>|>=|<|<=|=|<>)[0-9\.]+?)]/);
			if (condition) {
				//found condition
				condition = 'type=="Number" && n' + condition[1].replace(/<>/, '!=').replace(/=/, '==');
			}
			else if (i == 0 && sectors.length > 2) {
				//standard condition for positive number
				condition = 'type=="Number" && n>0';
			}
			else if (i == 0 && sectors.length > 1) {
				//standard condition for first section of two
				condition = 'type=="Number" && n>=0';
			}
			else if (i == 1 && sectors.length > 1) {
				//standard condition for negative number
				condition = 'type=="Number" && n<0';
				//abs for standard negative sector
				abs = true;
			}
			else if (i == 2 && sectors.length > 3) {
				//otherwise
				condition = 'type=="Number"';
			}

			//start creating code for function
			code_tmp = 'var res={value:"' + sectors[i] + '"}, repl=[' + repl + '];\n';

			//text color
			if (ptrn = sectors[i].match(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/i)) {
				code_tmp += 'res.color="' + ptrn[1] + '";\n';
			}

			//remove all [], except our replacements and elapsed hours, minutes, seconds
			sectors[i] = sectors[i].replace(/(\[((?!((\$*?)|(h*?)|(m*?)|(s*?))]).*?)])/, '');

			//format as text
			if (sectors[i].match(/@/)) {
				code_tmp += 'res.value="' + sectors[i] + '".replace(/@/,n);\n';
			}

			//format as number
			else if (sectors[i].match(/#|\?|0/)) {

				var digit_fun = 'n=parseFloat(n);\nres.align="right";\n';

				//abs for standard negative pattern
				if (abs) digit_fun += 'n=Math.abs(n);\n';

				//exponential form
				if (ptrn = sectors[i].match(/(.*?)(?:(\.)(.*?))?e(?:\+|\-)(.*)/i)) {

					var int_part, frac_part;

					if (!ptrn[1]) {
						ptrn[1] = '#';
						int_part = 10;
					} else {
						int_part = Math.pow(10, ptrn[1].match(/0|\?|#/g).length);
					}

					if (!ptrn[3]) {
						ptrn[3] = '';
						frac_part = 1;
					} else {
						frac_part = Math.pow(10, ptrn[3].match(/0|\?|#/g).length);
					}

					if (!ptrn[4]) ptrn[4] = '';

					digit_fun += 'var m=0,sign=n<0?-1:1;\n' +
						'n=Math.abs(n);\n' +
						'if(n!=0){\n' +
						'while(n<' + int_part + ' || Math.round(n*' + frac_part + ')/' + frac_part + '<' + int_part + '){\nn*=10;\nm++;\n}\n' +
						'while(n>=' + int_part + ' || Math.round(n*' + frac_part + ')/' + frac_part + '>=' + int_part + '){\nn/=10;\nm--;\n}\n' +
						'}\n' +
						'n=(Math.round(n*sign*' + frac_part + ')/' + frac_part + ').toString().split(".");\n' +
						'res.value=DataFormatter.fillNumberPattern(parseInt(n[0]),"' + ptrn[1] + '")+';
					if (ptrn[2]) {
						digit_fun += '"' + DataFormatter.locale.decimal_separator + '"+';
						if (ptrn[3]) digit_fun += 'DataFormatter.fillNumberPattern(parseInt(n[1]),"' + ptrn[3] + '","right")+';
					}
					digit_fun += '"E"+(m>0?"-":"+")+' +
						'DataFormatter.fillNumberPattern(Math.abs(m),"' + ptrn[4] + '");\n';
				}
				else {

					var factor = 1;

					//spaces before end
					sectors[i] = sectors[i].replace(/(0|#|\?)(\s+)([^0?#]*)$/, function (a, m1, m2, m3) {
						factor *= Math.pow(1000, m2.length);
						return m1 + m3;
					});

					//percents
					if (ptrn = sectors[i].match(/%/g)) {
						factor /= Math.pow(100, ptrn.length);
					}

					//fractional form
					if (ptrn = sectors[i].match(/(.*?)\/(.*)/)) {

						if (!ptrn[1]) ptrn[1] = '#';
						if (!ptrn[2]) ptrn[2] = '#';

						var d = ptrn[1].length - 1;
						while (ptrn[1][d] == '0' && ptrn[1][d] != '?' && ptrn[1][d] != '#' && ptrn[1][d] != ' ' && d > 0) d--;

						ptrn[3] = ptrn[1].substr(0, d);
						ptrn[4] = ptrn[1].substr(d);

						if (!ptrn[3]) {

							digit_fun += 'var m=n.toString().split("."); m=m[1]?Math.pow(10,m[1].length):1;\n' +
								'n=Math.floor(n*m);' +
								'var factor=DataFormatter.gcd(n,m);\n' +
								'res.value=DataFormatter.fillNumberPattern(n/factor,"' + ptrn[4] + '")+' +
								'"/"+' +
								'DataFormatter.fillNumberPattern(m/factor,"' + ptrn[2] + '");\n';

						} else {

							digit_fun += 'var f=0, factor=1, c=1, m=n.toString().split(".");\n' +
								'if (m[1]) { c=Math.pow(10,m[1].length); f=parseInt(m[1]); factor=DataFormatter.gcd(f,c); }\n' +
								'res.value=DataFormatter.fillNumberPattern(Math.floor(n),"' + ptrn[3] + '")+' +
								'DataFormatter.fillNumberPattern(f/factor,"' + ptrn[4] + '")+' +
								'"/"+' +
								'DataFormatter.fillNumberPattern(c/factor,"' + ptrn[2] + '");\n';
						}
					}

					//decimal form
					else if (ptrn = sectors[i].match(/(.*?)\.(.*)/)) {

						if (!ptrn[1]) ptrn[1] = '0';
						if (!ptrn[2]) {
							ptrn[2] = '';
							frac_part = 1;
						} else {
							frac_part = Math.pow(10, ptrn[2].match(/0|\?|#/g).length);
						}

						//spaces before .
						ptrn[1] = ptrn[1].replace(/(0|#|\?)(\s+)([^0?#]*)$/, function (a, m1, m2, m3) {
							factor *= Math.pow(1000, m2.length);
							return m1 + m3;
						});

						digit_fun += 'n=(Math.round(n*' + frac_part + ')/' + frac_part + ').toString().split(".");\n' +
							'res.value=DataFormatter.fillNumberPattern(parseInt(n[0]),"' + ptrn[1] + '")+' +
							'"' + DataFormatter.locale.decimal_separator + '"+' +
							'DataFormatter.fillNumberPattern(parseInt(n[1]||0),"' + ptrn[2] + '","right");\n';
					}

					//integer form
					else {
						digit_fun += 'res.value=DataFormatter.fillNumberPattern(parseInt(n),"' + sectors[i] + '");\n';
					}

					if (factor != 1) digit_fun = 'n/=' + factor + ';\n' + digit_fun;

				}

				digit_fun = 'if(isNaN(n) || n>=1e21||n<=-1e21){\nres.value=n;\n}\nelse{\n' + digit_fun + '}\n';

				code_tmp += !condition ? 'if(type=="Number"){\n' + digit_fun + '}\n' : digit_fun;
			}

			//format as datetime
			else if (sectors[i].match(/d|m|y|h|s/i)) {

				var elapsed = false;
				sectors[i] = sectors[i].replace(/\[(h+?|m+?|s+?|y+?)]/ig, function (a, m1) {
					elapsed = true;
					return m1;
				});

				code_tmp += 'if(type=="DateTime"){\n';
				code_tmp += 'n=new Date(n);\n';
				code_tmp += 'if (!isNaN(n.getTime())){\n';

				if (elapsed) {
					code_tmp += 'var m, found_hours, found_minutes;\n' +
						'n=Math.abs(n.getTime()-(new Date("1899-12-30T00:00:00.000")).getTime());\n';

					//remove days, months, years from pattern
					sectors[i] = sectors[i].replace(/a|p|am|pm|mmm|mmmm|mmmmm|d|y/gi, '');

					if (sectors[i].match(/h/i)) {
						code_tmp += 'found_hours=true;\n';
					}

					if (sectors[i].match(/m/i)) {
						code_tmp += 'found_minutes=true;\n';
					}

					code_tmp += 'res.value="' + sectors[i] + '".replace(/(hh)|(h)|(mm)|(m)|(ss)|(s)/gi,function(a,hh,h,mm,m,ss,s){\n' +
						'if (hh) { return (m=parseInt(n/1000/60/60))<10 ? "0"+m : m; }\n' +
						'if (h) return parseInt(n/1000/60/60);\n' +
						'if (mm) { m=found_hours ? parseInt(n/1000/60%60) : parseInt(n/1000/60) ;  return m<10 ? "0"+m : m; }\n' +
						'if (m) { m=found_hours ? parseInt(n/1000/60%60) : parseInt(n/1000/60) ;  return m; }\n' +
						'if (ss) { m=found_minutes ? parseInt(n/1000%60) : parseInt(n/1000) ;  return m<10 ? "0"+m : m; }\n' +
						'if (s) { m=found_minutes ? parseInt(n/1000%60) : parseInt(n/1000) ;  return m; }\n' +
						'return "";\n' +
						'});\n';

				} else {

					code_tmp += 'var found_ampm;\n';

					code_tmp += 'res.value="' + sectors[i] + '".replace(/((?:am\\/pm)|(?:a\\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi,function(a,ampm,fmin,fmin2,mmin,mmin2){\n' +
						'if (ampm) { found_ampm=true; return "[]"; }\n' + //temporary replacement for am/pm
						'if (fmin) { m=n.getMinutes(); return fmin + (m<10 ? "0" + m : m); }\n' +
						'if (fmin2) { m=n.getMinutes(); return (m<10 ? "0" + m : m) + fmin2; }\n' +
						'if (mmin) { return mmin + n.getMinutes(); }\n' +
						'if (mmin2) { return n.getMinutes() + mmin2; }\n' +
						'return "";\n' +
						'});\n';

					code_tmp += 'res.value=res.value.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\\[])/gi,function(a,ss,s,hh,h,dddd,ddd,dd,d,mmmmm,mmmm,mmm,mm,m,yyyy,yy,ampm){\n' +
						'if (ss) { m=n.getSeconds(); return m<10 ? "0" + m : m; }\n' +
						'if (s) { return n.getSeconds(); }\n' +
						'if (hh) { m=n.getHours(); if (found_ampm) m=m%12; return m<10 ? "0" + m : m; }\n' +
						'if (h) { return n.getHours(); if (found_ampm) m=m%12; }\n' +
						'if (hh) { m=n.getHours(); return m<10 ? "0" + m : m; }\n' +
						'if (dddd) { return DataFormatter.locale.days[n.getDay()]; }\n' +
						'if (ddd) { return DataFormatter.locale.days_short[n.getDay()]; }\n' +
						'if (dd) { m=n.getDate(); return m<10 ? "0" + m : m; }\n' +
						'if (d) { return n.getDate(); }\n' +
						'if (mmmmm) return DataFormatter.locale.months_short[n.getMonth()][0];\n' +
						'if (mmmm) return DataFormatter.locale.months[n.getMonth()];\n' +
						'if (mmm) return DataFormatter.locale.months_short[n.getMonth()];\n' +
						'if (mm) { m=n.getMonth()+1; return m<10 ? "0" + m : m; }\n' +
						'if (m) { return n.getMonth()+1; }\n' +
						'if (yyyy) return n.getFullYear();\n' +
						'if (yy) return n.getFullYear().toString().substr(2);\n' +
						'if (ampm) return n.getHours()<12 ? "AM" : "PM";\n' + //temporary replacement for am/pm
						'return "";\n' +
						'});\n';
				}
				code_tmp += '\n}}\n';
			}

			code_tmp += 'res.value=DataFormatter.makeReplaces(res.value,repl);\n';
			code_tmp += 'return res;\n';

			//if condition exists, add "if" operator
			if (condition) code += 'if(' + condition + '){\n' + code_tmp + '}\n\n';
			else code += code_tmp;

		}

		return  (DataFormatter.functions[pattern] = Function('n,type', code))(n, type);
	},

	/**
	 * Greatest common divisor of two numbers
	 * @param a
	 * @param b
	 * @returns GCD of two numbers
	 */
	gcd: function (a, b) {
		var r;
		while (b) {
			r = a % b;
			a = b;
			b = r;
		}
		return a;
	}

};
