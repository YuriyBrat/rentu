// ф-я перевіряє текст з бази по опціях для виводу на сторінці сайту
function checkFieldFront(text, option) {
   if (text == undefined || text == null || text == '') return '';

   text = text.toLowerCase();
   let newtext = '';
   switch (option) {
      case 'currency': {
         if (text.includes('дол')) {
            return '$'
         } else if (text.includes('грн') || text.includes('гривня')) {
            return 'грн'
         } else return text;
      }; break;
      case 'type_walls': {
         if (text.includes('цегл')) {
            return 'ц'
         } else if (text.includes('панел')) {
            return 'п'
         } else return '';
      }; break;

   }
};

const buildTitle = property => {
   let title = '';
   let rooms = '';
   let type_buildings = '';
   if (property.title != undefined) {
      if (property.title != null && property.title != '') {
         return property.title
      }
   }
   if (property?.rooms > 0) {
      rooms = property?.rooms + 'к '
   };
   if (property?.type_buildings) {
      type_buildings = ', ' + property?.type_buildings
   };
   switch (property?.type_estate) {
      case 'квартира': {
         title = rooms + 'квартира' + type_buildings
      };
         break;
      case 'будинок': {
         title = rooms + 'будинок' + type_buildings
      };
         break;
      default: ''
   }
   return title
};

function cutNumbers(str) {
   let newstr = '';
   if (str == '' || str == undefined || str == null) return '';

   str = str.toString();
   for (let i = 0; i < str.length; i++) {
      let iV = str[i];

      if (iV != 0 && iV != 1 && iV != 2 && iV != 3 && iV != 4 && iV != 5 && iV != 6 && iV != 7 && iV != 8 && iV != 9) {
         newstr += iV;
      }
   }
   return newstr;
};

function cutLetters(str) {
   let newstr = '';
   if (str == '' || str == undefined || str == null) return '';

   str = str.toString();
   for (let i = 0; i < str.length; i++) {
      let iV = str[i];

      if (iV == 0 || iV == 1 || iV == 2 || iV == 3 || iV == 4 || iV == 5 || iV == 6 || iV == 7 || iV == 8 || iV == 9 || iV == '.' || iV == ',') {
         newstr += iV;
      }
   }
   return newstr;
};


module.exports = {
   checkFieldFront,
   buildTitle,
   cutNumbers,
   cutLetters
}