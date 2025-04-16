// const { Router } = require('express');
const docx = require("docx");
//! const fs = require('fs');

// const router = Router();
// const { QueryTypes } = require('sequelize');

// const connectDb = require('../db/mysql/connection');
// const d = require('../hooks/date.hook');
// const t = require('../hooks/text.hook');
// const f = require('../hooks/func.hook');
// const q = require('../db/mysql/build.query');
// const c = require('config');

const { Document, Packer, Paragraph, Tab, TextRun, SequentialIdentifier,
   Table, TableRow, TableCell, Footer, VerticalAlign, AlignmentType,
   SectionType, PageOrientation, HeadingLevel, ShadingType, WidthType, convertInchesToTwip, convertMillimetersToTwip,
   BorderStyle, UnderlineType, HeightRule } = docx;


function sectionListTitle() {

   return {
      properties: {
         type: SectionType.NEXT_PAGE,
         page: {
            margin: {
               top: 568,
               right: 568,
               bottom: 568 * 1.5,
               left: 568,
            },
         },
      },
      children: [
         new Paragraph({
            children: [
               new TextRun({
                  text: "Наявність особового складу добового наряду,",
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: "знання ними обов’язків, стан озброєння,",
                  size: 24,
                  bold: true,
                  break: 1
               }),
               new TextRun({
                  text: "форму одягу перевірив.",
                  size: 24,
                  bold: true,
                  break: 1
               }),
               new TextRun({
                  text: "Заходи безпеки під час несення служби доведено.",
                  size: 24,
                  bold: true,
                  break: 1
               }),
               new TextRun({
                  text: "Черговий військової частини _______________________________________________________",
                  size: 24,
                  bold: true,
                  break: 1
               })
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
               after: 200,
            },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: "ВІДОМІСТЬ ДОБОВОГО НАРЯДУ ПІДРОЗДІЛУ ПОСИЛЕННЯ",
                  size: 30,
                  // bold: true,
               }),
               new TextRun({
                  text: "ВІЙСЬКОВОЇ ЧАСТИНИ А0998",
                  size: 30,
                  // bold: true,
                  break: 1
               }),
               new TextRun({
                  text: "на “ ___ “ _____________2023 року.",
                  size: 28,
                  break: 1
               })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
               before: 500,
               after: 500,
            },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: "Розписи попереднього чергового  та нового чергового про зміну добового наряду  і записи про виявлені недоліки",
                  size: 28,
                  bold: true,
                  //    underline: {
                  //       type: UnderlineType.SINGLE,
                  //       size: 2,
                  //       color: "#000000",
                  //   },
               })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
               after: 400,
            },
         }),

         createLinesTable(15, { after: 150 }),

         new Paragraph({
            children: [
               // new Tab(),
               new TextRun({
                  text: "Здав:             __________________________________",
                  size: 24
               })
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
               before: 400,
               after: 400,
            },
            indent: {
               left: 600,
            }
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: "Прийняв :  ___________________________________",
                  size: 24
               })
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
               after: 400,
            },
            indent: {
               left: 600,
            }
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: "РОЗКЛАД  МАРШРУТІВ (ПОСТІВ)",
                  size: 30
               })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
               before: 400,
               after: 400,
            }
         }),

         new Table({
            width: {
               size: 100,
               type: WidthType.PERCENTAGE,
            },
            rows: [
               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `Наряд від`,
                                    size: 24,
                                 }),
                              ],
                              alignment: AlignmentType.LEFT,
                           })
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,
                        width: {
                           size: 28,
                           type: WidthType.PERCENTAGE,
                        },
                        // margins: {
                        //    top: convertInchesToTwip(0.1),
                        //    bottom: convertInchesToTwip(0.1),
                        // },
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `запасної роти військової частини А0998`,
                                    size: 24,
                                 }),
                              ],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,
                        width: {
                           size: 72,
                           type: WidthType.PERCENTAGE,
                        },
                        // margins: {
                        //    top: convertInchesToTwip(0.1),
                        //    bottom: convertInchesToTwip(0.1),
                        // },
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.SINGLE
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               }),
               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [],
                           })
                        ],
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `(номер підрозділу, військової частини)`,
                                    size: 20,
                                    italics: true
                                 }),
                              ],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.TOP,

                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               }),

               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `Черговий підрозділу посилення`,
                                    size: 24,
                                 }),
                              ],
                              alignment: AlignmentType.LEFT,
                           })
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,

                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.SINGLE
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               }),
               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [],
                           })
                        ],
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `(військове звання, прізвище, ім'я та по батькові)`,
                                    size: 20,
                                    italics: true
                                 }),
                              ],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.TOP,
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               }),

               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `Помічник чергового підрозділу посилення`,
                                    size: 24,
                                 }),
                                 new TextRun({
                                    text: `(черговий роти 3-го поверху)`,
                                    size: 24,
                                    break: 1
                                 }),
                              ],
                              alignment: AlignmentType.LEFT,
                           }),
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,

                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.BOTTOM,
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.SINGLE
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               }),
               new TableRow({
                  children: [
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [],
                           })
                        ],
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                     new TableCell({
                        children: [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `(військове звання, прізвище, ім'я та по батькові)`,
                                    size: 20,
                                    italics: true
                                 }),
                              ],
                              alignment: AlignmentType.CENTER,
                           })
                        ],
                        verticalAlign: VerticalAlign.TOP,
                        borders: {
                           top: {
                              style: BorderStyle.NIL
                           },
                           right: {
                              style: BorderStyle.NIL
                           },
                           bottom: {
                              style: BorderStyle.NIL
                           },
                           left: {
                              style: BorderStyle.NIL
                           },

                        },
                     }),
                  ],
               })
            ],

         }),
      ],
   }
};
function sectionListTest() {

   return (
      {
         properties: {
            type: SectionType.NEXT_PAGE,
         },
         children: [
            new Paragraph({
               children: [
                  new TextRun({
                     text: `Про результати службового розслідування для встановлення причин та умов, які сприяли відсутності на службі без поважних причин капітана АНДРУСИКА Андрія Васильовича`,
                     size: 28
                  })
               ],
               spacing: {
                  after: 200,
               },
               alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: `Згідно наказу командира військової частини А0998 №920-АД від 28 липня 2022 року`,
                     size: 28,
                  }),
                  new TextRun({
                     text: `заступником командира запасної роти з морально-психологічного забезпечення військової частини А0998`,
                     size: 28,
                     spacing: 1,
                     // highlight: "yellow", //! підсвітка фону
                     // shading: {
                     //    type: ShadingType.REVERSE_DIAGONAL_STRIPE,
                     //    color: "00FFFF",
                     //    fill: "FF0000",
                     // },
                     // strike: true, //! закреслено
                     // allCaps: true, //! великі
                     // break: 1,
                  }),
                  new TextRun({
                     text: `лейтенантом ЦЮПКА Юрієм Юрійовичем проведено службове розслідування з метою встановлення причин та умов самовільного залишення військової частини А0998 (без зброї), офіцером резерву запасної роти військової частини А0998 капітаном АНДРУСИКОМ Андрієм Васильовичем.`,
                     size: 28,
                     characterSpacing: 1
                  })
               ],
               alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
               children: [
                  new TextRun({
                     text: `Приводом і підставою для службового розслідування став рапорт (вхідний №30040) командира запасної роти військової частини А0998 підполковника ПЕТРИКА Андрія Анатолійовича від 28 липня 2022 року.`,
                     size: 28,
                  })
               ],
               alignment: AlignmentType.JUSTIFIED,
               // outlineLevel: 1, //! you can close open below info
               // thematicBreak: true, 
               spacing: {
                  before: 200,
                  // line: 300, //! between lines
               },
               indent: { //! All paragraph left indent if left
                  // start: 720,
                  firstLine: 852
               },
            }),

         ],
      }
   )
};

const dataDealZs = {
   numberZS: '24/51',
   placeZS: 'м. Львів',
   dateZS: '28 березня 2025 р.',
   nameFOP: "ФОП Рачун Юрій Тарасович",
   dateZSLast: '28 червня 2025 р.',

   zsCurrency: 'долар',
   zsForex: '59,51',
   zsAvans: '2113',
   zsAvansRP: '',
   estateCost: '123519',
   RP_Customer: '1650',


   estateName: 'одно-кімнатну квартиру',
   estateAdress: 'м.Львів, вулиця Замарстинівська 170, проектний номер №03/5',
   estateDocuments: 'Попередній договір №03/5 від 24 червня 2021 року з ТзОВ "Агенція нерухомості "Грінвіль Парк Львів""',

   customerPIB: 'Сорочинська Євгенія Михайлівна',
   cPassUkr: 'КА №715409',
   cPassElse: '',
   cIPN: '2120621207',
   cPassIssued: 'Шевченківським РВ ЛМУ УМВС України у Львівській області',
   cPassDate: '16 грудня 1997 року',
   cPlaceRegister: 'м.Львів, вулиця Джерельна 27, квартира 1',

   sellerPIB: 'Грушка Василь Михайлович',
   selPassUkr: 'СВ №164021',
   selPassElse: '',
   selIPN: '2282325218',
   selPassIssued: 'Веселівським РВ УМВС України в Запорізькій області',
   selPassDate: '14 лютого 2000 року',
   selPlaceRegister: 'м.Радехів, вулиця Поповича 26, Радехівський район, Львівська область',

   dateMoveOut: '12 липня 2025 р.',
   furnitureRemain: 'усі двері, шафа, диван.',

   costsNotarDeal: '',
   costsNotarCheking: '',
   costsOcinka: '',
   costs_5PPFO_15VZ: '',
   costs_1DM: '',
   costs_1PF: '',
   costsAdd: '',
   costsElse: '',

   perANremove: '0.35',  // вітсоток для АН якщо не було авансу для АН
};


function number_to_string(_number, kind = "") { // переводить число у текст kind = гривня або долар або пусто взагалі
   // if (isNaN(parseFloat(_number))) {
   //    return ""
   // } else {
   //    _number = parseFloat(_number).toFixed(2);
   // };


   if (kind != "") {
      if (kind.toLowerCase().includes('дол')) {
         kind = "долар"
      }
   }
   var _arr_numbers = new Array();
   _arr_numbers[1] = new Array('', 'одна', 'дві', 'три', 'чотири', `п'ять`, 'шість', 'сім', 'вісім', `дев'ять`, 'десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', `п'ятнадцять`, 'шістнадцять', 'сімнадцять', 'вісімнадцять', `дев'ятнадцять`);
   _arr_numbers[2] = new Array('', '', 'двадцять', 'тридцять', 'сорок', `п'ятдесят`, 'шістдесят', 'сімдесят', 'вісімдесят', `дев'яносто`);
   _arr_numbers[3] = new Array('', 'сто', 'двісті', 'триста', 'чотириста', `п'ятсот`, 'шістсот', 'сімсот', 'вісімсот', `дев'ятсот`);

   function number_parser(_num, _desc) {
      var _string = '';
      var _num_hundred = '';

      if (_num.length == 3) {
         _num_hundred = _num.substr(0, 1);
         _num = _num.substr(1, 3);
         _string = _arr_numbers[3][_num_hundred] + ' ';
      }
      if (_num < 20) _string += _arr_numbers[1][parseFloat(_num)] + ' ';
      // Вроді num то 2 і 3я цифри, тому двозначне! АААА! Тому що у нас двозначна строка а не число, бо може бути 04, тоді parseFloat витягує цифри!!
      else {
         var _first_num = _num.substr(0, 1);
         var _second_num = _num.substr(1, 2); // ту 2а цифра мала б бути 1
         _string += _arr_numbers[2][_first_num] + ' ' + _arr_numbers[1][_second_num] + ' ';
      }

      switch (_desc) {
         case 0: {
            var _last_num = parseFloat(_num.substr(-1));
            var _last_num2 = parseFloat(_num.substr(-2));
            if (kind == "гривня") {
               if (_last_num == 1 && _last_num2 != 11) _string += 'гривня';
               // else if (_last_num > 1 && _last_num < 5 && _last_num2 != 11 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14 && _last_num2 != 15) _string += 'гривні';
               else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'гривні';
               else _string += 'гривень';
            } else if (kind.toLowerCase().includes('дол')) {
               if (_last_num == 1 && _last_num2 != 11) {
                  _string += 'долар США';
                  _string = _string.replace("одна ", "один ")
               }
               // else if (_last_num > 1 && _last_num < 5 && _last_num2 != 11 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14 && _last_num2 != 15) _string += 'гривні';
               else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) {
                  _string += 'долари США';
                  if (_last_num == 2) {
                     _string = _string.replace("дві ", "два ")
                  }
               }
               else _string += 'доларів США';
            } else if (kind != "") { //євро наприклад
               _string += kind;

               if (_last_num == 2) {
                  _string = _string.replace("дві ", "два ")
               } else if (_last_num == 1 && _last_num2 != 11) {
                  _string = _string.replace("одна ", "один ")
               }
            } else {
               _string += '';

               if (_last_num == 2) {
                  _string = _string.replace("дві ", "два ")
               } else if (_last_num == 1 && _last_num2 != 11) {
                  _string = _string.replace("одна ", "один ")
               }
            }
         }

            break;
         case 1:
            var _last_num = parseFloat(_num.substr(-1));
            var _last_num2 = parseFloat(_num.substr(-2));
            if (_last_num == 1 && _last_num2 != 11) _string += 'тисяча ';
            // else if (_last_num > 1 && _last_num < 5 && _last_num2 != 11 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14 && _last_num2 != 15) _string += 'тисячі ';
            else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'тисячі ';
            else _string += 'тисяч ';
            //   _string = _string.replace('один ', 'одна ');
            //  _string = _string.replace('два ', 'дві ');
            break;
         case 2:
            var _last_num = parseFloat(_num.substr(-1));
            if (_last_num == 1) _string += 'мільйон ';
            else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'мільйони ';
            else _string += 'мільйонів ';
            _string = _string.replace('одна ', 'один ');
            _string = _string.replace('дві ', 'два ');
            break;
         case 3:
            var _last_num = parseFloat(_num.substr(-1));
            if (_last_num == 1) _string += 'мільярд ';
            else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'мільярди ';
            else _string += 'мільярдів ';
            _string = _string.replace('одна ', 'один ');
            _string = _string.replace('дві ', 'два ');
            break;
      }
      _string = _string.replace('  ', ' ');
      return _string;
   }

   function decimals_parser(_num) {
      if (parseFloat(_num) == 0 || isNaN(parseFloat(_num))) return '';

      var _first_num = _num.substr(0, 1);
      var _second_num = parseFloat(_num.substr(1, 2));
      var _string = ' ' + _first_num + _second_num;
      if (kind == "гривня") {
         if (_second_num == 1 && _first_num != 1) _string += ' копійка';
         else if (_second_num > 1 && _second_num < 5) _string += ' копійки';
         else _string += ' копійок';
         return _string;
      } else if (kind == "долар" || kind != "") {
         if (_second_num == 1 && _first_num != 1) _string += ' цент';
         else if (_second_num > 1 && _second_num < 5) _string += ' центи';
         else _string += ' центів';
         return _string;
      } else {
         var _first_num = _num.substr(0, 1);
         var _second_num = parseFloat(_num.substr(1, 2));
         var _string = ' ' + _first_num + _second_num;
         return _string;
      }
   }



   if (!_number || _number == 0) return 'нуль'  //! false; // взагалі не поняв
   if (typeof _number !== 'number') {
      _number = _number.replace(',', '.');
      _number = parseFloat(_number); // виймає число з тексту
      if (isNaN(_number)) return false;
   }
   _number = _number.toFixed(2);
   if (_number.indexOf('.') != -1) {   // перевіряємо чи є десятизначні, їх лише до 99
      var _number_arr = _number.split('.');
      var _number = _number_arr[0];  // тут отримали число до коми
      var _number_decimals = _number_arr[1]; // тут число після коми від 01 до 99
   }

   var _number_length = _number.length;
   var _string = '';
   var _num_parser = '';
   var _count = 0;
   for (var _p = (_number_length - 1); _p >= 0; _p--) {
      var _num_digit = _number.substr(_p, 1);
      _num_parser = _num_digit + _num_parser; // переписуємо наново число і беремо по три цифри окремо і вказуємо кількість загальну ітерацій щоб визначити чи тисячі чи мільйони чи мільярди
      if ((_num_parser.length == 3 || _p == 0) && !isNaN(parseFloat(_num_parser))) {
         _string = number_parser(_num_parser, _count) + _string;
         _num_parser = '';
         _count++;
      }
   }
   if (_number_decimals > 0) _string += decimals_parser(_number_decimals);
   return _string;
};

function textCaseCurrency(_number, kind = "") {
   let _num = 0;
   if (typeof _number !== 'number') {
      _number = _number.replace(',', '.');
      _number = parseFloat(_number); // виймає число з тексту
      if (isNaN(_number)) return false;
   }
   _number = _number.toFixed(2);
   if (_number.indexOf('.') != -1) {   // перевіряємо чи є десятизначні, їх лише до 99
      let _number_arr = _number.split('.');
      _num = _number_arr[0];  // тут отримали число до коми
      // var _number_decimals = _number_arr[1]; // тут число після коми від 01 до 99
   }


   let _string = "";
   var _last_num = parseFloat(_num.substr(-1));
   var _last_num2 = parseFloat(_num.substr(-2));

   if (kind == "гривня") {
      if (_last_num == 1 && _last_num2 != 11) _string += 'гривня';
      // else if (_last_num > 1 && _last_num < 5 && _last_num2 != 11 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14 && _last_num2 != 15) _string += 'гривні';
      else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'гривні';
      else _string += 'гривень';
      // curr.toLowerCase().includes('дол')
   } else if (kind.toLowerCase().includes('дол')) {
      if (_last_num == 1 && _last_num2 != 11) _string += 'долар США';
      else if (_last_num > 1 && _last_num < 5 && _last_num2 != 12 && _last_num2 != 13 && _last_num2 != 14) _string += 'долари США';
      else _string += 'доларів США';
   } else if (kind != "") { //євро наприклад
      _string += kind;
   } else {
      _string += '';
   }
   return _string
};


function tableTwoColumns(text1, text2) {

   return new Table({
      width: {
         size: 100,
         type: WidthType.PERCENTAGE,
      },
      style: {
         // size: 24,
      },
      rows: [
         new TableRow({
            children: [
               new TableCell({
                  children: [
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: text1,
                              size: 24,
                              bold: true,
                           }),
                        ],
                        alignment: AlignmentType.LEFT,
                     })
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  width: {
                     size: 60,
                     type: WidthType.PERCENTAGE,
                  },
                  margins: {
                     top: convertInchesToTwip(0.1),
                     bottom: convertInchesToTwip(0.1),
                  },
                  borders: {
                     top: {
                        style: BorderStyle.NIL
                     },
                     right: {
                        style: BorderStyle.NIL
                     },
                     bottom: {
                        style: BorderStyle.NIL
                     },
                     left: {
                        style: BorderStyle.NIL
                     },

                  },
               }),
               new TableCell({
                  children: [
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: text2,
                              size: 24,
                              bold: true,
                           }),
                        ],
                        alignment: AlignmentType.RIGHT,
                     })
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  width: {
                     size: 40,
                     type: WidthType.PERCENTAGE,
                  },
                  margins: {
                     top: convertInchesToTwip(0.05),
                     bottom: convertInchesToTwip(0.05),
                  },
                  borders: {
                     top: {
                        style: BorderStyle.NIL
                     },
                     right: {
                        style: BorderStyle.NIL
                     },
                     bottom: {
                        style: BorderStyle.NIL
                     },
                     left: {
                        style: BorderStyle.NIL
                     },

                  },
               })
            ],
         })
      ],

   })
};

function fixCurrText(curr) {
   if (curr.toLowerCase().includes('дол')) {
      return 'доларів США'
   } else return curr
};

function buildAvansText(dataDealZs) { //also Duty else
   const obj = {
      textAvans: '',
      textDutyOwner: '',
      textDutyCustomer: '',

      textDateOut: '',
      textFurniture: ''
   }

   const forex = Number(dataDealZs.zsForex.replace(",", "."));
   const avansAll = Number(dataDealZs.zsAvans);
   const avansAN = Number(dataDealZs.zsAvansRP);

   const avansOwner = avansAll - avansAN;

   const avansAllUkr = (avansAll * forex).toFixed(2);
   const avansANUkr = (avansAN * forex).toFixed(2);
   const avansOwnerUkr = (avansOwner * forex).toFixed(2);

   if (avansAll > 0 && avansAN > 0 && avansAll != avansAN) {
      obj.textAvans = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.4. Сторони дійшли згоди, що в підтвердження факту наміру укладення Договору купівлі-продажу Об’єкту продажу та з метою забезпечення його виконання
Покупець (ці) передає Продавцю (цям)  та Агентству нерухомості грошову суму у розмірі  ${avansAllUkr} ${textCaseCurrency(avansAllUkr, "гривня")} (${number_to_string(avansAllUkr, "гривня")}),
що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${avansAll} ${textCaseCurrency(avansAll, dataDealZs.zsCurrency)} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string(avansAll, dataDealZs.zsCurrency)}) по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency}  за згодою сторін на день підписання даного Договору,
яка розподіляється  між  Продавцем і Агентством нерухомості у  таких частинах:`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `2.4.1. Продавцю (цям) передається Покупцем (ями), як завдаток, в рахунок належного за цим Договором платежу, зазначеного в п.2.2. даного Договору,
грошова сума у розмірі ${avansOwnerUkr} ${textCaseCurrency(avansOwnerUkr, "гривня")} (${number_to_string(avansOwnerUkr, "гривня")}), що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${avansOwner} ${textCaseCurrency(avansOwner, dataDealZs.zsCurrency)} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string((avansOwner), dataDealZs.zsCurrency)}), по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency} за згодою сторін на день підписання даного Договору;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `2.4.2.Агентству нерухомості передається Покупцем (ями) грошова сума у  розмірі ${avansANUkr} ${textCaseCurrency(avansANUkr, "гривня")} (${number_to_string(avansANUkr, "гривня")}),
що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${avansAN} ${textCaseCurrency(avansAN, dataDealZs.zsCurrency)} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string((avansAN), dataDealZs.zsCurrency)}), по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency} за згодою сторін на день підписання даного Договору,
ця сума залишається на зберіганні в Агентстві нерухомості до укладення нотаріально посвідченого Договору купівлі-продажу для забезпечення п.п. 3.1. та 3.2.,
після чого ця сума йде в рахунок оплати послуг Агентства нерухомості (п.п. 6.2., 6.3.).`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
      ];

      obj.textDutyOwner = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку відмови чи ухилення Продавця (ців) від нотаріального посвідчення Договору купівлі-продажу
об'єкту продажу на умовах цього Договору чи невиконання (порушення виконання) умов цього Договору з його
вини, Продавець (ці) зобов'язаний повернути Покупцю (цям) подвійну суму, вказану в п. 2.4.1, в триденний термін з
моменту відмови від укладення нотаріально посвідченого Договору купівлі-продажу об'єкту, при чому сума,
зазначена в п. 2.4.2., залишається Агентству нерухомості в якості винагороди за уже здійснену роботу.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];

      obj.textDutyCustomer = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку  відмови чи ухилення Покупця (ців) від нотаріального посвідчення Договору купівлі-продажу об'єкту продажу 
або порушення інших зобов'язань по даному Договору, в тому числі зобов'язань по термінам здійснення Договору купівлі-продажу,
грошова сума, вказана в п. 2.4., поверненню не підлягає і Покупець (ці) не має права вимагати її повернення, при
цьому сума, зазначена в п. 2.4.2., залишається Агентству нерухомості в якості винагороди за уже здійснену роботу.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];
   } else if ((avansAll > 0 && (avansAN == 0 || avansAN == ""))) { // avans only for Owner
      obj.textAvans = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.4. Сторони дійшли згоди, що в підтвердження факту наміру укладення Договору купівлі-продажу Об’єкту продажу та з метою забезпечення його виконання
Покупець (ці) передає Продавцю (цям) грошову суму, як завдаток, в рахунок належного за цим Договором платежу, зазначеного в п.2.2. даного Договору,
у розмірі  ${avansAllUkr} ${textCaseCurrency(avansAllUkr, "гривня")} (${number_to_string(avansAllUkr, "гривня")}), що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${avansAll} ${textCaseCurrency(avansAll, dataDealZs.zsCurrency)} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string(avansAll, dataDealZs.zsCurrency)}) по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency}  за згодою сторін на день підписання даного Договору.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         })
      ];

      obj.textDutyOwner = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку відмови чи ухилення Продавця (ців) від нотаріального посвідчення Договору купівлі-продажу
об’єкту продажу на умовах цього Договору чи невиконання (порушення виконання) умов цього Договору з його
вини, Продавець (ці) зобов'язаний повернути Покупцю (цям) подвійну суму, вказану в п. 2.4, в триденний термін з
моменту відмови від укладення нотаріально посвідченого Договору купівлі-продажу об'єкту, при чому частину
поверненої суми, а саме еквівалент ${Math.round(avansAll * dataDealZs.perANremove)} ${textCaseCurrency(Math.round(avansAll * dataDealZs.perANremove), dataDealZs.zsCurrency)}, передається Агентству нерухомості в якості винагороди за
уже здійснену роботу.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];

      obj.textDutyCustomer = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку  відмови чи ухилення Покупця (ців) від нотаріального посвідчення Договору купівлі-продажу об'єкту продажу або порушення інших
зобов'язань по даному Договору, в тому числі зобов'язань по термінам здійснення Договору купівлі-продажу,
грошова сума, вказана в п. 2.4., поверненню не підлягає і Покупець (ці) не має права вимагати її повернення, при
чому частину суми, даної Продавцю згідно п.2.4., а саме еквівалент ${Math.round(avansAll * dataDealZs.perANremove)} ${textCaseCurrency(Math.round(avansAll * dataDealZs.perANremove), dataDealZs.zsCurrency)}, Продавець передає
Агентству нерухомості в якості винагороди за уже здійснену роботу.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];
   } else { // avans only for AN
      obj.textAvans = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.4. Сторони дійшли згоди, що в підтвердження факту наміру укладення Договору купівлі-продажу Об’єкту продажу та з метою забезпечення його виконання
Агентству нерухомості передається Покупцем (ями) грошова сума у розмірі  ${avansANUkr} ${textCaseCurrency(avansANUkr, "гривня")} (${number_to_string(avansANUkr, "гривня")}), 
що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${avansAN} ${textCaseCurrency(avansAN, dataDealZs.zsCurrency)} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string(avansAN, dataDealZs.zsCurrency)}) по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency}  за згодою сторін на день підписання даного Договору,
ця сума залишається на зберіганні в Агентстві нерухомості до укладення нотаріально посвідченого Договору купівлі-продажу для забезпечення п.п. 3.1. та 3.2., 
після чого ця сума йде в рахунок оплати послуг Агентства нерухомості (п.п. 6.2., 6.3.).`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         })
      ];

      obj.textDutyOwner = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку відмови чи ухилення Продавця (ців) від нотаріального посвідчення Договору купівлі-продажу Об'єкту продажу 
на умовах цього Договору чи невиконання (порушення виконання) умов цього Договору
по причині продажу іншій особі, Агентство нерухомості зобов'язане повернути Покупцю (цям) суму, вказану в п.
2.4.2, в триденний термін з моменту відмови від укладення нотаріально посвідченого Договору купівлі-продажу Об'єкту продажу.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];

      obj.textDutyCustomer = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `- у випадку  відмови чи ухилення Покупця (ців) від нотаріального посвідчення Договору купівлі-продажу об'єкту продажу або порушення інших
зобов'язань по даному Договору, в тому числі зобов'язань по термінам здійснення Договору купівлі-продажу,
грошова сума, вказана в п. 2.4., поверненню не підлягає і Покупець (ці) не має права вимагати її повернення.`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      ];
   };


   let numTextFur = '6.5';
   if (dataDealZs.dateMoveOut != '') {
      obj.textDateOut = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `6.5. Сторони узгодили, що фактична передача квартири Покупцю повинна відбутися не пізніше `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `${dataDealZs.dateMoveOut}`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         })
      ];

      numTextFur = '6.6'
   };

   if (dataDealZs.furnitureRemain != '') {
      obj.textFurniture = [
         new Paragraph({
            children: [
               new TextRun({
                  text: `${numTextFur} Сторони узгодили (це входить в ціну Об’єкту продажу), що Продавець залишає без доплати в Об’єкті 
продажу: ${dataDealZs.furnitureRemain}`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         })
      ];
   };


   return obj
};


function buildCosts(dataDealZs) {

   let arr = [];

   if (dataDealZs.costsNotarDeal != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати нотаріального посвідченням Договору купівлі-продажу об'єкту продажу оплачує ${dataDealZs.costsNotarDeal};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costsNotarCheking != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати нотаріальних довідок перед посвідченням Договору купівлі-продажу об'єкту продажу оплачує ${dataDealZs.costsNotarCheking};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costsOcinka != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати із виготовлення експертної оцінки оплачує ${dataDealZs.costsOcinka};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costs_1DM != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати 1% Державне Мито оплачує ${dataDealZs.costs_1DM};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costs_1PF != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати 1% Пенсійний Фонд оплачує ${dataDealZs.costs_1PF};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costs_5PPFO_15VZ != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати 5% податок з доходів фізичних осіб та 5% військовий збір оплачує ${dataDealZs.costs_5PPFO_15VZ};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costsAdd != '') {
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: `-витрати з виготовлення додаткових довідок, необхідних для посвідчення Договору купівлі-продажу об'єкту продажу
оплачує ${dataDealZs.costsAdd};`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   };
   if (dataDealZs.costsElse != '') { // абсолютно інші витрати і домовленості, що прописані текстом через кому
      arr.push(
         new Paragraph({
            children: [
               new TextRun({
                  text: dataDealZs.costsElse,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
      )
   }

   return arr
};

const spacingAfter = 200;
const indentFirst = 600;

const forex = Number(dataDealZs.zsForex.replace(",", "."));


function buildDealZS(dataDealZs) {
   let section1 = {
      properties: {
         type: SectionType.NEXT_PAGE,
         page: {
            margin: {
               top: 568,
               right: 568,
               bottom: 568,
               left: 568 * 2,
            },
         },
      },
      footers: {
         default: new Footer({ // The standard default footer on every page or footer on odd pages when the 'Different Odd & Even Pages' option is activated
            children: [
               new Paragraph({
                  children: [
                     new TextRun({
                        text: `Продавець (ці): __________________________     Покупець (ці): ____________________________`,
                        size: 24,
                        bold: false,
                     }),
                  ],
                  alignment: AlignmentType.CENTER,
                  // indent: { firstLine: indentFirst },
                  spacing: { before: spacingAfter },
               }),
               new Paragraph({
                  children: [
                     new TextRun({
                        text: `${dataDealZs.nameFOP} (агентство нерухомості) _________________________________`,
                        size: 24,
                        bold: false,
                     }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: spacingAfter },
                  // indent: { firstLine: indentFirst },
               }),
            ],
         }),
         // first: new Footer({ // The footer on first page when the 'Different First Page' option is activated
         //    children: [],
         // }),
         // even: new Footer({ // The footer on even pages when the 'Different Odd & Even Pages' option is activated
         //    children: [],
         // }),
      },
      children: [
         new Paragraph({
            children: [
               new TextRun({
                  text: `ДОГОВІР №${dataDealZs.numberZS}`,
                  size: 24,
                  bold: true,
                  //    underline: {
                  //       type: UnderlineType.SINGLE,
                  //       size: 2,
                  //       color: "#000000",
                  //   },
               }),
               new TextRun({
                  text: "про наміри купівлі-продажу об’єкту нерухомості",
                  size: 24,
                  bold: true,
                  break: 1
               }),
            ],
            alignment: AlignmentType.CENTER,
         }),
         tableTwoColumns(dataDealZs.placeZS, dataDealZs.dateZS),

         // new Paragraph({
         //    children: [
         //       new TextRun({ text: "Hey everyone", bold: true }),
         //       new TextRun("\t11th November 1999"),
         //       new TextRun({
         //          children: [new Tab(), "11th November 1999"],
         //       }),
         //    ],
         //    tabStops: [
         //       {
         //          type: docx.TabStopType.RIGHT,
         //          position: docx.TabStopPosition.MAX,
         //       },
         //    ],
         // })
         new Paragraph({
            children: [
               new TextRun({
                  text: "1. Учасники Договору:",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
               after: spacingAfter,
            },
            indent: { //! All paragraph left indent if left
               left: 4000,
               // firstLine: 1000
            },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `1.1. Продавець (ці): `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `${dataDealZs.sellerPIB}, `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `ІПН ${dataDealZs.selIPN}, `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `паспорт серії ${dataDealZs.selPassUkr}, виданий ${dataDealZs.selPassIssued} від ${dataDealZs.selPassDate}, місце реєстрації: ${dataDealZs.selPlaceRegister}`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
               after: spacingAfter,
            },
            indent: { //! All paragraph left indent if left
               firstLine: indentFirst,
            },
         }),



         new Paragraph({
            children: [
               new TextRun({
                  text: `та   Покупець (ці): `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `${dataDealZs.customerPIB}, `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `ІПН ${dataDealZs.cIPN}, `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `паспорт серії ${dataDealZs.cPassUkr}, виданий ${dataDealZs.cPassIssued} від ${dataDealZs.cPassDate}, місце реєстрації: ${dataDealZs.cPlaceRegister} `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `з другої Сторони, разом іменовані „Сторони” та ${dataDealZs.nameFOP} (надалі Агентство нерухомості) уклали цей Договір про наступне:`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),


         new Paragraph({
            children: [
               new TextRun({
                  text: "2. Предмет договору:",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: spacingAfter },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.1. Сторони домовилися, що Продавець (ці) продає, а Покупець (ці) купує об'єкт нерухомості, а саме `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `${dataDealZs.estateName}, `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `що знаходиться за адресою:  ${dataDealZs.estateAdress}, надалі Об'єкт продажу, `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `і належить Продавцю (цям) на підставі наступних документів:  ${dataDealZs.estateDocuments} `,
                  size: 24,
                  bold: false,
               })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `2.2. Сторона Продавця (ців) і сторона Покупця (ців) узгодили суму, за яку буде здійснено Договір купівлі-продажу вищевказаного Об'єкту продажу: `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `ціна об'єкту становить ${(Number(dataDealZs.estateCost) * forex).toFixed(2)} ${textCaseCurrency((Number(dataDealZs.estateCost) * forex).toFixed(2), "гривня")} (${number_to_string(Number(dataDealZs.estateCost) * forex, "гривня")}), що становить в еквіваленті `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `${dataDealZs.estateCost} ${textCaseCurrency(dataDealZs.estateCost, dataDealZs.zsCurrency)} `, // доларів США
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `(${number_to_string(dataDealZs.estateCost, dataDealZs.zsCurrency)}), `,
                  size: 24,
                  bold: false,
               }),
               new TextRun({
                  text: `по курсу ${dataDealZs.zsForex} грн/${dataDealZs.zsCurrency} за згодою сторін на день реєстрації нотаріально посвідченого Договору купівлі-продажу.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),


         new Paragraph({
            children: [
               new TextRun({
                  text: `2.3. Сторони Продавця (ців) і Покупця (ців) узгодили строки здійснення намірів купівлі-продажу, а саме до `,
                  size: 24,
                  bold: false,
               }),

               new TextRun({
                  text: `${dataDealZs.dateZSLast} `,
                  size: 24,
                  bold: true,
               }),
               new TextRun({
                  text: `на умовах викладених нижче укласти Договір купівлі-продажу об’єкту продажу.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         ...buildAvansText(dataDealZs).textAvans,

         new Paragraph({
            children: [
               new TextRun({
                  text: `2.5. Право власності на об'єкт продажу переходить до Покупця (ців) в момент реєстрації нотаріально посвідченого Договору купівлі-продажу
і внесення Договору купівлі-продажу до електронного Реєстру прав власності на нерухоме майно.`,
                  size: 24,
                  bold: false,
               })
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.6. Цей Договір є попереднім Договором між Сторонами щодо купівлі-продажу об’єкту продажу,
містить істотні умови основного Договору та складений згідно із ст.ст. 635, 639 Цивільного кодексу України у письмовій формі.`,
                  size: 24,
                  bold: false,
               })
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.7. Сторони Договору засвідчують, що уклали цей Договір, перебуваючи при здоровому розумі, ясній пам'яті,
розуміючи значення своїх дій та правові наслідки укладеного Договору, та підтверджують дійсність намірів при його укладенні,
а також, що він не носить характеру фіктивного та удаваного правочину і не є правочином зловмисним.`,
                  size: 24,
                  bold: false,
               })
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `2.8. Відповідальність за виконання умов даного Договору покладається на обидві Сторони його учасників,
а також на членів їх сімей (Покупець (ці) – якщо подружня пара (на чоловіка чи дружину); Продавець (ці) – на
всіх співвласників об’єкту продажу та членів їх сімей).`,
                  size: 24,
                  bold: false,
               })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),


         new Paragraph({
            children: [
               new TextRun({
                  text: "3. Зобов'язання і відповідальність сторін:",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: spacingAfter },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: "3.1. Продавець (ці):",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- пред'явити всі оригінали обов'язкових документів (документів на об'єкт продажу) та інших документів
(паспортів, свідоцтв про народження, ідентифікаційних кодів, свідоцтв про одруження, свідоцтв про розлучення
(в разі відсутності потрібної інформації у паспорті) всіх учасників Договору купівлі-продажу), необхідних для
здійснення відчуження об'єкту продажу, в тому числі пред’явити (або замовити вироблення) Витяг з Реєстру
прав власності (довідка-характеристика БТІ), за вимогою пред’явити (чи замовити вироблення) Рішення або
Розпорядження опікунської ради (при наявності серед співвласників об'єкту-продажу малолітніх, неповнолітніх,
обмежено-дієздатних або недієздатних осіб), надати їх ксерокопії;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- довести до відома Покупця (ців) про наявність обмежено-дієздатних або недієздатних осіб серед співвласників
об'єкту продажу, про права третіх осіб на об'єкт продажу як в межах, так і за межами України на користування об'єктом
(оренди, найму, лізингу тощо) якщо такі є;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- Продавець (ці) гарантує згоду інших співвласників об'єкту продажу (в т.ч. подружжя) на укладення Договору
купівлі-продажу об’єкту продажу та виконання умов цього Договору, а також те, що об'єкт продажу не проданий, не
подарований, не є об'єктом застави (в тому числі податкової) (якщо є об’єктом застави, повідомити про це Покупця (ців) та
осіб, присутніх при підписанні цього Договору), не внесений в статутний фонд юридичних осіб, не є предметом судового
спору, під забороною (арештом) не перебуває, жодних прихованих недоліків, в тому числі тих, які можуть викликати
аварійний стан чи необхідність реконструкції квартири та наявність яких вплине на зменшення вартості об’єкту продажу,
не має;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- на момент підписання даного Договору забезпечити згоду на відчуження об'єкту продажу решта всіх
співвласників-учасників Договору купівлі-продажу;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- не здійснювати перебудову, перепланування об'єкту-продажу, не проводити демонтаж сантехнічних,
електротехнічних, опалювальних і газових систем, а також не здійснювати інших дій, що призведуть до погіршення якості
об'єкту продажу відносно його стану на момент останнього огляду Покупцем (ями);`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- до укладення нотаріально посвідченого Договору купівлі-продажу не відчужувати об’єкт продажу іншим особам, не надавати його в користування
та не передавати в заставу;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- дотримуватись умов, викладених у даному Договорі, не змінювати їх (вартість об'єкту продажу, терміни угоди,
виписки, звільнення і т.д.) без попередньої згоди Сторони Покупця;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),

         ...buildAvansText(dataDealZs).textDutyOwner,


         new Paragraph({
            children: [
               new TextRun({
                  text: "3.2. Покупець (ці):",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- Покупець (ці) засвідчує, що об’єкт продажу ним візуально оглянутий та знаходиться у стані, придатному для його
використання за цільовим призначенням;`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `- зобов’язаний пред'явити необхідні документи для здійснення Договору купівлі-продажу (документи, що
посвідчують особи учасників здійснення Договору купівлі-продажу - паспорти, ідентифікаційні коди, свідоцтва про
одруження, розпорядження чи рішення опікунської ради, інше);
`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),

         ...buildAvansText(dataDealZs).textDutyCustomer,
      ]
   };

   let section2 = {
      properties: {
         type: SectionType.NEXT_PAGE,
         page: {
            margin: {
               top: 568,
               right: 568,
               bottom: 568,
               left: 568 * 2,
            },
         },
      },
      footers: {
         default: new Footer({ // The standard default footer on every page or footer on odd pages when the 'Different Odd & Even Pages' option is activated
            children: [],
         })
      },
      children: [
         new Paragraph({
            children: [
               new TextRun({
                  text: "4. Порядок вирішення спорів:",
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            // spacing: { before: spacingAfter },
            // indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `4.1. Всі суперечки щодо умов даного Договору вирішуються шляхом переговорів обох Сторін та Агентства нерухомості,
а у випадку недосягнення згоди питання вирішуються згідно з чинним законодавством України.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `5. Форс-мажорні обставини:`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            // spacing: { before: spacingAfter },
            // indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `5.1. У випадку неможливості здійснення Договору купівлі-продажу через форс-мажорні обставини (хвороба, смерть,
стихійні лиха, непередбачені зміни у законодавстві, дії державних структур, банківських, комерційних або приватних
установ, від яких залежить те чи інше вироблення документації, або отримання інформації щодо об’єкту продажу), даний
Договір може бути розірваний без застосування штрафних санкцій з погашенням збитків або без погашення збитків за домовленістю Сторін.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `6. Додаткові Умови:`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `6.1. Продавець (ці) та Покупець (ці) узгодили між собою, що витрати додаткових платежів, пов'язані з
нотаріальним посвідченням Договору купівлі-продажу Об'єкту продажу, будуть розподілені наступним чином:`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         ...buildCosts(dataDealZs),

         new Paragraph({
            children: [
               new TextRun({
                  text: `6.2. Продавець (ці) та Покупець (ці) визнають той факт, що знаходження Продавцем і Покупцем один одного та
досягнення згоди на укладення Договору купівлі-продажу об'єкту продажу відбулося за сприяння ${dataDealZs.nameFOP}, який внаслідок цього має право на винагороду,
розмір якої визначено за домовленістю і визначається
${dataDealZs.RP_Customer != '' ? `Договором про надання посередницьких послуг з купівлі об'єкту нерухомості №${dataDealZs.numberZS} від ${dataDealZs.dateZS}` :
                        `Договором про надання посередницьких послуг з продажу об'єкту нерухомості №${dataDealZs.numberZS} від ${dataDealZs.dateZS}`},
що укладений між ${dataDealZs.nameFOP} та ${dataDealZs.RP_Customer != '' ? 'Покупцем' : 'Продавцем'}.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `6.3. Послуги, надані Агентством нерухомості сторонам цього Договору, оплачуються ${dataDealZs.avansAN != '' ?
                     'в день підписання цього Договору, згідно п. 2.4.2, а решта_' : ''}
в день укладення нотаріально посвідченого Договору купівлі-продажу Об'єкту продажу, до його підписання.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `6.4. Відповідно до вимог Закону України "Про захист персональних даних" Сторони дають свою згоду на
збір та обробку їх персональних даних, які необхідні для виконання цього Договору.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: indentFirst },
         }),

         ...buildAvansText(dataDealZs).textDateOut,
         ...buildAvansText(dataDealZs).textFurniture,


         new Paragraph({
            children: [
               new TextRun({
                  text: `7. Термін дії Договору:`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `7.1. Даний Договір вступає в силу з моменту його підписання та діє до повного виконання Сторонами своїх
зобов'язань згідно даного Договору.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `7.2. Даний Договір укладено в трьох оригінальних екземплярах, який складається з 3 листків (3 сторінки), для
кожної із Сторін та Агентства нерухомості.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `7.3. Усі зміни та доповнення до цього Договору здійснюються у письмовій формі (за домовленістю – в усній
формі) за згодою Сторін та у присутності чи проінформованості Агентства нерухомості.`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `7.4. Термін дії даного Договору може бути продовжений за взаємною згодою Сторін (в усній чи письмовій формі).`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            // spacing: { before: spacingAfter },
            indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `8. Реквізити Учасників Договору:`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: spacingAfter * 0.6 },
            indent: { firstLine: indentFirst },
         }),

         new Paragraph({
            children: [
               new TextRun({
                  text: `З умовами Договору згоден (згодна), суму отримав (ла):`,
                  size: 24,
                  bold: true,
               }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: spacingAfter * 0.6 },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `Продавець (ці): ____________________________________ /___________________________/ `,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: spacingAfter * 0.6 },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `З умовами Договору згоден (згодна):`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: spacingAfter * 0.6 },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `Покупець (ці): _____________________________________ /___________________________/`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: spacingAfter },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `${dataDealZs.nameFOP} (агентство нерухомості) /_______________________/`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: spacingAfter * 0.6 },
            indent: { firstLine: indentFirst },
         }),
         new Paragraph({
            children: [
               new TextRun({
                  text: `У присутності: ________________________/ ____________________________`,
                  size: 24,
                  bold: false,
               }),
            ],
            alignment: AlignmentType.CENTER,
            indent: { firstLine: indentFirst },
         }),

      ]
   };

   return new Document({
      sections: [
         section1,
         section2
      ],
   });
};

// router.post('/', async (req, res) => {
export const POST = async (req) => {
   console.log('generate zs deal my dream');

   const reqData = await req.json();
   console.log(reqData);

   try {
      // const { date, kind, checkedObject } = req.body;
      let file_name = '';
      console.log('data req');


      // let date_myformat = d.getMyFormatDate(date, 'DD.MM.YY');      // '17.12.2022';
      // // console.log('ddd  ' + date_myformat)
      // let dateSQL = d.getSQLFormatDate(date);
      // // console.log('sql  ' + dateSQL)
      // let timeNowISO = new Date().toISOString(); //! для збереження унікальної назви файлу у сервер
      // // let file_name = 'Заходи безпеки наряду';
      // file_name = file_name + ' ' + date_myformat + ' ' + timeNowISO + '.docx';
      // // let new_name_file = new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname;
      // file_name = file_name.replace(/:/g, '-');


      let doc = buildDealZS(reqData);

      const buff = await new Promise((res, rej) => {
         Packer.toBuffer(doc)
            .then(buffer => res(buffer))
            .catch(err => rej(err))
      })

      // Packer.toBuffer(doc)
      //    .then(buffer => {
      //    })

      return new Response(buff, { status: 200 })
   } catch (e) {
      console.log('err in download zsDeal file in server');
      console.log(e);

      // res.status(500).json({ message: 'Error. ' + e })
      return new Response(e, {
         status: 500
      })
   }
}
// );


// module.exports = router;


