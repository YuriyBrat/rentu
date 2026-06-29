# ARCHITECTURE

## Загальна картина

Проєкт побудований на Next.js App Router. CRM живе в `app/(crm)/crm`, API - в `app/api`, MongoDB-моделі - в `models`, спільні CRM-утиліти - в `utils/crm`.

CRM має окремі розділи для об'єктів, парсингу, лідів, оренди, операцій, наводок і персоналу. Навігація підключена в `app/(crm)/crm/CRMLayout1.jsx`.

## Парсинг

Парсинг винесений в окрему проміжну базу `LeadProperty`. Це не фінальна база об'єктів, а робочий буфер для сирих оголошень.

Основні файли:

- `models/LeadProperty.js` - модель оголошення з парсингу.
- `app/api/crm/parsing/route.js` - список, пошук, фільтри, створення і bulk-імпорт.
- `app/api/crm/parsing/[id]/route.js` - отримання одного запису, оновлення статусів, перенос в об'єкти.
- `app/(crm)/crm/parsing/page.jsx` - сторінка CRM для роботи з базою парсингу.
- `app/(crm)/crm/parsing/ParsingRowCard.jsx` - компактний рядок оголошення.
- `utils/crm/phoneIntel.js` - нормалізація телефонів і аналітика повторів.
- `utils/crm/dimriaClient.js` - клієнт DIM.RIA API та mapping оголошення у `LeadProperty`.
- `app/api/crm/integrations/dimria/import/route.js` - імпорт DIM.RIA.
- `app/api/crm/integrations/dimria/status/route.js` - статус DIM.RIA інтеграції.
- `app/api/crm/integrations/reamak/import/route.js` - endpoint Hunter/Reamak.

## Модель LeadProperty

`LeadProperty` зберігає сирі оголошення з джерел:

- `source` - джерело: `manual`, `olx`, `telegram`, `dimria`, `facebook`, інше.
- `sourceId` - ID оголошення у зовнішньому джерелі.
- `sourceUrl` - посилання на оригінал.
- `reamakId` - ID з Reamak, якщо запис прийшов через Hunter/Reamak.
- `importedAt` - дата імпорту.
- `fingerprint` - майбутній ключ для м'якого дедупу.
- `stage` - робочий статус.
- `reviewStatus` - результат перевірки контакту/актуальності.
- `callResult`, `reviewNote`, `lastCallAt` - дані дзвінка.
- `assignedToEmployee` - відповідальний працівник.
- `duplicateOf` - прив'язка до оригіналу, якщо запис дубль.
- `propertyId` - зв'язок зі створеним `Property`.
- `attrs` - нормалізовані або додаткові атрибути джерела.
- `raw` - сирий payload з парсера або імпорту.
- `priceHistory` - історія цін з DIM.RIA/Reamak/інших сканів.
- `images` - структуровані фото з `url`, `public_id`, `origin`, `isMain`, `sortOrder`, `variants`.

Є унікальний sparse-індекс `{ source, sourceId }`, який захищає від точних дублів по зовнішньому джерелу.
Для Reamak додані індекси по `reamakId`, `attrs.reamak.siteName + attrs.reamak.siteId`, `attrs.reamak.reamakPageUrl`.

## API Парсингу

`GET /api/crm/parsing`:

- приймає `q`, `stage`, `source`, `page`, `pageSize`;
- шукає по назві, адресі, телефону, джерелу, URL, опису;
- повертає записи з `assignedToEmployee`, `propertyId`, `duplicateOf`;
- додає телефонну аналітику через `attachPhoneIntel`;
- повертає список доступних джерел.

`POST /api/crm/parsing`:

- приймає один об'єкт, масив або `{ items: [...] }`;
- приймає `multipart/form-data` для ручного додавання з фото;
- нормалізує числа, дати, фото, контактні поля;
- вантажить ручні фото в Cloudinary `karamax/parsing/{leadPropertyId}/raw`;
- зберігає для фото `origin`, `isMain`, `sortOrder`, `public_id`, `variants`;
- генерує `sourceId`, якщо його немає;
- якщо є `sourceUrl`, використовує його як стабільний ключ дедупу;
- для ручних записів без URL створює локальний `sourceId`;
- створює записи по одному і повертає звіт `created`, `duplicates`, `failed`, `errors`.

## Інтеграції Парсингу

### DIM.RIA

`utils/crm/dimriaClient.js` працює з `https://developers.ria.com/dom` і використовує `DIMRIA_API_KEY`.

Потік:

1. `searchDimriaIds` викликає `/search` і отримує ID оголошень.
2. `fetchDimriaAdvert` викликає `/info/{id}`.
3. `mapDimriaAdvertToLeadProperty` перетворює відповідь API у структуру `LeadProperty`.
4. `app/api/crm/integrations/dimria/import/route.js` створює або оновлює записи парсингу.

Endpoint `GET/POST /api/crm/integrations/dimria/import` підтримує:

- `dryRun`;
- `includeExisting`;
- `limit` до 50;
- параметри пошуку DIM.RIA;
- оновлення існуючих записів;
- `priceHistory`;
- нормалізацію фото у `LeadProperty.images`;
- `raw` payload.

Endpoint `GET /api/crm/integrations/dimria/status` повертає, чи налаштований `DIMRIA_API_KEY`, і кількість імпортованих `LeadProperty` з `source = "dimria"`.

На сторінці `/crm/parsing` є UI-блок для ручного запуску DIM.RIA імпорту.

### Reamak / Hunter

`POST /api/crm/integrations/reamak/import` приймає догрузки з Hunter/Reamak.

Особливості:

- CORS і `OPTIONS` для зовнішнього виклику;
- авторизація через `REAMAK_IMPORT_TOKEN`, якщо він заданий;
- приймає один `item` або масив `items`;
- ставить `source = "reamak"`;
- зберігає `reamakId`, `attrs.reamak.siteName`, `attrs.reamak.siteId`, `attrs.reamak.reamakPageUrl`;
- дедупить по `reamakId`, siteId/siteName, sourceId;
- оновлює існуючий запис при `updateExisting !== false`;
- веде `priceHistory`;
- чистить службовий текст з опису;
- нормалізує фото, поверхи, ціну, площу, адресу.

`PATCH /api/crm/parsing/[id]`:

- оновлює `stage`, `reviewStatus`, `callResult`, `reviewNote`, `lastCallAt`, `assignedToEmployee`, `duplicateOf`;
- якщо `action === "moveToObjects"`, створює `Property`;
- після переносу ставить `stage = "moved"`, `reviewStatus = "actual"`, записує `propertyId`.

## Перенос в Property

При переносі `LeadProperty` в основну базу створюється `Property`.

Mapping зараз переносить:

- назву;
- тип нерухомості і тип угоди;
- адресу;
- кімнати, площу, поверх, поверховість;
- ціну і валюту;
- опис;
- переваги;
- власника з телефону, імені та email;
- рекламне посилання на джерело;
- `sourceLeadId`;
- `source`;
- `workHistory` з нотаткою про створення з парсингу.

Фото з `LeadProperty` поки не копіюються в `Property`. Вони лишаються у записі парсингу, а `Property.sourceLeadId` дає посилання на джерельний запис і його фото. Це зменшує засмічення основної бази фейковими, дубльованими або конкурентними фото.

Нові об'єкти з парсингу створюються зі стадією `crmStage = "base"`. Далі вони рухаються через `inspection`, `rs`, `ds`, `zs` або `archived`.

## Телефонна аналітика

`utils/crm/phoneIntel.js` збирає повтори номерів у:

- `LeadProperty.phone`;
- `Property.owners.phones`.

Система нормалізує українські номери до формату на базі `0XXXXXXXXX`, рахує входження і підказує тип контакту:

- `owner`;
- `realtor`;
- `suspected_realtor`;
- `unknown`.

Логіка:

- якщо є явна ознака маклера - `realtor`;
- якщо номер часто повторюється - `suspected_realtor`;
- якщо є власник і мало повторів - `owner`;
- якщо даних мало - `unknown`.

## UI Парсингу

Сторінка `/crm/parsing` має:

- пошук;
- фільтр по статусу;
- фільтр по джерелу;
- статистичні чіпи по статусах;
- демо-записи, якщо база порожня;
- ручне додавання запису;
- bulk-імпорт JSON/CSV;
- рядки оголошень;
- drawer з деталями;
- збереження дзвінка;
- переведення в базу ринку;
- перенос в основні об'єкти.

Джерело оголошення показується як кнопка. Якщо є `sourceUrl`, кнопка відкриває зовнішнє джерело. Колір кнопки залежить від `sourceStatus`: `active`, `unknown`, `inactive`, `removed`, `error`.

## CRM-зрізи Property

- `/crm/base` - продзвонена база, `crmStage = "base"`.
- `/crm/objects3` - робочі об'єкти, `crmStage` у `rs`, `ds`, `zs`, а також старі об'єкти без цього поля.

Огляд не є окремою базою або окремим пунктом меню. Це внутрішня стадія/операційна подія, яку пізніше треба показувати в операційці та звітах.

## OperationEvent І Communication

У проєкті вже є `models/OperationEvent.js`. Цю модель треба залишити для операційних подій, які мають вагу для звітів і стадій роботи:

- показ;
- огляд;
- зустріч;
- завдаток;
- подія, яка змінює стадію об'єкта або клієнта;
- подія з результатом: відмова, заперечення, новий об'єкт, зниження ціни, домовленість.

Огляди краще додавати саме в `OperationEvent`, бо огляд - це не просто контакт, а операційний факт. Він може переводити об'єкт з `base` у `inspection`, а після рішення - у `rs` або `archived`.

Для масових контактів додана окрема модель `models/Communication.js`. Вона зберігає:

- дзвінки;
- SMS;
- месенджери;
- короткі нотатки;
- follow-up;
- "не взяв трубку";
- "домовились передзвонити".

Комунікації не мають засмічувати операційку. Вони потрібні як хронологія контакту, особливо для парсингу, бази, об'єктів і клієнтів.

Структура `Communication`:

```js
{
  entityType: 'leadProperty' | 'property' | 'lead' | 'operation',
  entityId: ObjectId,
  type: 'call' | 'sms' | 'messenger' | 'note',
  tone: 'positive' | 'negative' | 'important' | 'info',
  happenedAt: Date,
  text: String,
  responsibleEmployee: ObjectId,
  createdByEmployee: ObjectId,
  operationEvent: ObjectId | null
}
```

`type` відповідає за спосіб контакту, а `tone` - за характер нотатки:

- `positive` - позитивна;
- `negative` - негативна;
- `important` - важлива, синя;
- `info` - інформаційна, жовта.

Якщо дзвінком домовились про огляд, це спочатку `Communication`. Якщо огляд реально відбувся, створюється `OperationEvent`.

## Відомі технічні борги

- У багатьох файлах видно mojibake українського тексту. Логіка працює, але читабельність погана.
- Bulk-імпорт треба зробити стійким до дублів.
- Немає повноцінної пагінації в UI, хоча API її підтримує.
- Немає тестів для API парсингу.
- `fingerprint` є в моделі, але ще не генерується системно.
- `importBatchId` ще не доданий.
- Історія дзвінків поки зберігається як один `callResult`, а не масив подій.
## Call center layer for parsing

`LeadProperty.callCenter` is a protected CRM-only block for call-center verification. External imports and repeated source scans should not overwrite it unless the CRM explicitly sends `callCenter` in the payload.

Fields:

- `verifiedAddressText` - exact address confirmed by the operator.
- `infoVerified` - `unchecked`, `verified`, `partial`, `mismatch`.
- `inspectionLoyalty` - owner readiness for realtor inspection without a client: `unknown`, `yes`, `maybe`, `no`.
- `bottomPrice` - lowest price mentioned during the call.
- `interestLevel` - agency interest from 1 to 5, where 3 is normal.
- `urgencyLevel` - surface urgency from 1 to 5: 1 not in a hurry, 2 not urgent, 3 up to 3 months, 4 urgent, 5 very urgent.
- `cooperationWarmth` - cooperation warmth from 1 to 5, where 3 is normal.
- `note` - call-center technical note.

The manual parsing modal and parsing status modal can save this block. The status modal also requires a `Communication` when a lead is processed into base/inactive/paused/duplicate/fake.

## CRM activity log

`models/CRMActivityLog.js` is the shared CRM activity journal. It stores operational/audit events across CRM modules and is designed as the future source for employee activity reports and object history.

Core fields:

- `entityType` and `entityId` - what record the event belongs to.
- `action` - created, imported, updated, deleted, status_changed, communication_added, moved.
- `actorEmployee`, `actorUserId`, `actorName`, `actorRole` - who performed the action.
- `source` - manual, system, dimria, reamak, api, import.
- `before`, `after`, `diff` - compact tracked-field snapshots, not full documents.
- `meta` - technical details such as `propertyId`, `deletedImages`, source IDs, import data.

`utils/crm/activityLog.js` provides:

- `logActivity(...)`;
- `pickActivitySnapshot(...)`;
- `buildActivityDiff(...)`.

Current first integrations:

- parsing create/import;
- parsing edit/status change/move/delete;
- communication create.

`GET /api/crm/activity` returns activity logs with filters by entity, action, source, actor and date range.

## Inspection reservation

`LeadProperty.inspectionReservation` stores a temporary 24-hour inspection reservation:

- `reservedByEmployee`;
- `reservedByName`;
- `reservedByRole`;
- `reservedAt`;
- `expiresAt`.

Reservation is created through `PATCH /api/crm/parsing/[id]` with `action = reserveInspection`.
Active reservations lock parsing updates and linked Property status fields. Expiration is evaluated from `expiresAt`, so restoring the previous derived status does not require a background job.
