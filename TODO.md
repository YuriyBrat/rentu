# TODO

## Найближчий фокус

1. Стабілізувати bulk-імпорт парсингу.
2. Додати `fingerprint` для м'якого дедупу.
3. Додати `importBatchId` для партій імпорту.
4. Повернути нормальний звіт імпорту в UI.
5. Довести рух `base -> inspection -> rs/ds/zs/archive`.

## Backend

- [x] Створити модель `Communication`.
- [x] Додати API `GET /api/crm/communications?entityType=...&entityId=...`.
- [x] Додати API `POST /api/crm/communications`.
- [x] Додати зв'язок `Communication.operationEvent` для випадків, коли контакт прив'язаний до операційної події.
- [x] Розширити `OperationEvent` під огляди як операційні події.
- [x] Додати `type: inspection` в `OperationEvent`, `review` залишити для сумісності.
- [x] Доробити `POST /api/crm/parsing`, щоб дублікати не валили весь запит.
- [x] Замінити простий `insertMany` на контрольоване створення з обробкою дублів.
- [x] Повертати з імпорту `created`, `duplicates`, `failed`, `errors`.
- [x] Додати генерацію `fingerprint`.
- [ ] Додати поле `importBatchId` в `LeadProperty`.
- [x] Додати `sourceStatus` і `sourceCheckedAt` для зовнішніх джерел.
- [x] Додати `duplicatePropertyId`, щоб дубль з парсингу можна було прив'язати до нашого `Property`.
- [x] Додати `crmStage` для `Property`: `base`, `inspection`, `rs`, `ds`, `zs`, `archived`.
- [ ] Додати індекси для частих фільтрів: `stage`, `source`, `phone`, `importedAt`, `fingerprint`.
- [ ] Додати м'який дедуп по телефону, адресі, ціні, площі, кімнатах.
- [x] Додати endpoint або логіку для пошуку можливих дублів.
- [x] Додати API-фільтр парсингу `communicationFilter=none` для записів без комунікації.
- [x] Додати API-фільтр парсингу `communicationFilter=stale3` для записів зі старою комунікацією 3+ дні.
- [ ] Додати історію дзвінків як масив подій, якщо одного `callResult` стане мало.
- [x] Додати API-фільтр по типу контакту з phoneIntel.
- [x] Додати API-фільтр по наявності телефону, фото, ціни, адреси.
- [x] Додати `multipart/form-data` створення парсингу з фото.
- [x] Зберігати фото парсингу в Cloudinary `karamax/parsing/{leadPropertyId}/raw`.
- [x] Додати метадані фото парсингу: титулка, походження, сортування, variants.
- [x] Не переносити фото парсингу автоматично в `Property`.
- [x] Додати DIM.RIA client і mapping оголошення в `LeadProperty`.
- [x] Додати API `GET/POST /api/crm/integrations/dimria/import`.
- [x] Додати API `GET /api/crm/integrations/dimria/status`.
- [x] Додати Reamak/Hunter API `POST /api/crm/integrations/reamak/import`.
- [x] Додати `reamakId` та індекси Reamak у `LeadProperty`.
- [x] Додати `priceHistory` для LeadProperty.
- [x] Оновлювати існуючі DIM.RIA/Reamak записи при повторному скані.
- [ ] Додати тестові сценарії для `GET /api/crm/parsing`.
- [ ] Додати тестові сценарії для `POST /api/crm/parsing`.
- [ ] Додати тестові сценарії для `PATCH /api/crm/parsing/[id]`.

## Frontend

- [x] Створити reusable `CommunicationDialog`.
- [x] Створити reusable `CommunicationTimeline`.
- [x] У парсингу зробити правий drawer з історією комунікацій.
- [x] У модалці зміни статусу вимагати комунікацію при переводі в базу.
- [x] Прибрати зайві статуси `В роботі`, `Продзвонено`, `Відхилено` з модалки рішення по парсингу.
- [x] Прибрати `Новий` з модалки рішення, щоб після контакту не повертати запис назад у новий.
- [x] Додати причину `Проданий нами` для неактуальних.
- [x] Показувати останню комунікацію в рядку парсингу як індикатор днів з tooltip точного часу.
- [x] Показувати дату внесення в рядку як `дд.мм.рр` і час окремо дрібніше.
- [x] Додати фільтри черги `Усі`, `Без комунікації`, `Старі 3+ дні`.
- [x] При статусі дубль вимагати вибір оригіналу або нашого `Property`.
- [x] Прибрати `Огляд` як окремий пункт меню, огляд лишити стадією/операційною подією.
- [ ] Показувати звіт після bulk-імпорту.
- [x] Показувати джерело в парсингу як кнопку з переходом.
- [x] Додати кольори для статусу джерела.
- [x] Додати сторінку `/crm/base`.
- [x] Додати `База` в меню, а `Огляд` лишити стадією/операційною подією.
- [ ] Додати пагінацію на `/crm/parsing`.
- [ ] Додати вибір `pageSize`.
- [ ] Додати сортування за датою імпорту.
- [ ] Додати сортування за ціною.
- [ ] Додати сортування за площею.
- [x] Додати фільтр по типу контакту: власник, маклер, ймовірний маклер, невідомо.
- [x] Додати фільтр "є телефон".
- [x] Додати фільтр "є фото".
- [x] Додати фільтр "є ціна".
- [x] Додати фільтр "є адреса".
- [x] Додати фільтр "є посилання".
- [ ] Додати діалог порівняння можливих дублів.
- [x] Додати кнопку "позначити дублем" з вибором оригіналу.
- [ ] Додати передперегляд перед переносом в `Property`.
- [ ] Додати можливість редагувати поля перед переносом.
- [x] Розширити ручну форму парсингу базовими полями і фото.
- [x] Додати UI-блок DIM.RIA імпорту на сторінку парсингу.
- [ ] Додати призначення запису на менеджера.
- [ ] Додати фільтр "мої записи".

## Інтеграції

- [x] Узгодити базовий payload для Reamak/Hunter імпорту.
- [x] Підключити базовий DIM.RIA імпорт.
- [ ] Додати стабільний прийом оголошень з OLX-парсера.
- [x] Додати джерельні дати: `sourcePublishedAt`, `sourceUpdatedAt`, `sourcePriceChangedAt`.
- [x] Додати контроль повторного оновлення одного `sourceId` для DIM.RIA.
- [x] Вирішити, чи оновлювати існуючий запис при повторному імпорті, чи тільки пропускати.
- [ ] Додати лог імпортів по партіях.
- [ ] Додати `importBatchId` для DIM.RIA/Reamak/manual/bulk імпортів.
- [ ] Додати єдиний UI-звіт імпорту: створено, оновлено, дублікати, помилки.
- [ ] Додати журнал запусків DIM.RIA імпорту.
- [ ] Додати журнал Hunter/Reamak догрузок.

## Property Mapping

- [ ] Перевірити mapping `LeadProperty -> Property`.
- [ ] Нормалізувати типи нерухомості.
- [ ] Нормалізувати типи угод.
- [ ] Нормалізувати валюту.
- [ ] Вирівняти структуру фото.
- [ ] Додати перевірку схожих `Property` перед створенням нового.
- [ ] Додати вибір існуючого власника або створення нового.
- [ ] Додати більш детальний запис у `workHistory`.

## Аналітика

- [ ] Лічильники по джерелах.
- [ ] Конверсія `raw -> qualified`.
- [ ] Конверсія `qualified -> moved`.
- [ ] Частка дублів по кожному джерелу.
- [ ] Частка фейків по кожному джерелу.
- [ ] Частка маклерів по кожному джерелу.
- [ ] Статистика по менеджерах.
- [ ] Список номерів з високою частотою повторів.

## Технічний борг

- [ ] Виправити mojibake українського тексту в існуючих JSX/JS файлах.
- [ ] Перевірити всі CRM-файли на кодування UTF-8.
- [ ] Прибрати або замінити демо-рядки, коли з'явиться реальний потік даних.
- [ ] Додати валідацію payload на API-рівні.
- [ ] Додати більш дружні помилки для UI.
- [ ] Перевірити, чи всі Mongoose індекси створюються в поточному середовищі.

## Документація

- [x] Створити `AGENT_NOTES.md`.
- [x] Створити `ARCHITECTURE.md`.
- [x] Створити `BUSINESS_RULES.md`.
- [x] Створити `TODO.md`.
- [x] Зафіксувати розділення `OperationEvent` і `Communication`.
- [ ] Оновлювати ці файли після великих змін у парсингу.
## Recent parsing call-center work

- [x] Add `LeadProperty.callCenter` for call-center technical verification.
- [x] Add manual parsing fields for exact address, info verification, inspection loyalty, bottom price, interest, urgency, cooperation warmth and call-center note.
- [x] Add the same call-center categories to parsing status processing.
- [x] Save `callCenter` together with status transitions and required communication.
- [ ] Show compact call-center indicators in the parsing row/card.
- [ ] Add filters by interest, urgency, inspection loyalty and cooperation warmth.
- [x] Split parsing workflow display into `БАЗА`, `Чекає огляд` and `Обʼєкти`.
- [x] Highlight inspection-ready parsing records as a realtor priority queue.
- [x] Add 24-hour `ЇДУ НА ОГЛЯД` reservation for eligible parsing records.
- [x] Lock parsing and linked Property status changes during an active inspection reservation.
- [ ] Add a dedicated report of inspection reservations and completed inspections.

## CRM activity log

- [x] Create `models/CRMActivityLog.js`.
- [x] Create `utils/crm/activityLog.js`.
- [x] Add `GET /api/crm/activity`.
- [x] Log parsing manual create/import.
- [x] Log parsing edit/status change/move/delete.
- [x] Log communication creation.
- [ ] Add activity logging to `Property` edits.
- [x] Add activity logging to `OperationEvent` create/edit/delete.
- [x] Show the CRM page name in `/crm/activity` after the action source.
- [ ] Add activity logging to leads/pipeline.
- [x] Build first `/crm/activity` report page.
- [ ] Add compact activity timeline to parsing/property drawers.
