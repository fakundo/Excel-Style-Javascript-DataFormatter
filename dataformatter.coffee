window.DataFormatter =
# Saved functions for each pattern
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

# Fills pattern
  fillNumberPattern: (number, pattern, direction)->
    number = number.toString()
    s = ''
    if direction == 'right'
      j=0

# Replaces all [] in string
  makeReplaces: (s, repl)->
    s.replace(/\[(?:(\$*)|(.*))]/g, (a, m1) ->
      return if m1 && repl[m1.length] then repl[m1.length] else ''
    )

# Greatest common divisor
  gcd: (a, b)->
    while(b)
      r = a % b
      a = b
      b = r
    a
