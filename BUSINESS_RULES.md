# BUSINESS_RULES

## Призначення бази парсингу

База парсингу - це робочий буфер між зовнішніми оголошеннями і основною CRM-базою об'єктів.

Головна ідея: не засмічувати `Property` сирими, фейковими, дубльованими або маклерськими оголошеннями. Спочатку все потрапляє в `LeadProperty`, проходить перевірку, і тільки якісні записи переносяться в основні об'єкти.

## Статуси LeadProperty

- `raw` - нове сире оголошення, ще не перевірене.
- `processing` - менеджер взяв у роботу.
- `called` - був дзвінок або спроба контакту.
- `qualified` - запис підтверджений як корисний для бази ринку.
- `duplicate` - дубль іншого оголошення.
- `fake` - фейкове або підозріле оголошення.
- `rejected` - відхилено з іншої причини.
- `moved` - перенесено в основну базу `Property`.

## Результати перевірки

`reviewStatus` використовується для оцінки контакту або актуальності:

- `unchecked` - ще не перевірено.
- `actual` - актуальне.
- `not_actual` - неактуальне.
- `owner` - контакт схожий на власника.
- `realtor` - контакт схожий на маклера.
- `unknown` - не вдалося визначити.

## Коли переносити в Property

Запис можна переносити в основну базу, якщо:

- оголошення актуальне;
- є достатньо даних для об'єкта;
- контакт бажано власник або корисний для роботи;
- запис не є очевидним дублем;
- джерело або телефон не викликають критичних підозр.

Після переносу:

- створюється `Property`;
- у `LeadProperty` ставиться `stage = "moved"`;
- у `LeadProperty` записується `propertyId`;
- у `Property.sourceLeadId` записується ID парсингового запису;
- у `Property.workHistory` додається нотатка, що об'єкт створено з парсингу.

Фото парсингу поки не переносяться в `Property` автоматично. Вони зберігаються в окремій папці Cloudinary для парсингу і доступні через зв'язок `sourceLeadId`. Це важливо, бо в парсингу можуть бути фото власника, конкурентів, фейки або дублікати.

Для фото парсингу треба зберігати походження:

- `owner` - фото власника;
- `competitor` - фото конкурента або іншого АН;
- `unknown` - походження невідоме.

Фото конкурента можуть тимчасово допомагати в роботі, але їх не можна змішувати з власницькими або автоматично тягнути в основну базу об'єктів.

## CRM-стадії Property

Після продзвону запис з парсингу переходить у `Property`, але ще не стає повноцінним робочим об'єктом.

Стадії `Property.crmStage`:

- `base` - продзвонена база ринку. Об'єкт підтверджений, але ще не оглянутий.
- `inspection` - огляд. Рієлтор дивиться об'єкт або був на показі, але рішення про роботу ще не прийняте.
- `rs` - робоча стадія. Об'єкт після огляду взяли в роботу.
- `ds` - допрацьовуюча стадія. Об'єкт треба довести: фото, документи, власник, ціна, реклама, умови.
- `zs` - завдаток.
- `archived` - архів. Причини різні: знято з продажу, проданий нами, проданий не нами, неактуальний, власник відмовився.

Правило агентства: в РС беремо тільки після огляду. Якщо на показі одразу оглянули об'єкт, він все одно має пройти стадію `inspection`, і тільки після рішення переходити в `rs`.

Огляд не є окремою базою і не має бути окремим пунктом меню. У системі є три основні робочі розділи:

- `Парсинг` - вхідний хаос і збірка для колцентру.
- `База` - продзвонені та підтверджені об'єкти ринку.
- `Об'єкти` - взяті в роботу об'єкти.

Огляд - це стадія/операційна подія між базою і РС. Його треба показувати в операційці та звітах, а не як окремий розділ меню.

## OperationEvent Та Communication

`OperationEvent` використовується для операційних подій, які мають управлінське або звітне значення:

- показ;
- огляд;
- зустріч;
- завдаток;
- значуща подія по об'єкту або клієнту;
- результат, який впливає на роботу: відмова, заперечення, зацікавленість, домовленість, зміна стадії.

`Communication` є окремою моделлю для масових контактів:

- дзвінок;
- SMS;
- месенджер;
- звичайна нотатка;
- follow-up;
- не взяв трубку;
- домовились передзвонити.

Правило: дрібний контакт - це `Communication`, операційний факт - це `OperationEvent`.

Приклад:

- "Подзвонили власнику, не взяв трубку" - `Communication`.
- "Власник підтвердив актуальність" - `Communication`.
- "Домовились про огляд" - `Communication`.
- "Огляд відбувся" - `OperationEvent`.
- "Показ клієнту відбувся" - `OperationEvent`.
- "Взяли завдаток" - `OperationEvent`.

Комунікація має два незалежні виміри:

- `type` - спосіб зв'язку: дзвінок, SMS, месенджер, нотатка.
- `tone` - тон нотатки: позитивна, негативна, важлива, інформаційна.

Тони нотаток:

- `positive` - позитивна.
- `negative` - негативна.
- `important` - важлива, синя.
- `info` - інформаційна, жовта.

## Дублі

Точний дубль зараз визначається по парі:

- `source`;
- `sourceId`.

М'який дубль треба визначати по комбінації:

- нормалізований телефон;
- адреса;
- ціна;
- площа;
- кімнати;
- URL;
- схожість назви та опису.

Якщо оголошення дубль, його не треба переносити в `Property`. Треба ставити `stage = "duplicate"` і, якщо можливо, `duplicateOf`.

Якщо дубль стосується вже нашого об'єкта в базі, обов'язково треба прив'язувати `duplicatePropertyId`. Це потрібно, щоб колцентр і рієлтори бачили, з яким нашим об'єктом пов'язане зовнішнє оголошення, і не плутали джерела.

## Маклери і власники

Телефонна аналітика не є абсолютною правдою, а лише підказкою.

Правила:

- якщо номер зустрічається багато разів у різних оголошеннях, це ймовірний маклер;
- якщо номер є в основних об'єктах як власник, це сильний сигнал власника;
- якщо менеджер вручну поставив `reviewStatus = "realtor"`, система має вважати це сильним сигналом;
- якщо менеджер вручну поставив `reviewStatus = "owner"`, система має враховувати це як сигнал власника;
- остаточне рішення лишається за менеджером.

## Робота менеджера

Бажаний процес:

1. Відкрити `/crm/parsing`.
2. Взяти нові `raw` записи.
3. Переглянути джерело, фото, адресу, ціну, телефон.
4. Перевірити телефонну аналітику.
5. Подзвонити або зробити іншу перевірку.
6. Записати `callResult` і `reviewNote`.
7. Поставити статус:
   - `qualified`, якщо запис корисний;
   - `duplicate`, якщо дубль;
   - `fake`, якщо фейк;
   - `rejected`, якщо не підходить;
   - `moved`, якщо перенесено в об'єкти.

## Імпорт

Імпорт може приходити:

- вручну через форму;
- bulk JSON;
- bulk CSV;
- DIM.RIA API;
- Hunter/Reamak endpoint;
- майбутнім зовнішнім парсером;
- майбутніми інтеграціями з OLX, Telegram або іншими джерелами.

Кожен імпортований запис має зберігати:

- нормалізовані CRM-поля;
- сирий payload у `raw`;
- додаткові поля джерела в `attrs`;
- `source`;
- `sourceId`, якщо є;
- `sourceUrl`, якщо є.
- фото з метаданими `origin`, `isMain`, `sortOrder`, `public_id`, `variants`, якщо фото завантажені.
- `priceHistory`, якщо джерело дозволяє бачити або повторно сканувати ціну.

## DIM.RIA

DIM.RIA є підключеним джерелом автоматичного наповнення парсингу.

Правила:

- DIM.RIA записи мають `source = "dimria"`.
- `sourceId` береться з realty ID DIM.RIA.
- `sourceUrl` має вести на сторінку оголошення на dom.ria.com.
- Сирий payload зберігається у `raw`.
- Технічні поля DIM.RIA зберігаються в `attrs`.
- Якщо запис уже існує, скан може оновити `sourceStatus`, `sourceCheckedAt`, `sourceUrl`, `attrs`, `raw`, фото якщо їх ще не було, і ціну.
- Зміна ціни має писатись у `priceHistory`.
- DIM.RIA імпорт не означає автоматичну якість. Запис усе одно проходить парсинг, дзвінок, дедуп і рішення менеджера.

## Reamak / Hunter

Hunter/Reamak є каналом догрузки зовнішніх оголошень у парсинг.

Правила:

- Reamak записи мають `source = "reamak"`.
- Якщо є `reamakId`, він є сильним ідентифікатором.
- Якщо `reamakId` немає, використовуються `siteName + siteId`.
- Дубль треба шукати по `reamakId`, `sourceId`, `attrs.reamak.siteId`, `attrs.reamak.siteName`.
- Якщо Hunter повторно присилає той самий запис, система має оновити існуючий запис, а не створити шум.
- Зміни ціни з Hunter/Reamak треба писати в `priceHistory`.
- Фото з Hunter/Reamak є джерельними фото парсингу. Їх не можна автоматично змішувати з фінальними фото `Property`.
- Endpoint може бути захищений `REAMAK_IMPORT_TOKEN`.

## Правила якості даних

- Не втрачати сирі дані з джерела.
- Не створювати основний `Property` без перевірки, якщо запис сумнівний.
- Не падати всім імпортом через один дубль.
- Не перезаписувати ручні нотатки менеджера автоматичним імпортом.
- Всі рішення менеджера мають бути видимі в історії або полях перевірки.

## Правила для майбутнього парсера

Зовнішній парсер має надсилати стабільний payload:

- `source`;
- `sourceId`;
- `sourceUrl`;
- `title`;
- `description`;
- `location_text`;
- `city`;
- `street`;
- `rooms`;
- `square_tot` або `square`;
- `floor`;
- `floors`;
- `cost` або `price`;
- `currency`;
- `phone`;
- `leadname` або `contactName`;
- `images`;
- `sourcePublishedAt`;
- `sourceUpdatedAt`;
- `sourcePriceChangedAt`;
- `raw`.

Якщо частини полів немає, API має приймати неповний запис, але UI повинен показувати, що даних бракує.
## Call center categories for parsing

When a parsing record is processed after contact, the operator should save both:

- a `Communication` with the real contact event;
- `LeadProperty.callCenter` with the current verification categories.

`callCenter` is not raw parser data. It is the call-center technical layer and should survive repeated DIM.RIA/Reamak/manual re-imports.

Urgency in this layer is intentionally simple and separate from deeper object motivation:

- `1` - owner is not in a hurry at all.
- `2` - not urgent.
- `3` - normal urgency, roughly up to 3 months.
- `4` - urgent.
- `5` - very urgent.

Interest and cooperation warmth also use 1-5 scales, where `3` is normal.

## CRM activity journal

Important CRM actions should write to `CRMActivityLog`. The log is not a replacement for domain models like `Communication` or `OperationEvent`; it is a unified history layer for audit and analytics.

Rules:

- Log only meaningful CRM actions, not every internal recalculation.
- Store compact snapshots/diffs, not full raw parser payloads or large photo arrays.
- Manual employee actions should include actor information from the session.
- System/import actions should still log source and technical meta.
- Deleting a record should write a log before the physical delete.
- Communication creation should create both a `Communication` record and a `communication_added` activity log.

## Parsing workflow display

The parsing page derives its operational status from both `LeadProperty` and linked `Property`:

- `БАЗА` - a qualified/moved record that is still in `Property.crmStage = base` and is not marked ready for inspection.
- `Чекає огляд` - the owner is ready for a realtor inspection (`callCenter.inspectionLoyalty = yes`) or the linked property is already in `crmStage = inspection`.
- `Обʼєкти` - the linked property is on a working stage `rs`, `ds` or `zs`, matching the separate Objects page.

`Чекає огляд` is a priority queue for realtors and should be visually highlighted.

## Inspection reservation

Eligible parsing records can be temporarily reserved with `ЇДУ НА ОГЛЯД`.

Rules:

- Reservation is available only for New, Base and Waiting for inspection records.
- Duplicate, fake, paused, inactive, deposit and working-object records cannot be reserved.
- The reservation belongs to the authenticated owner/admin/manager/realtor who starts it.
- Default reservation duration is 24 hours.
- During an active reservation, parsing PATCH operations and linked Property status changes are blocked with HTTP `423`.
- Communications remain available because they use the separate communications API.
- The UI displays `Їде на огляд` with a live countdown.
- After expiration, no cron is required: the derived display status automatically returns to Base or Waiting for inspection.
