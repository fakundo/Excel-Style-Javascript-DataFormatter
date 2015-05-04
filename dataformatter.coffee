window.DataFormatter = # Saved functions for each pattern
  functions: {}
# Russian locale
  locale:
    months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября',
             'декабря']
    months_short: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
    days_short: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] # Sunday first
    thousands_separator: ' '
    decimal_separator: ','
    formats:
      'General Number': '#.#'
      'Currency': '#,##0.00р.;[Red]-#,##0.00р.'
      'Fixed': '0.00'
      'Standard': '#,##0.00'
      'Percent': '0.00%'
      'Scientific': '0.00E+00'
      'Yes/No': '"Да";"Да";"Нет"'
      'True/False': '"Истина";"Истина";"Ложь"'
      'On/Off': '"Вкл";"Вкл";"Выкл"'
      'Short Date': 'mm.dd.yyyy'
      'Long Date': 'dd mmmm yyyy'
      'General Date': 'mm.dd.yyyy h:mm'
      'Medium Date': 'dd.mmm.yy'
      'Long Time': 'hh:mm:ss AM/PM'
      'Short Time': 'h:mm'
      'Medium Time': 'hh:mm AM/PM'

# Main function
  format: (n, type, pattern)->
    n = n.toString()
    pattern = pattern.toString()
    # If function for this pattern already exists
    return DataFormatter.functions[pattern](n, type) if DataFormatter.functions[pattern]
    code = ''
    repl = ''
    repl_$ = ''
    # Special for General format
    sectors = pattern
    # Predefined excel formats
    sectors = DataFormatter.locale.formats[sectors] if DataFormatter.locale.formats[sectors] # Replace strings in quotes and slashed symbols to $$$, remove unnecessary symbols
    sectors = sectors.replace(/"([^"]+)"|\\(.?)|(_.?)|(\*.?)|(")/g, (a, m1, m2, m3) ->
      # Quotes
      if m1
        repl += ",\"#{m1.replace(/("|'|\\)/g, "\\$1")}\""
        return "[#{(repl_$ += '$')}]" # Slashes
      if (m2)
        repl += ",\"#{m2.replace(/("|'|\\)/g, "\\$1")}\""
        return "[#{(repl_$ += '$')}]" # Spaces
      if m3
        repl += '," "'
        return "[#{(repl_$ += '$')}]"
      ''
    )
    code = """
    var repl = [#{repl}];
    """
    # Split pattern to sectors
    sectors = sectors.split(/;/)
    # Foreach sector ...
    i = -1
    t_l = Math.min(4, sectors.length)
    while ++i < t_l
      condition = ''
      abs = false
      # Find condition for sector or add standard sector condition (positive number, negative number, etc.)
      condition = sectors[i].match(/\[((?:>|>=|<|<=|=|<>)[0-9\.]+?)]/)
      if condition
        # Found condition
        condition = "type=='Number' && n #{condition[1].replace(/<>/, '!=').replace('/=/', '==')}"
      else if i == 0 && sectors.length > 2
        # Standard condition for positive number
        condition = 'type=="Number" && n>0'
      else if i == 0 && sectors.length > 1
        # Standard condition for first section of two
        condition = 'type=="Number" && n>=0'
      else if i == 1 && sectors.length > 2
        # Standard condition for negative number
        condition = 'type=="Number" && n<0'
        # Abs for standard negative sector
        abs = true
      else if i == 2 && sectors.length > 3
        # Otherwise
        condition = 'type=="Number"'
      # Start creating code for function
      code_tmp = """
      var res={value:'#{sectors[i]}'};
      if (type == "Number" || type =="DateTime") res.align = 'right';
      """
      # Text color
      if ptrn = sectors[i].match(/\[(Red|Green|White|Blue|Magenta|Yellow|Cyan|Black)]/i)
        code_tmp += """
        res.color='#{ptrn[1]}';
        """
      # Remove all [], except our replacements and elapsed hours, minutes, seconds
      sectors[i] = sectors[i].replace(/(\[((?!((\$*?)|(h*?)|(m*?)|(s*?))]).*?)])/, '')
      if sectors[i].match(/General/i)
        # General format
        code_tmp += """
        res.value=n;
        if (type == 'Number'){
          if (!isNaN(n) && n!=''){
            if (n<1e21 && n>-1e21){
              n=parseFloat(n);
              res.value=n;
              if (n != parseInt(n / 1)) {
                res.value = (Math.round(n*100)/100).toString().replace(/\\./,'#{DataFormatter.locale.decimal_separator}');
              }
            }
            else{
              res.value=n.toString().toUpperCase();
            }
          }
        }
        else if(type == 'DateTime' && !isNaN((new Date(n)).getTime())){
          res.value = Math.abs((new Date(n)).getTime()-(new Date('1899-12-31T00:00:00.000')).getTime())/1000/60/60/24;
        }
        """
      else
        if sectors[i].match(/@/)
          # Format as text
          code_tmp += """
          res.value='#{sectors[i]}'.replace(/@/,n);
          """
        else if sectors[i].match(/#|\?|0/)
          # Format as number
          digit_fun = """
          n=parseFloat(n);
          """
          # Abs for standard negative pattern
          if abs then digit_fun += """
          n=Math.abs(n);
          """
          if ptrn = sectors[i].match(/(.*?)(?:(\.)(.*?))?e(?:\+|\-)(.*)/i)
            # Exponential form
            if !ptrn[1]
              ptrn[1] = '#'
              int_part = 10
            else
              int_part = Math.pow(10, ptrn[1].match(/0|\?|#/g).length)
            if !ptrn[3]
              ptrn[3] = ''
              frac_part = 1
            else
              frac_part = Math.pow(10, ptrn[3].match(/0|\?|#/g).length)
            if !ptrn[4] then ptrn[4] = ''
            digit_fun += """
            var m=0,sign=n<0?-1:1;
            n=Math.abs(n);
            if(n!=0){
             while(n < #{int_part} || Math.round(n*#{frac_part})/#{frac_part} < #{int_part}){
               n*=10;
               m++;
             }
             while(n >= #{int_part} || Math.round(n*#{frac_part})/#{frac_part} >= #{int_part}){
               n/=10;
               m--;
             }
            }
            n=(Math.round(n*sign*#{frac_part})/#{frac_part}).toString().split('.');
            res.value=DataFormatter.fillNumberPattern(parseInt(n[0]),'#{ptrn[1]}');
            """
            if ptrn[2]
              digit_fun += """
              '#{DataFormatter.locale.decimal_separator}'+
              """
              if ptrn[3] then digit_fun += """
              DataFormatter.fillNumberPattern(parseInt(n[1]),'#{ptrn[3]}','right')+
              """
            digit_fun += """
            'E'+(m>0?'-':'+')+DataFormatter.fillNumberPattern(Math.abs(m),'#{ptrn[4]}');
            """
          else
            factor = 1
            # Spaces before end
            sectors[i] = sectors[i].replace(/(0|#|\?)(,+)([^0?#]*)$/, (a, m1, m2, m3)->
              factor *= Math.pow(1000, m2.length)
              m1 + m3
            )
            # Percents
            if ptrn = sectors[i].match(/%/g)
              factor /= Math.pow(100, ptrn.length)
            if ptrn = sectors[i].match(/(.*?)\/(.*)/)
              # Fractional form
              if !ptrn[1] then ptrn[1] = '#'
              if !ptrn[2] then ptrn[2] = '#'
              d = ptrn[1].length - 1
              while ptrn[1][d] == '0' && ptrn[1][d] != '?' && ptrn[1][d] != '#' && ptrn[1][d] != ' ' && d > 0
                d--
              ptrn[3] = ptrn[1].substr(0, d)
              ptrn[4] = ptrn[1].substr(d)
              if !ptrn[3]
                digit_fun += """
                var m=n.toString().split(".");
                m=m[1]?Math.pow(10,m[1].length):1;
                n=Math.floor(n*m);
                var factor=DataFormatter.gcd(n,m);
                res.value=DataFormatter.fillNumberPattern(n/factor,'#{ptrn[4]}')+'/'+DataFormatter.fillNumberPattern(m/factor,'#{ptrn[2]}');
                """
              else
                digit_fun += """
                var f=0, factor=1, c=1, m=n.toString().split('.');
                if(m[1]){c=Math.pow(10,m[1].length); f=parseInt(m[1]); factor=DataFormatter.gcd(f,c);}
                res.value=DataFormatter.fillNumberPattern(Math.floor(n),'#{ptrn[3]}') + DataFormatter.fillNumberPattern(f/factor,'#{ptrn[4]}') + '/' + DataFormatter.fillNumberPattern(c/factor,'#{ptrn[2]}');
                """
            else if ptrn = sectors[i].match(/(.*?)\.(.*)/)
              # Decimal form
              if !ptrn[1] then ptrn[1] = '0'
              if !ptrn[2]
                ptrn[2] = ''
                frac_part = 1
              else
                frac_part = Math.pow(10, ptrn[2].match(/0|\?|#/g).length) # Spaces before .
              ptrn[1] = ptrn[1].replace(/(0|#|\?)(,+)([^0?#]*)$/, (a, m1, m2, m3)->
                factor *= Math.pow(1000, m2.length)
                m1 + m3
              )
              digit_fun += """
              n=(Math.round(n*#{frac_part})/#{frac_part}).toString().split('.');
              res.value=DataFormatter.fillNumberPattern(parseInt(n[0]),'#{ptrn[1]}')+'#{DataFormatter.locale.decimal_separator}'+DataFormatter.fillNumberPattern(parseInt(n[1]||0),'#{ptrn[2]}','right');
              """
            else
              # Integer form
              digit_fun += """
              res.value=DataFormatter.fillNumberPattern(Math.round(n),'#{sectors[i]}');
              """
            if factor != 1
              digit_fun = """
              n/=#{factor};
              #{digit_fun}
              """
          digit_fun = """
          if(n<1e21 && n>-1e21){
            #{digit_fun}
          }
          else{
            res.value=n.toString().toUpperCase();
          }
          """
          if !condition then condition = 'type=="Number"'
          code_tmp += digit_fun
        else if sectors[i].match(/h|m|s|y/i)
          # Date Time
          elapsed = false
          sectors[i] = sectors[i].replace(/\[(h+?|m+?|s+?|y+?)]/ig, (a, m1) ->
            elapsed = true
            m1
          )
          code_tmp += """
          if(type=='DateTime'){
            n=new Date(n);
            if (!isNaN(n.getTime())){
          """
          if elapsed
            code_tmp += """
            var m, found_hours, found_minutes;
            n=Math.abs(n.getTime()-(new Date('1899-12-31T00:00:00.000')).getTime());
            """
            # Remove days, months, years from pattern
            sectors[i] = sectors[i].replace(/a|p|am|pm|mmm|mmmm|mmmmm|d|y/gi, '')
            if sectors[i].match(/h/i)
              code_tmp += """
              found_hours=true;
              """
            if sectors[i].match(/m/i)
              code_tmp += """
              found_minutes=true;
              """
            code_tmp += """
            res.value='#{sectors[i]}'.replace(/(hh)|(h)|(mm)|(m)|(ss)|(s)/gi,function(a,hh,h,mm,m,ss,s){
              if (hh) { return (m=parseInt(n/1000/60/60))<10 ? '0'+m : m; }
              if (h) return parseInt(n/1000/60/60);
              if (mm) { m=found_hours ? parseInt(n/1000/60%60) : parseInt(n/1000/60) ;  return m<10 ? '0'+m : m; }
              if (m) { m=found_hours ? parseInt(n/1000/60%60) : parseInt(n/1000/60) ;  return m; }
              if (ss) { m=found_minutes ? parseInt(n/1000%60) : parseInt(n/1000) ;  return m<10 ? '0'+m : m; }
              if (s) { m=found_minutes ? parseInt(n/1000%60) : parseInt(n/1000) ;  return m; }
              return '';
            });
            """
          else
            code_tmp += """
            var found_ampm
            res.value='#{sectors[i]}'.replace(/((?:am\\/pm)|(?:a\\/p))|(?:(h[^ydsap]*?)mm)|(?:mm([^ydh]*?s))|(?:(h[^ydsap]*?)m)|(?:m([^ydh]*?s))/gi,function(a,ampm,fmin,fmin2,mmin,mmin2){
              if (ampm) { found_ampm=true; return '[]'; }
              if (fmin) { m=n.getMinutes(); return fmin + (m<10 ? '0' + m : m); }
              if (fmin2) { m=n.getMinutes(); return (m<10 ? '0' + m : m) + fmin2; }
              if (mmin) return mmin + n.getMinutes();
              if (mmin2) return n.getMinutes() + mmin2;
              return '';
              });
              res.value=res.value.replace(/(ss)|(s)|(hh)|(h)|(dddd)|(ddd)|(dd)|(d)|(mmmmm)|(mmmm)|(mmm)|(mm)|(m)|(yyyy)|(yy)|(\\[])/gi,function(a,ss,s,hh,h,dddd,ddd,dd,d,mmmmm,mmmm,mmm,mm,m,yyyy,yy,ampm){
              if (ss) { m=n.getSeconds(); return m<10 ? '0' + m : m; }
              if (s) return n.getSeconds();
              if (hh) { m=n.getHours(); if (found_ampm) m=m%12; return m<10 ? '0' + m : m; }
              if (h) { if (found_ampm) m=m%12; return n.getHours(); }
              if (hh) { m=n.getHours(); return m<10 ? '0' + m : m; }
              if (dddd) return DataFormatter.locale.days[n.getDay()];
              if (ddd) return DataFormatter.locale.days_short[n.getDay()];
              if (dd) { m=n.getDate(); return m<10 ? '0' + m : m; }
              if (d) return n.getDate();
              if (mmmmm) return DataFormatter.locale.months_short[n.getMonth()][0];
              if (mmmm) return DataFormatter.locale.months[n.getMonth()];
              if (mmm) return DataFormatter.locale.months_short[n.getMonth()];
              if (mm) { m=n.getMonth()+1; return m<10 ? '0' + m : m; }
              if (m) return n.getMonth()+1;
              if (yyyy) return n.getFullYear();
              if (yy) return n.getFullYear().toString().substr(2);
              if (ampm) return n.getHours()<12 ? 'AM' : 'PM';
              return '';
            });
            """
          code_tmp += """
          }}
          """
        code_tmp += """
        res.value=DataFormatter.makeReplaces(res.value,repl);
        """
      code_tmp += """
      return res;
      """
      # if condition exists, add "if" operator
      code += if condition
        """
        if(#{condition}){
          #{code_tmp}
        }
        """
      else code_tmp
    code += """
    return {value:n};
    """
    (DataFormatter.functions[pattern] = Function('n,type', code))(n, type)

# Fills pattern
  fillNumberPattern: (n, pattern, direction)->
    n = n.toString()
    s = ''
    if direction == 'right'
      j = 0
      i = -1
      t_l = pattern.length
      while ++i < t_l
        switch pattern[i]
          when '0'
            s += n[j] ? '0'
            j++
          when '#'
            s += n[j] ? ''
            j++
          when '?'
            s += n[j] ? ' '
            j++
          when '['
            while i < pattern.length && pattern[i] != ']'
              s += pattern[i]
              i++
            i--
          else
            s += pattern[i]
    else
      # Should we separate thousands
      separate_thousands = false
      pattern = pattern.replace(/(0|#|\?)(,+?)(0|#|\?)/g, (a, m1, m2, m3) ->
        separate_thousands = true
        m1 + m3
      )
      # Add separation
      if separate_thousands
        j = n.length - 3
        while (if n[0] == '-' then j > 1 else j > 0)
          n = n.substr(0, j) + DataFormatter.locale.thousands_separator + n.substr(j)
          j -= 3
      j = n.length - 1
      i = pattern.length
      while i--
        switch pattern[i]
          when '0'
            s = (n[j] ? '0') + s
            most_left_digit = i
            j--
          when '#'
            s = (n[j] ? '') + s
            most_left_digit = i
            j--
          when '?'
            s = (n[j] ? ' ') + s
            most_left_digit = i
            j--
          when ']'
            while i > 0 && pattern[i] != '['
              s = pattern[i] + s
              i--
            i++
          else
            s = pattern[i] + s
      # Add remaining digits, example: n=1234, ptrn=00, result must be 1234 instead of 34
      if j >= 0 && most_left_digit != null
        s = s.substr(0, most_left_digit) + n.substr(0, j + 1) + s.substr(most_left_digit)
    s

# Replaces all [] in string
  makeReplaces: (s, repl)->
    s = s.replace(/\[(?:(\$*?)|(.*?))\]/g, (a, m1) ->
      return if m1 && repl[m1.length] then repl[m1.length] else '')

# Greatest common divisor
  gcd: (a, b)->
    while(b)
      r = a % b
      a = b
      b = r
    a
