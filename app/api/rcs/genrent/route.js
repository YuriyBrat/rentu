const docx = require('docx');

const {
   AlignmentType,
   BorderStyle,
   Document,
   Footer,
   Packer,
   Paragraph,
   SectionType,
   Table,
   TableCell,
   TableRow,
   TextRun,
   UnderlineType,
   WidthType,
} = docx;

async function saveDocumentGenerationLog({ fieldsData, nameFile, propertyId, leadId }) {
   const [{ default: connectDB }, { default: DocumentGeneration }, { getSessionUser }, { Types }, { logDocumentGenerationActivity }] = await Promise.all([
      import('@/config/database'),
      import('@/models/DocumentGeneration'),
      import('@/utils/getSessionUser'),
      import('mongoose'),
      import('@/utils/crm/documentGenerationActivity'),
   ]);

   const objectIdOrNull = (value) => {
      const id = String(value || '').trim();
      return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
   };

   await connectDB();

   const sessionUser = await getSessionUser().catch(() => null);

   const created = await DocumentGeneration.create({
      documentDomain: 'rent',
      documentType: 'rent_contract',
      generatedAt: new Date(),
      generatedByEmployee: objectIdOrNull(sessionUser?.employeeId),
      generatedByName: sessionUser?.user?.name || '',
      generatedByRole: sessionUser?.role || '',
      property: objectIdOrNull(propertyId),
      lead: objectIdOrNull(leadId),
      fileName: nameFile || '',
      fopName: '',
      contractNumber: '',
      contractDateText: fieldsData?.contractDate || '',
      source: 'crm_gen_rent',
      fieldsSnapshot: fieldsData || {},
   });

   await logDocumentGenerationActivity({
      sessionUser,
      item: created.toObject ? created.toObject() : created,
      action: 'generated',
      source: 'api',
      message: 'Згенеровано договір оренди',
      extraMeta: { eventKind: 'docx_generated' },
   });
}

const EMPTY = '________________';
const NO_BORDER = {
   top: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
   bottom: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
   left: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
   right: { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' },
};

const val = (data, key, fallback = EMPTY) => {
   const value = data?.[key];
   if (value === undefined || value === null || String(value).trim() === '') return fallback;
   return String(value).trim();
};

const run = (value, options = {}) => new TextRun({
   text: String(value || ''),
   size: options.size || 22,
   bold: !!options.bold,
   italics: !!options.italics,
   underline: options.underline ? { type: UnderlineType.SINGLE } : undefined,
});

const bold = (value, options = {}) => run(value, { ...options, bold: true });

const italic = (value, options = {}) => run(value, { ...options, italics: true });

const p = (children, options = {}) => new Paragraph({
   spacing: { after: options.after ?? 0, before: options.before ?? 0 },
   alignment: options.alignment || AlignmentType.JUSTIFIED,
   indent: options.indent || options.firstLine
      ? {
         left: options.indent,
         firstLine: options.firstLine,
      }
      : undefined,
   children: Array.isArray(children) ? children : [typeof children === 'string' ? run(children) : children],
});

const sectionTitle = (value) => p(bold(value, { size: 24 }), {
   alignment: AlignmentType.CENTER,
   before: 0,
   after: 0,
});

const sectionTitleSpaced = (value) => p(bold(value, { size: 24 }), {
   alignment: AlignmentType.CENTER,
   before: 120,
   after: 60,
});

const sub = (children, options = {}) => p(children, {
   ...options,
   after: options.after ?? 0,
   firstLine: options.firstLine ?? 360,
});

const italicDuty = (value) => p(italic(value), {
   indent: 360,
   after: 0,
});

const withValue = (before, value, after = '') => [
   run(before),
   bold(value),
   run(after),
];

const line = (label, value = EMPTY, after = '') => p(withValue(label, value, after));

const partyCell = (title, data, prefix, shortName) => new TableCell({
   borders: NO_BORDER,
   width: { size: 50, type: WidthType.PERCENTAGE },
   margins: { top: 0, bottom: 0, left: 80, right: 220 },
   children: [
      p(bold(title), { after: 0 }),
      p(withValue('ПІБ: ', val(data, `${prefix}Name`))),
      p(withValue('ІПН: ', val(data, `${prefix}TaxId`))),
      p(withValue('Паспорт: ', val(data, `${prefix}Passport`))),
      p(withValue('Виданий: ', val(data, `${prefix}PassportIssued`))),
      p(withValue('Місце реєстрації: ', val(data, `${prefix}Registration`))),
      p(withValue('Тел.: ', val(data, `${prefix}Phone`))),
   ],
});

const twoColumnRow = (leftChildren, rightChildren, options = {}) => new Table({
   width: { size: 100, type: WidthType.PERCENTAGE },
   borders: NO_BORDER,
   rows: [
      new TableRow({
         children: [
            new TableCell({
               borders: NO_BORDER,
               width: { size: 50, type: WidthType.PERCENTAGE },
               margins: { top: 0, bottom: 0, left: 0, right: 80 },
               children: [
                  p(leftChildren, {
                     alignment: AlignmentType.LEFT,
                     after: options.after ?? 0,
                  }),
               ],
            }),
            new TableCell({
               borders: NO_BORDER,
               width: { size: 50, type: WidthType.PERCENTAGE },
               margins: { top: 0, bottom: 0, left: 80, right: 0 },
               children: [
                  p(rightChildren, {
                     alignment: AlignmentType.RIGHT,
                     after: options.after ?? 0,
                  }),
               ],
            }),
         ],
      }),
   ],
});

const footerSignatures = () => twoColumnRow(
   'Орендодавець _______________________',
   'Орендар _______________________',
);

const checkboxRow = (left, right) => new TableRow({
   children: [left, right].map((value) => new TableCell({
      borders: NO_BORDER,
      width: { size: 50, type: WidthType.PERCENTAGE },
      margins: { top: 0, bottom: 0, left: 80, right: 80 },
      children: [
         p(value ? `□ ${value}` : ''),
      ],
   })),
});

const utilitiesChecklist = () => new Table({
   width: { size: 100, type: WidthType.PERCENTAGE },
   borders: NO_BORDER,
   rows: [
      checkboxRow('електропостачанням;', 'каналізацією;'),
      checkboxRow('опаленням;', 'інтернетом;'),
      checkboxRow('газопостачанням;', 'кабельним телебаченням;'),
      checkboxRow('водопостачанням;', 'вивозом сміття;'),
      checkboxRow('сигналізацією;', 'стаціонарним телефоном;'),
      checkboxRow('домофоном;', '_______________________;'),
   ],
});

const meterRow = (left, right) => new TableRow({
   children: [left, right].map((value) => new TableCell({
      borders: NO_BORDER,
      width: { size: 50, type: WidthType.PERCENTAGE },
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [
         p(value || ''),
      ],
   })),
});

const metersTable = () => new Table({
   width: { size: 100, type: WidthType.PERCENTAGE },
   borders: NO_BORDER,
   rows: [
      meterRow('газ....................(______________);', 'електрика.......(______________);'),
      meterRow('вода холодна..(______________);', 'тепло...............(______________);'),
      meterRow('вода гаряча.....(______________);', '_____...............(______________);'),
   ],
});

const partyIntro = (label, data, prefix) => [
   run(`${label}: `),
   bold(val(data, `${prefix}Name`)),
   run(', паспорт '),
   bold(val(data, `${prefix}Passport`)),
   run(', виданий '),
   bold(val(data, `${prefix}PassportIssued`)),
   run(', ІПН '),
   bold(val(data, `${prefix}TaxId`)),
   run(', місце реєстрації: '),
   bold(val(data, `${prefix}Registration`)),
   run(', тел.: '),
   bold(val(data, `${prefix}Phone`)),
];

function buildRentContract(data) {
   const landlord = val(data, 'landlordName');
   const tenant = val(data, 'tenantName');
   const landlordShort = val(data, 'landlordShortName', landlord);
   const tenantShort = val(data, 'tenantShortName', tenant);
   const contractDate = val(data, 'contractDate', '"___" ______________ 20___р.');

   const objectName = val(data, 'objectName', 'квартира');
   const objectAddress = val(data, 'objectAddress');
   const objectState = val(data, 'objectState', 'житловий стан, придатний для проживання');
   const ownershipDocs = val(data, 'ownershipDocs');
   const rentTerm = val(data, 'rentTerm', '12 місяців');
   const noticeTerm = val(data, 'noticeTerm', 'один місяць');
   const returnTerm = val(data, 'returnTerm', '3 днів');
   const rentPrice = val(data, 'rentPrice');
   const rentEquivalent = val(data, 'rentEquivalent');
   const paymentStartsAt = val(data, 'paymentStartsAt');
   const paymentDay = val(data, 'paymentDay', '10');
   const actDeadlineDays = val(data, 'actDeadlineDays', '3');
   const residents = val(data, 'residents');
   const pets = val(data, 'pets', 'не допускається без письмової згоди Орендодавця');
   const depositAmount = val(data, 'depositAmount');
   const depositPurpose = val(data, 'depositPurpose', 'перший місяць та гарантійний платіж за збереження майна та виконання умов договору');
   const witnesses = val(data, 'witnesses', '________________   ________________   ________________   ________________');

   return new Document({
      sections: [{
         properties: {
            type: SectionType.NEXT_PAGE,
            page: {
               margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
         },
         footers: {
            default: new Footer({
               children: [
                  footerSignatures(),
               ],
            }),
         },
         children: [
            p(bold('Договір оренди квартири у приватної особи', { size: 28 }), {
               alignment: AlignmentType.CENTER,
               after: 80,
            }),
            twoColumnRow(
               bold(val(data, 'contractPlace', 'м. Львів')),
               bold(contractDate),
               { after: 80 },
            ),
            p(withValue('Орендодавець: ', landlord, ', з однієї сторони,'), { indent: 360 }),
            p([run('та Орендар: '), bold(tenant), run(', з іншої сторони, заключили даний Договір про наступне:')]),

            sectionTitleSpaced('1. Предмет Договору'),
            p(withValue('Орендодавець передає, а Орендар бере у тимчасове користування Об’єкт нерухомості, а саме ', objectName, '.')),
            sub(withValue('1.1. Адреса: ', objectAddress, '.')),
            sub(withValue('1.2. Фактичний стан орендованого Об’єкту нерухомості на момент передачі: ', objectState, '.')),
            sub(withValue('1.3. Об’єкт нерухомості належить Орендодавцю на праві власності згідно ', ownershipDocs, '.')),
            sub('1.4. Орендодавець стверджує, що Об’єкт нерухомості на момент укладення даного Договору не є проданий, подарований третім особам, не є під заставою, під арештом. Орендодавець також передає в оренду майно, що знаходиться в квартирі, згідно Акту прийому-передачі.'),
            sub('1.5. Орендодавець стверджує, що він діє за згодою інших осіб, що мають права власності на Об’єкт нерухомості та орендоване майно.'),

            sectionTitleSpaced('2. Мета оренди'),
            p('Об’єкт нерухомості передається Орендарю для тимчасового проживання.'),

            sectionTitleSpaced('3. Порядок передачі квартири та майна в оренду'),
            sub('3.1. Доступ Орендаря до користування Об’єктом нерухомості настає одночасно із підписанням Сторонами Акту прийому-передачі орендованого майна, який є невід’ємною частиною даного Договору.'),
            sub('3.2. Квартира має бути повернена Орендодавцеві в стані, в якому вона була надана, з урахуванням нормального зносу.'),
            sub('3.3. У випадку погіршення стану Об’єкту нерухомості та наявного у ньому майна за період його використання, приймання Об’єкту нерухомості Орендодавцем здійснюється після відновлення Орендарем стану Об’єкту нерухомості і компенсації Орендарем завданих збитків.'),

            sectionTitleSpaced('4. Термін оренди'),
            sub(withValue('4.1. Термін оренди складає ', rentTerm, ' з моменту прийняття Об’єкту нерухомості по договору оренди.')),
            sub(withValue('4.2. Орендар має право відмовитися від даного Договору, попередивши Орендодавця в термін ', noticeTerm, '. При цьому оплачена авансом орендна плата Орендарю не повертається.')),
            sub('4.3. В разі, якщо протягом двох тижнів з моменту припинення дії цього договору Сторони не ставлять вимогу розірвання або зміни умов даного Договору, він вважається продовженим на такий же термін.'),
            sub('4.4. Сторони за взаємною згодою можуть достроково припинити дію Договору, попередивши іншу Сторону за один місяць.'),

            sectionTitleSpaced('5. Орендна плата та порядок розрахунків'),
            sub([run('5.1. Орендна плата за користування Об’єктом нерухомості та майном складає '), bold(rentPrice), run(' грн. за місяць, що еквівалентно '), bold(rentEquivalent), run('.')]),
            sub(withValue('5.2. За згодою сторін обов’язок по сплаті орендної плати Орендарем настає ', paymentStartsAt, '.')),
            sub(withValue('5.3. Акт прийому-передачі орендованого майна Сторони підписують у строк до ', actDeadlineDays, ' з моменту підписання даного Договору.')),
            sub(withValue('5.4. Орендна плата оплачується щомісячно до ', paymentDay, ' числа поточного місяця.')),

            sectionTitleSpaced('6. Витрати на комунальні послуги'),
            sub('6.1. Комунальні послуги оплачуються Орендарем самостійно згідно рахунків відповідних організацій.'),

            sectionTitleSpaced('7. Права та обов’язки Орендодавця'),
            sub('7.1. Орендодавець має право 1 (один) раз в місяць, в присутності Орендаря, здійснювати перевірку порядку використання Орендарем Об’єкту нерухомості та стану орендованих Об’єкту нерухомості та майна.'),
         ],
      }, {
         properties: {
            type: SectionType.NEXT_PAGE,
            page: {
               margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
         },
         footers: {
            default: new Footer({
               children: [
                  footerSignatures(),
               ],
            }),
         },
         children: [
            sectionTitle('8. Права та обов’язки Орендаря'),
            sub('8.1. Орендар зобов’язується:'),
            italicDuty('- використовувати орендоване приміщення виключно по його цільовому призначенню згідно з п.2 Договору;'),
            italicDuty('- своєчасно здійснювати орендні платежі;'),
            italicDuty('- утримувати орендоване приміщення в порядку та справності, дбайливо ставитись до майна, що знаходиться в Об’єкті нерухомості, дотримуватись протипожежних правил;'),
            italicDuty('- за власний кошт ліквідовувати наслідки аварій та інших пошкоджень, що виникли з вини Орендаря і які спричинили збитки третім особам;'),
            italicDuty('- не проводити перебудову та перепланування орендованого Об’єкту нерухомості;'),
            italicDuty('- дотримуватись прийнятих правил проживання у будинку, в якому знаходиться Об’єкт нерухомості;'),
            italicDuty('- без перешкод допускати Орендодавця в квартиру з метою перевірити її використання у відповідності з даним Договором;'),
            italicDuty('- не передавати права та зобов’язання за даним Договором третім особам.'),
            sub('8.2. Орендар має право за попереднім погодженням з Орендодавцем облаштувати Об’єкт нерухомості на власний розсуд, встановлювати сигналізацію та інші системи охорони квартири, під’єднуватись до мережі Інтернет.'),

            sectionTitle('9. Порядок повернення квартири Орендодавцю'),
            sub(withValue('9.1. Після закінчення терміну оренди Орендар зобов’язаний передати Орендодавцю орендований Об’єкт нерухомості та майно протягом ', returnTerm, ' з моменту закінчення терміну оренди.')),
            sub('9.2. Об’єкт нерухомості та майно повинні бути передані Орендодавцю в такому ж стані, в якому вони були передані в оренду, з урахуванням нормального зносу. Невід’ємні покращення, зроблені в квартирі Орендарем, переходять до Орендодавця без відшкодування понесених витрат.'),
            sub('9.3. У випадку додаткових пошкоджень Об’єкту нерухомості чи майна у ньому з вини Орендаря, Орендар повинен надати фінансову компенсацію з урахуванням нормального зносу.'),

            sectionTitle('10. Підстави для передчасного розірвання даного Договору'),
            sub('10.1. Даний Договір розірванню в односторонньому порядку не підлягає, за виключенням тих випадків, коли одна із сторін порушує умови Договору.'),
            sub('10.2. Інші підстави: ________________________________________________________________'),
            sub('____________________________________________________________________________________'),

            sectionTitle('11. Інші умови'),
            sub(withValue('11.1. Сторони погодили, що у квартирі проживатиме така кількість дорослих та малолітніх осіб: ', residents, '.')),
            sub(withValue('11.2. Сторони погодили, що у квартирі наявність тварин: ', pets, '.')),
            sub('11.3. У випадку передчасного розірвання даного Договору чи порушення будь-яких його пунктів в односторонньому порядку Сторона зобов’язується надати іншій стороні фінансову компенсацію у розмірі одного місячного платежу оренди згідно п.5.1.'),
            sub('11.4. Орендар не має права реєструватися за адресою Об’єкту нерухомості на період дії даного Договору.'),
            sub([run('11.5. При укладенні Договору Орендар оплачує Орендодавцю грошову суму у розмірі '), bold(depositAmount), run(' як плату за '), bold(depositPurpose), run('.')]),

            sectionTitle('12. Заключні положення'),
            sub('12.1. Даний Договір складено в двох оригінальних екземплярах, по одному для кожної із сторін.'),
            sub('12.2. У випадках, не передбачених даним Договором, сторони керуються діючим законодавством.'),

            sectionTitleSpaced('13. Адреси та реквізити сторін'),
            new Table({
               width: { size: 100, type: WidthType.PERCENTAGE },
               borders: NO_BORDER,
               rows: [
                  new TableRow({
                     children: [
                        partyCell('Орендодавець:', data, 'landlord', landlordShort),
                        partyCell('Орендар:', data, 'tenant', tenantShort),
                     ],
                  }),
               ],
            }),
            p(withValue('У присутності: ', witnesses), { before: 120 }),
         ],
      }, ...buildRentActSections(data)],
   });
}

function buildRentActSections(data) {
   const actDate = val(data, 'actDate', val(data, 'contractDate', '"___" ______________ 20___р.'));
   const contractDate = val(data, 'contractDate', '"___" ______________ 20___р.');
   const contractPlace = val(data, 'contractPlace', 'м. Львів');
   const objectName = val(data, 'objectName', 'квартира');
   const objectAddress = val(data, 'objectAddress');
   const actFurniture = val(data, 'actFurniture', '_____________________________________________________________________________________');
   const actAppliances = val(data, 'actAppliances', '_____________________________________________________________________________________');
   const actTechState = val(data, 'actTechState', 'відмінний');
   const actDefects = val(data, 'actDefects', 'не виявлено');
   const witnesses = val(data, 'witnesses', '________________   ________________   ________________   ________________');

   return [{
         properties: {
            type: SectionType.NEXT_PAGE,
            page: {
               margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
         },
         footers: {
            default: new Footer({
               children: [
                  footerSignatures(),
               ],
            }),
         },
         children: [
            p(bold('АКТ ПРИЙМАННЯ-ПЕРЕДАЧІ ОБ\'ЄКТУ НЕРУХОМОСТІ', { size: 26 }), {
               alignment: AlignmentType.CENTER,
               after: 80,
            }),
            p([
               run('(додаток до Договору оренди Об\'єкту нерухомості від '),
               bold(contractDate),
               run(')'),
            ], { alignment: AlignmentType.CENTER, after: 120 }),
            twoColumnRow(
               bold(contractPlace),
               bold(actDate),
               { after: 120 },
            ),
            p([
               ...partyIntro('Орендодавець', data, 'landlord'),
               run(', з однієї сторони, та '),
               ...partyIntro('Орендар', data, 'tenant'),
               run(', з іншої сторони, які в подальшому іменуються "Сторони", уклали даний Акт про наступне:'),
            ]),
            p([
               run('Орендодавець здав, а Орендар прийняв Об\'єкт нерухомості, а саме '),
               bold(objectName),
               run(', який розташований за адресою: '),
               bold(objectAddress),
               run('.'),
            ]),

            sectionTitleSpaced('Опис майна, що знаходиться в Об\'єкті нерухомості'),
            line('меблі: ', actFurniture),
            p('_____________________________________________________________________________________'),
            p('_____________________________________________________________________________________'),
            line('побутова техніка: ', actAppliances),
            p('_____________________________________________________________________________________'),
            p(withValue('Технічний стан приміщення: ', actTechState), { before: 120, after: 80 }),
            p(withValue('Виявлені недоліки, зауваження: ', actDefects), { after: 80 }),

            sectionTitleSpaced('Приміщення забезпечене'),
            utilitiesChecklist(),

            p(bold('Показники лічильників', { size: 24 }), {
               alignment: AlignmentType.CENTER,
               before: 180,
               after: 120,
            }),
            metersTable(),

            p(withValue('У присутності: ', witnesses), { before: 520, after: 240 }),
         ],
   }];
}

function buildRentAct(data) {
   return new Document({
      sections: buildRentActSections(data),
   });
}

export const POST = async (req) => {
   try {
      const reqData = await req.json();
      const { fieldsData = {}, propertyId = null, leadId = null, saveLog = true } = reqData || {};
      const nameFile = reqData?.nameFile || 'Договір оренди.docx';
      const docType = reqData?.docType || 'contract';
      const doc = docType === 'act' ? buildRentAct(fieldsData) : buildRentContract(fieldsData);
      const buff = await Packer.toBuffer(doc);

      if (saveLog !== false && docType !== 'act') {
         try {
            await saveDocumentGenerationLog({ fieldsData, nameFile, propertyId, leadId });
         } catch (logError) {
            console.log('err saving rent document generation log');
            console.log(logError);
         }
      }

      return new Response(buff, {
         status: 200,
         headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(nameFile)}`,
         },
      });
   } catch (error) {
      console.log('err in rent document generation');
      console.log(error);
      return new Response(JSON.stringify({ message: 'Помилка генерації документа оренди' }), { status: 500 });
   }
};
