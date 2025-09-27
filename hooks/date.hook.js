
function offsetTimeZone(date) {
   //  date = new Date(date);
   return date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
   // partObj.periodEnd = partObj.periodEnd.setHours(partObj.periodEnd.getHours() - partObj.periodEnd.getTimezoneOffset() / 60)
};

function format_date(numb) {  //отримуємо дату з числа мілісекунд, що йдуть від 01.01.1970р
   let number = Number(numb);
   let date = new Date(number);
   let new_date = `${(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())}.${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}.${date.getFullYear()}`;
   let time = `${date.getHours()}:${date.getMinutes()}`;
   return new_date;
};
function getMyFormatDate(date, type = 'DD-MM-YYYY') { // '12.01.2022'
   if (!date || date == '0000-00-00' || date == null) return '';

   let dt = new Date(date);
   let dd = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
   let mm = (dt.getMonth() + 1) < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
   let yyyy = dt.getFullYear();
   let yy = yyyy.toString().slice(-2); // dt.getYear();
   let new_date = `${dd}.${mm}.${yyyy}`;
   switch (type) {
      case 'DD-MM-YYYY': {
         new_date = `${dd}-${mm}-${yyyy}`;
      };
         break;
      case 'DD.MM.YYYY': {
         new_date = `${dd}.${mm}.${yyyy}`;
      };
         break;
      case 'DD/MM/YYYY': {
         new_date = `${dd}/${mm}/${yyyy}`;
      };
         break;
      case 'DD-MM-YY': {
         new_date = `${dd}-${mm}-${yy}`;
      };
         break;
      case 'DD.MM.YY': {
         new_date = `${dd}.${mm}.${yy}`;
      };
         break;
      case 'DD/MM/YY': {
         new_date = `${dd}/${mm}/${yy}`;
      };
         break;
      case 'DD-MM': {
         new_date = `${dd}-${mm}`;
      };
         break;
      case 'DD.MM': {
         new_date = `${dd}.${mm}`;
      };
         break;
      case 'DD/MM': {
         new_date = `${dd}/${mm}`;
      };
         break;

      case 'YYYY-MM-DDTHH-MM': {
         let HH = String(dt.getHours()).padStart(2, 0);
         let MM = String(dt.getMinutes()).padStart(2, 0);
         new_date = `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
      };
         break;
      default: { console.log('What error in date.hook getMyFormatDate func') }
   }
   return new_date;
};


function isTodayTextUK(date) { //! не додав вказання першох літери, бо пишемо Ллллл, а якщо малі, то lowerCase()
   if (!date) return '';
   let d = new Date(date);
   let yyyy = d.getFullYear();
   let mm = d.getMonth();
   let dd = d.getDate();
   let t = new Date();
   let yyyyt = t.getFullYear();
   let mmt = t.getMonth();
   let ddt = t.getDate();

   switch (true) {
      case (yyyy == yyyyt && mm == mmt && dd == ddt): {
         return 'Сьогодні'
      };
      case (new Date(yyyy, mm, dd).toISOString() == new Date(yyyyt, mmt, ddt - 1).toISOString()): {
         return 'Вчора'
      };
      case (new Date(yyyy, mm, dd).toISOString() == new Date(yyyyt, mmt, ddt - 2).toISOString()): {
         return 'Позавчора'
      };
      case (new Date(yyyy, mm, dd - 1).toISOString() == new Date(yyyyt, mmt, ddt).toISOString()): {
         return 'Завтра'
      };
      case (new Date(yyyy, mm, dd - 2).toISOString() == new Date(yyyyt, mmt, ddt).toISOString()): {
         return 'Післязавтра'
      };

      default: {
         return ''
      }
   }
};
function dayWithoutTime(date, type = 'today') {
   if (!date) return '';
   let d = new Date(date);
   let yyyy = d.getFullYear();
   let mm = d.getMonth();
   let dd = d.getDate();
   // date.setDate(date.getDate() - 1);
   switch (type) {
      case 'today': {
         return new Date(yyyy, mm, dd, 0, 0, 0)
      };
      case 'yesterday': {
         return new Date(yyyy, mm, dd - 1, 0, 0, 0)
      };
      case 'tomorrow': {
         return new Date(yyyy, mm, dd + 1, 0, 0, 0)
      };
      default:
         console.log('We get today/ Error in switch datehook dayWithoutTime func')
         return new Date(yyyy, mm, dd, 0, 0, 0)
   }
};

function getFormatDateSQL(dateString) {  //не виносили як ф-ю
   return dateString.slice(0, 10);
};

function getMyFormatTime(date) {
   let dt = new Date(date);
   let hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
   let minutes = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
   let time = `${hours}:${minutes}`;
   return time;
}

function getSQLFormatDate(date) {
   if (!date) return '';

   let dt = new Date(date);
   let dd = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
   let mm = (dt.getMonth() + 1) < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
   let yyyy = dt.getFullYear();
   let new_date = `${yyyy}-${mm}-${dd}`;
   return new_date;
};
// console.log(getMyFormatDate(new Date()));
function getMonthName(date) {
   let month = date.getMonth() + 1;
   let name = ``;
   switch (month) {
      case 1: name = 'Січень'; break;
      case 2: name = 'Лютий'; break;
      case 3: name = 'Березень'; break;
      case 4: name = 'Квітень'; break;
      case 5: name = 'Травень'; break;
      case 6: name = 'Червень'; break;
      case 7: name = 'Липень'; break;
      case 8: name = 'Серпень'; break;
      case 9: name = 'Вересень'; break;
      case 10: name = 'Жовтень'; break;
      case 11: name = 'Листопад'; break;
      case 12: name = 'Грудень'; break;
      default: name = 'невідомо';
   };
   return name;
};
// console.log(getMonthName(new Date()));
function getKvartalName(date) {
   let month = date.getMonth() + 1;
   let kvart = ``;
   switch (true) {
      case (month > 0 && month < 4): {
         kvart = '1й квартал';
         break;
      };
      case (month > 3 && month < 7): {
         kvart = '2й квартал';
         break;
      };
      case (month > 6 && month < 10): {
         kvart = '3й квартал';
         break;
      };
      default: kvart = '4й квартал';
   };
   return kvart;
};
// console.log(getKvartalName(new Date()));
function getHalfYearName(date) {
   let month = date.getMonth() + 1;
   let halfyear = ``;
   switch (true) {
      case (month > 0 && month < 7): {
         halfyear = '1е півріччя';
         break;
      };
      default: halfyear = '2е півріччя';
   };
   return halfyear;
};
// console.log(getHalfYearName(new Date()));

function getPeriodArr(period_part, period_q) {
   if (period_part == null || period_part == undefined) {
      period_part = 'місяць';
   };
   if (period_q == null || period_q == undefined) {
      period_q = 5;
   };
   let today = new Date();
   //today.getTimezoneOffset();
   // today.setHours(0,0,0,0);
   // todayCorect = Date.parse(today) + 3*60*60*1000; // коректуємо зміщення часу

   let periodsArr = [];
   let y = today.getFullYear();
   let m = today.getMonth() + 1;
   let d = today.getDate();

   if (period_part == 'місяць') {
      for (let i = period_q; i > 0; i--) {
         //      let start = new Date(today.getFullYear(), today.getMonth() - i +1, 2, 0, 0, 0,0);
         //       start = new Date(start);
         //    let end = new Date(today.getFullYear(), today.getMonth() - i +1+1, 1,0,0,0,0)-1; // тут мілісекунди
         let start = new Date(y, m - i, 1);
         let end = new Date(y, m - i + 1, 0, 23, 59, 59, 999);
         let obj = {
            periodNumber: period_q - i + 1,
            periodQ: period_q,
            periodPart: period_part,
            periodName: getMonthName(start),
            periodStart: start,
            periodEnd: new Date(end)         //format_date(end)
         };
         periodsArr.push(obj);
      };
   } else {
      console.log('We have not periods');
   }
   return periodsArr;
};

function checkQuarter(item) {
   let monthNumber = item;
   let quarter = 0;
   if (item >= 0 && item < 12) {
      monthNumber = item;
   } else {
      let date = new Date(item);
      monthNumber = date.getMonth();
   };
   switch (true) {
      case (monthNumber >= 0 && monthNumber <= 2): {
         quarter = 1;
      };
         break;
      case (monthNumber >= 3 && monthNumber <= 5): {
         quarter = 2;
      };
         break;
      case (monthNumber >= 6 && monthNumber <= 8): {
         quarter = 3;
      };
         break;
      case (monthNumber >= 9 && monthNumber <= 11): {
         quarter = 4;
      };
         break;
      default: {
         console.log('Mistake in checkQuarter function')
      }
   };
   return quarter;
};
function checkHalfYear(item) {
   let monthNumber = item;
   let halfyear = 0;
   let lastDay = 0;
   if (item >= 0 && item < 12) {
      monthNumber = item;
   } else {
      let date = new Date(item);
      monthNumber = date.getMonth();
   };
   switch (true) {
      case (monthNumber >= 0 && monthNumber <= 5): {
         halfyear = 1;
         lastDay = 30;
      };
         break;
      case (monthNumber >= 6 && monthNumber <= 11): {
         halfyear = 2;
         lastDay = 31;
      };
         break;

      default: {
         console.log('Mistake in halfyear function')
      }
   };
   return {
      halfyear: halfyear,
      lastDay: lastDay
   }
};

function devidePartsPeriod(dateStart, dateEnd, part) {
   let periodsArr = [];
   let partObj = {};
   let ds = new Date(dateStart);
   let de = new Date(dateEnd);
   let arrMonth = ['Січень', "Лютий", 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
   let arrQuarter = ['1й квартал', '2й квартал', '3й квартал', '4й квартал'];
   let arrHalfyear = ['1е півріччя', '2е півріччя'];


   switch (part) {
      case 'choosen': {
         let ds = new Date(dateStart);
         let de = new Date(dateEnd);
         let year = ``;
         let dsYear = ds.getFullYear();
         let deYear = de.getFullYear();
         if (dsYear == deYear) {
            year = dsYear;
         } else {
            year = `${dsYear.toString().slice(-2)}-${deYear.toString().slice(-2)}`;
         };

         partObj = {
            periodPart: 'choosen',
            periodName: 'Вибраний',
            periodYear: year,
            periodStartSql: dateStart, //'2020-01-01',
            periodEndSql: dateEnd, //'2020-06-30',
            periodStart: ds,
            periodEnd: de,
         };
         periodsArr.push(partObj);
      };
         break;
      case 'year': {
         let yearStart = ds.getFullYear();
         let yearEnd = de.getFullYear();
         let count = yearEnd - yearStart;
         count = Math.abs(count) + 1; //для мінусового значення

         let dsYear = yearStart;
         let deYear = yearEnd;

         for (let i = 0; i < count; i++) {

            partObj = {
               periodPart: 'year',
               periodName: 'Рік',
               periodYear: yearStart + i,
               //  periodStartSql: dateStart, //'2020-01-01',
               // periodEndSql: dateEnd, //'2020-06-30',
               periodStart: new Date(yearStart + i, 0, 1),
               periodEnd: new Date(yearStart + i, 11, 31, 23, 59, 59, 999),
            };
            periodsArr.push(partObj);
         }
      };
         break;
      case 'month': {
         let yearStart = ds.getFullYear();
         let yearEnd = de.getFullYear();
         let monthStart = ds.getMonth();
         let monthEnd = de.getMonth();

         let year = ``;
         let dsYear = yearStart;
         let deYear = yearEnd;
         if (dsYear == deYear) {
            year = dsYear;
         } else {
            year = `${dsYear.toString().slice(-2)}-${deYear.toString().slice(-2)}`;
         };

         switch (true) {
            case (yearStart == yearEnd): {
               let count = monthEnd - monthStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  let month = monthStart + i;
                  let nextMonth = new Date(yearStart, month + 1, 0);
                  let lastDay = nextMonth.getDate();

                  partObj = {
                     periodPart: 'month',
                     periodPart: 'Місяць',
                     periodYear: yearStart,
                     periodName: arrMonth[month],
                     //  periodStartSql: dateStart, //'2020-01-01',
                     // periodEndSql: dateEnd, //'2020-06-30',
                     periodStart: new Date(yearStart, monthStart + i, 1),
                     periodEnd: new Date(yearStart, monthStart + i, lastDay, 23, 59, 59, 999),
                     // periodEnd: new Date(yearStart, monthStart + i, lastDay, 23, 59, 59, 999).toLocaleDateString() + ' ' + new Date(yearStart, monthStart + i, lastDay, 23, 59, 59, 999).toLocaleTimeString()
                  };
                  //  partObj.periodEnd = partObj.periodEnd.setHours(partObj.periodEnd.getHours() - partObj.periodEnd.getTimezoneOffset() / 60)
                  // partObj.periodStart = offsetTimeZone(partObj.periodStart);
                  // partObj.periodEnd = offsetTimeZone(partObj.periodEnd);

                  periodsArr.push(partObj);
               }
            };
               break;
            case (yearStart < yearEnd): {
               let count = yearEnd - yearStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  switch (true) {
                     case (i == 0): {
                        console.log("case -> i1", i)

                        for (let j = monthStart; j < 12; j++) {
                           let month = j;
                           let nextMonth = new Date(yearStart, month + 1, 0);
                           let lastDay = nextMonth.getDate();
                           partObj = {
                              periodPart: 'month',
                              periodPart: 'Місяць',
                              periodYear: yearStart,
                              periodName: arrMonth[month],
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(yearStart, month, 1),
                              periodEnd: new Date(yearStart, month, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i > 0 && i < count - 1): {
                        console.log("case -> i2", i)
                        for (let j = 0; j < 12; j++) {
                           let month = j;
                           let nextMonth = new Date(yearStart + i, month + 1, 0);
                           let lastDay = nextMonth.getDate();
                           partObj = {
                              periodPart: 'month',
                              periodPart: 'Місяць',
                              periodYear: yearStart + i,
                              periodName: arrMonth[month],
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(yearStart + i, month, 1),
                              periodEnd: new Date(yearStart + i, month, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i == count - 1): {
                        console.log("case -> i3", i)
                        for (let j = 0; j <= monthEnd; j++) {
                           let month = j;
                           let nextMonth = new Date(yearStart + i, month + 1, 0);
                           let lastDay = nextMonth.getDate();
                           partObj = {
                              periodPart: 'month',
                              periodPart: 'Місяць',
                              periodYear: yearStart + i,
                              periodName: arrMonth[month],
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(yearStart + i, month, 1),
                              periodEnd: new Date(yearStart + i, month, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     default: {
                        console.log('smth wrong in month period part')
                     }
                  };
               }
            };
               break;
            default: {
               console.log('bad choosen period for month')
            }
         };
      };
         break;
      case 'quarter': {
         let yearStart = ds.getFullYear();
         let yearEnd = de.getFullYear();
         let monthStart = ds.getMonth();
         let monthEnd = de.getMonth();
         let quarterStart = checkQuarter(ds);
         let quarterEnd = checkQuarter(de);
         switch (true) {
            case (yearStart == yearEnd): {
               let count = quarterEnd - quarterStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  let quarter = quarterStart + i;
                  let month = (quarter - 1) * 3;
                  let nextQuarter = new Date(yearStart, month + 4, 0);
                  let lastDay = nextQuarter.getDate();
                  partObj = {
                     periodPart: 'quarter',
                     periodPart: 'Квартал',
                     periodYear: yearStart,
                     periodName: arrQuarter[quarter - 1],
                     //  periodStartSql: dateStart, //'2020-01-01',
                     // periodEndSql: dateEnd, //'2020-06-30',
                     periodStart: new Date(yearStart, month, 1),
                     periodEnd: new Date(yearStart, month + 2, lastDay, 23, 59, 59, 999),
                  };
                  periodsArr.push(partObj);
               }
            };
               break;
            case (yearStart < yearEnd): {
               let count = yearEnd - yearStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  switch (true) {
                     case (i == 0): {
                        for (let j = quarterStart; j <= 4; j++) {
                           let quarter = j;
                           let month = (quarter - 1) * 3;
                           let nextQuarter = new Date(yearStart, month + 4, 0);
                           let lastDay = nextQuarter.getDate();

                           partObj = {
                              periodPart: 'quarter',
                              periodPart: 'Квартал',
                              periodYear: yearStart,
                              periodName: arrQuarter[quarter - 1],
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(yearStart, month, 1),
                              periodEnd: new Date(yearStart, month + 2, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i > 0 && i < count - 1): {
                        for (let j = 1; j <= 4; j++) {
                           let quarter = j;
                           let year = yearStart + i;
                           let month = (quarter - 1) * 3;
                           let nextQuarter = new Date(year, month + 4, 0);
                           let lastDay = nextQuarter.getDate();
                           partObj = {
                              periodPart: 'quarter',
                              periodPart: 'Квартал',
                              periodName: arrQuarter[quarter - 1],
                              periodYear: year,
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(year, month, 1),
                              periodEnd: new Date(year, month + 2, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i == count - 1): {
                        for (let j = 1; j <= quarterEnd; j++) {
                           let quarter = j;
                           let year = yearStart + i;
                           let month = (quarter - 1) * 3;
                           let nextQuarter = new Date(year, month + 4, 0);
                           let lastDay = nextQuarter.getDate();

                           partObj = {
                              periodPart: 'quarter',
                              periodPart: 'Квартал',
                              periodName: arrQuarter[quarter - 1],
                              periodYear: year,
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(year, month, 1),
                              periodEnd: new Date(year, month + 2, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     default: {
                        console.log('smth wrong in month period part')
                     }
                  };
               }
            };
               break;
            default: {
               console.log('bad choosen period for month')
            }
         };
      };
         break;
      case 'halfyear': {
         let yearStart = ds.getFullYear();
         let yearEnd = de.getFullYear();
         let monthStart = ds.getMonth();
         let monthEnd = de.getMonth();
         let hfStart = checkHalfYear(ds).halfyear;
         let hfEnd = checkHalfYear(de).halfyear;
         switch (true) {
            case (yearStart == yearEnd): {
               let count = hfEnd - hfStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  let hf = hfStart + i;
                  let month = (hf - 1) * 6;
                  let lastDay = checkHalfYear(hf).lastDay;
                  partObj = {
                     periodPart: 'halfyear',
                     periodPart: 'Півріччя',
                     periodYear: yearStart,
                     periodName: arrHalfyear[hf - 1],
                     //  periodStartSql: dateStart, //'2020-01-01',
                     // periodEndSql: dateEnd, //'2020-06-30',
                     periodStart: new Date(yearStart, month, 1),
                     periodEnd: new Date(yearStart, month + 5, lastDay, 23, 59, 59, 999),
                  };
                  periodsArr.push(partObj);
               }
            };
               break;
            case (yearStart < yearEnd): {
               let count = yearEnd - yearStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  switch (true) {
                     case (i == 0): {
                        for (let j = hfStart; j <= 2; j++) {
                           let hf = j;
                           let month = (hf - 1) * 6;
                           let lastDay = checkHalfYear(hf).lastDay;

                           partObj = {
                              periodPart: 'halfyear',
                              periodPart: 'Півріччя',
                              periodYear: yearStart,
                              periodName: arrHalfyear[hf - 1],
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(yearStart, month, 1),
                              periodEnd: new Date(yearStart, month + 5, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i > 0 && i < count - 1): {
                        for (let j = 1; j <= 2; j++) {
                           let hf = j;
                           let year = yearStart + i;
                           let month = (hf - 1) * 6;
                           let lastDay = checkHalfYear(hf).lastDay;
                           partObj = {
                              periodPart: 'halfyear',
                              periodPart: 'Півріччя',
                              periodName: arrHalfyear[hf - 1],
                              periodYear: year,
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(year, month, 1),
                              periodEnd: new Date(year, month + 5, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     case (i == count - 1): {
                        for (let j = 1; j <= hfEnd; j++) {
                           let hf = j;
                           let year = yearStart + i;
                           let month = (hf - 1) * 6;
                           let lastDay = checkHalfYear(hf).lastDay;

                           partObj = {
                              periodPart: 'halfyear',
                              periodPart: 'Півріччя',
                              periodName: arrHalfyear[hf - 1],
                              periodYear: year,
                              //  periodStartSql: dateStart, //'2020-01-01',
                              // periodEndSql: dateEnd, //'2020-06-30',
                              periodStart: new Date(year, month, 1),
                              periodEnd: new Date(year, month + 5, lastDay, 23, 59, 59, 999),
                           };
                           periodsArr.push(partObj);
                        }
                     };
                        break;
                     default: {
                        console.log('smth wrong in month period part')
                     }
                  };
               }
            };
               break;
            default: {
               console.log('bad choosen period for month')
            }
         };
      };
         break;

      case 'week': {
         let yearStart = ds.getFullYear();
         let yearEnd = de.getFullYear();
         let monthStart = ds.getMonth();
         let monthEnd = de.getMonth();
         let hfStart = checkHalfYear(ds).halfyear;
         let hfEnd = checkHalfYear(de).halfyear;

         let dayStart = ds.getDay();
         console.log("devidePartsPeriod -> dayStart", dayStart)
         let dayEnd = de.getDay();
         console.log("devidePartsPeriod -> dayEnd", dayEnd)
         let toFirstWeek = (7 - dayStart) + 1;
         console.log("devidePartsPeriod -> toFirstWeek", toFirstWeek)
         let mondayStart = ds + 5;
         console.log("devidePartsPeriod -> mondayStart", mondayStart)
         let arrWeek = [];
         let objWeek = {};
         for (let i = 0; i <= 60; i++) {
            let days = i * 7;
            let monday = mondayStart + days;
            console.log("devidePartsPeriod -> monday", monday)
            let date = new Date(yearStart, monday.getMonth(), monday.getDate());
            if (date.getFullYear() == yearStart) {
               objWeek[date] = i = 1;
               arrWeek.push(`${i + 1}й тиждень`);
            }
         };
         console.log(arrWeek);
         console.log(objWeek);
         switch (true) {
            case (yearStart == yearEnd): {
               let count = hfEnd - hfStart;
               count = Math.abs(count) + 1; //для мінусового значення
               for (let i = 0; i < count; i++) {
                  let hf = hfStart + i;
                  let month = (hf - 1) * 6;
                  let lastDay = checkHalfYear(hf).lastDay;
                  partObj = {
                     periodPart: 'halfyear',
                     periodPart: 'Півріччя',
                     periodYear: yearStart,
                     periodName: arrHalfyear[hf - 1],
                     //  periodStartSql: dateStart, //'2020-01-01',
                     // periodEndSql: dateEnd, //'2020-06-30',
                     periodStart: new Date(yearStart, month, 1),
                     periodEnd: new Date(yearStart, month + 5, lastDay, 23, 59, 59, 999),
                  };
                  periodsArr.push(partObj);
               }
            };
               break;
            case (yearStart < yearEnd): {
               console.log('Choose only 1 year!!!')
            };
               break;
            default: {
               console.log('bad choosen period for week')
            }
         };
      }

   };
   return periodsArr;
}

module.exports = {
   format_date,
   getMyFormatDate,
   isTodayTextUK,
   dayWithoutTime,
   getMyFormatTime,

   getSQLFormatDate,

   getMonthName,
   getKvartalName,
   getHalfYearName,
   getPeriodArr,
   devidePartsPeriod
}