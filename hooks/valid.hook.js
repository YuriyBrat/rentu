// ф-я перевірки номеру телефону і вирізки усіх символів крім цифр
const checkPhone = str => {
   let newstr = "";
   let errCount = 0;
   let errText = "";
   try {
      str = str.trim();
      for (let i = 0; i < str.length; i++) {
         let s = str[i];
         switch (true) {
            case (i == 0 && (s == "+" || s == 0)): newstr += s; break;
            // case (i == 0): newstr += parseInt(s); break;
            default: {
               if (Number.isInteger(Number(s))) {
                  newstr += s
               }
            }
         }
      }
   } catch (error) {
      return newstr
   }


   // 2 step. Check correct number
   const lenNum = newstr.length;
   if (lenNum > 0) {
      const sFirst = str[0].toString();
      const sSec = str[1].toString();
      switch (lenNum) {
         case 9: {
            if (sFirst !== "0" && sFirst !== "+") {
               newstr = "0" + newstr
            } else {
               errCount++;
               errText = "Будь ласка, виправте неправильний номер телефону"
            }
         };
            break;
         case 10: {
            if (sFirst !== "0" && sFirst !== "+") {
               errCount++;
               errText = "Будь ласка, виправте неправильний номер телефону"
            } else if (sFirst == "+" && sSec != "0") {
               newstr = "0" + newstr.substring(1); //cut + and add 0
            }
         };
            break;
         case 11: {
            if (sFirst == "8" && sSec == "0") {
               newstr = newstr.substring(1); //cut 8
            } else if (sFirst == "3" && sSec == "0") {
               newstr = newstr.substring(1); //cut 3
            } else if (sFirst == "+" && sSec == "0") {
               newstr = newstr.substring(1); //cut +
            } else {
               errCount++;
               errText = "Будь ласка, виправте неправильний номер телефону"
            }
         };
            break;
         case 12: {
            if (newstr.substring(0, 3) == "380") {
               newstr = "+" + newstr
            } else if (newstr.substring(0, 3) == "+80" || newstr.substring(0, 3) == "+30" || newstr.substring(0, 3) == "+38") {
               newstr = "+380" + newstr.substring(3);
            } else {
               errCount++;
               errText = "Будь ласка, виправте неправильний номер телефону"
            }
         };
            break;
         case 13: {
            if (newstr.substring(0, 4) != "+380") {
               errCount++;
               errText = "Будь ласка, виправте неправильний номер телефону"
            }
         };
            break;
         default: {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
         }
      }
   }
   // console.log('Перевірений номер телефону ' + newstr);
   return { newstr, errCount, errText }
};

const checkFieldsByOptions = (fieldsObj) => {

   let newtext = '';
   let errCount2 = 0;
   let errText2 = "";

   for (let key in fieldsObj) {
      let kVal = fieldsObj[key];
      if (kVal == undefined || kVal == null || kVal == '') {
         fieldsObj[key] = '';
         continue;
      };
      kVal = kVal.toString();
      switch (key) {
         case 'square_tot': {

            newtext = kVal.replace(',', '.');
            newtext = Number(newtext);
            newtext = Math.round(newtext, 1);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні загальної площі. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;
         case 'square_liv': {
            newtext = kVal.replace(',', '.');
            newtext = Number(newtext);
            newtext = Math.round(newtext, 1);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні житлової площі. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;
         case 'square_kit': {
            newtext = kVal.replace(',', '.');
            newtext = Number(newtext);
            newtext = Math.round(newtext, 1);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні площі кухні. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;

         case 'rooms': {

            newtext = Number(kVal);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні кількості кімнат. '
            } else if (newtext > 20) {
               errCount2++;
               errText2 += 'Вказано забагато кімнат. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;
         case 'floor': {
            newtext = Number(kVal);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні поверху. '
            } else if (newtext > 100) {
               errCount2++;
               errText2 += 'Вказано завеликий поверх. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;
         case 'floors': {

            newtext = Number(kVal);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні кількості поверхів. '
            } else if (newtext > 100) {
               errCount2++;
               errText2 += 'Вказано забагато поверхів. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;
         case 'balconies': {

            newtext = Number(kVal);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні кількості балконів. '
            } else if (newtext > 20) {
               errCount2++;
               errText2 += 'Вказано забагато балконів. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;

         case 'cost': {

            newtext = Number(kVal);
            if (!newtext) {
               errCount2++;
               errText2 += 'Виправте помилку у вказанні вартості. '
            } else {
               fieldsObj[key] = newtext;
            }
         }; break;

      }
   }

   const fieldsPropNew = fieldsObj;
   return { fieldsPropNew, errCount2, errText2 }
}


module.exports = {
   checkPhone,
   checkFieldsByOptions
}