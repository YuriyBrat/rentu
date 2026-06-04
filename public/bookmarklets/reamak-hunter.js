(function () {
   const CRM_ORIGIN = window.__KARAMAX_CRM_ORIGIN || 'https://karamax.com.ua';
   const API_URL = `${CRM_ORIGIN}/api/crm/integrations/reamak/import`;
   const TOKEN_KEY = 'karamax_reamak_import_token';
   const STYLE_ID = 'karamax-reamak-hunter-style';
   const PANEL_ID = 'karamax-reamak-hunter-panel';

   if (window.__karamaxReamakHunter?.active) {
      window.__karamaxReamakHunter.stop();
      return;
   }

   function addStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
         html.karamax-reamak-hunter, html.karamax-reamak-hunter * { cursor: crosshair !important; }
         .karamax-reamak-target { outline: 3px solid #ef4444 !important; outline-offset: 2px !important; }
         #${PANEL_ID} {
            position: fixed; right: 18px; bottom: 18px; z-index: 2147483647;
            max-width: 340px; padding: 12px 14px; border-radius: 8px;
            background: #111827; color: #f9fafb; font: 13px/1.35 Arial, sans-serif;
            box-shadow: 0 14px 40px rgba(0,0,0,.35);
         }
         #${PANEL_ID} b { color: #fca5a5; }
         #${PANEL_ID} button {
            margin-top: 10px; border: 0; border-radius: 6px; padding: 7px 10px;
            background: #ef4444; color: white; font-weight: 700;
         }
      `;
      document.head.appendChild(style);
   }

   function panel(message) {
      let node = document.getElementById(PANEL_ID);
      if (!node) {
         node = document.createElement('div');
         node.id = PANEL_ID;
         document.body.appendChild(node);
      }
      node.innerHTML = `${message}<br><button type="button">Вимкнути</button>`;
      node.querySelector('button').onclick = stop;
   }

   function clean(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
   }

   function linesFrom(text) {
      return clean(text).split(/(?=\b(?:Продаж|Оренда|Сьогодні|Учора|ID|Час|Телефони|Пов'язані|Real Estate)\b)|\n/).map(clean).filter(Boolean);
   }

   function findContainer(element) {
      return element.closest('tr, [data-id], .announcement, .advertisement, .object, .item, .row') ||
         element.closest('tbody, table, section, article, div') ||
         element;
   }

   function uniqueElements(elements) {
      return Array.from(new Set(elements.filter(Boolean)));
   }

   function hasReamakIdsText(text) {
      const value = String(text || '');
      return /(ID\s+на\s+сайті|ID\s+РЅР°\s+СЃР°Р№С‚С–)/i.test(value) &&
         /(ID\s+оголошення|ID\s+РѕРіРѕР»РѕС€РµРЅРЅСЏ)/i.test(value);
   }

   function findDetailScope(element) {
      let node = element;
      let best = null;

      while (node && node !== document.body) {
         const text = node.innerText || '';
         if (hasReamakIdsText(text)) {
            if (!best || text.length < (best.innerText || '').length) best = node;
         }
         node = node.parentElement;
      }

      return best;
   }

   function hasObjectCells(row) {
      return !!row?.querySelector?.('td[data-title*="Адрес"], td[data-title*="РђРґСЂРµСЃ"], td[data-title*="Ціна"], td[data-title*="Р¦С–РЅ"]');
   }

   function isDataRow(row) {
      return (row?.querySelectorAll?.('td[data-title]')?.length || 0) >= 5;
   }

   function findOwnerRow(detailScope, fallbackElement) {
      const directRow = fallbackElement?.closest?.('tr');
      const directRowText = directRow?.innerText || '';
      if ((isDataRow(directRow) || hasObjectCells(directRow)) && !hasReamakIdsText(directRowText)) return directRow;

      const detailRow = detailScope?.closest?.('tr') || (hasReamakIdsText(directRowText) ? directRow : null);
      let node = detailRow?.previousElementSibling;
      while (node) {
         if ((isDataRow(node) || hasObjectCells(node)) && !hasReamakIdsText(node.innerText || '')) return node;
         node = node.previousElementSibling;
      }

      node = detailScope?.previousElementSibling;
      while (node) {
         if ((isDataRow(node) || hasObjectCells(node)) && !hasReamakIdsText(node.innerText || '')) return node;
         node = node.previousElementSibling;
      }

      return null;
   }

   function findAdElements(element) {
      const detailScope = findDetailScope(element);
      if (detailScope) {
         const ownerRow = findOwnerRow(detailScope, element);
         const detailRow = detailScope.closest?.('tr') || detailScope;
         return uniqueElements([ownerRow, detailRow]);
      }

      const container = findContainer(element);
      const row = element.closest('tr');

      if (row) {
         const related = [row];
         const siblings = [row.nextElementSibling];
         siblings.forEach((item) => {
            const text = clean(item?.innerText);
            const hasUsefulText = /(ID|телефон|ціна|час|опис|стан|тип|OLX|Real Estate|DIM\.RIA|РўРµР»РµС„РѕРЅ|РћРїРёСЃ|РЎС‚Р°РЅ|РўРёРї|Р¦С–РЅ|Р§Р°СЃ)/i.test(text);
            const hasImages = item?.querySelectorAll?.('img')?.length > 0;
            if (hasUsefulText || hasImages) related.push(item);
         });
         return uniqueElements(related);
      }

      const parent = container.parentElement;
      return uniqueElements([
         container,
         container.previousElementSibling,
         container.nextElementSibling,
         parent,
      ]);
   }

   function extractByLabel(text, labels) {
      for (const label of labels) {
         const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
         const match = text.match(new RegExp(`${escaped}\\s*:?\\s*([^\\n]+)`, 'i'));
         if (match) return clean(match[1]);
      }
      return '';
   }

   function extractSiteId(text) {
      const match = String(text || '').match(/(?:ID\s+на\s+сайті|ID\s+РЅР°\s+СЃР°Р№С‚С–)\s*:?\s*([0-9]{4,})/i);
      return clean(match?.[1] || '');
   }

   function extractReamakId(text) {
      const match = String(text || '').match(/(?:ID\s+оголошення|ID\s+РѕРіРѕР»РѕС€РµРЅРЅСЏ)\s*:?\s*([0-9]+\/[0-9]+)/i);
      return clean(match?.[1] || '');
   }

   function getDetailText(elements) {
      const detail = elements
         .map((node) => node?.innerText || '')
         .find((text) => hasReamakIdsText(text));
      return detail || elements.map((item) => item.innerText || '').join('\n');
   }

   function parseFirst(regex, text) {
      const match = text.match(regex);
      return match ? clean(match[1] || match[0]) : '';
   }

   function getCellText(row, title) {
      if (!row) return '';
      const cell = Array.from(row.querySelectorAll('td[data-title]')).find((td) => {
         const value = td.getAttribute('data-title') || '';
         return value.toLowerCase().includes(title.toLowerCase());
      });
      if (!cell) return '';

      const clone = cell.cloneNode(true);
      clone.querySelectorAll('script, style, input, button, a[href*="maps.google"]').forEach((node) => node.remove());
      return clean(clone.innerText || clone.textContent || '');
   }

   function parseRowData(elements) {
      const row = elements.find((item) => isDataRow(item) || hasObjectCells(item));
      const address = getCellText(row, 'Адрес') || getCellText(row, 'РђРґСЂРµСЃ');
      const priceText = getCellText(row, 'Ціна') || getCellText(row, 'Р¦С–РЅ');
      const floorText = getCellText(row, 'Поверх') || getCellText(row, 'РџРѕРІРµСЂ');
      const areaText = getCellText(row, 'Площа') || getCellText(row, 'РџР»РѕС‰');
      const roomsText = getCellText(row, 'Кімнат') || getCellText(row, 'РљС–РјРЅ');
      const objectText = getCellText(row, "Об'єкт") || getCellText(row, 'Обʼєкт') || getCellText(row, 'РћР±');
      const phoneText = getCellText(row, 'Телефон') || getCellText(row, 'РўРµР»');

      const floorMatch = floorText.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)/);
      const roomsMatch = roomsText.match(/(\d+)/);
      return {
         address,
         price: parseUsdPrice(priceText),
         floor: floorMatch ? Number(floorMatch[1]) : undefined,
         floors: floorMatch ? Number(floorMatch[2]) : undefined,
         square: areaMatch ? parseNumber(areaMatch[1]) : undefined,
         rooms: roomsMatch ? Number(roomsMatch[1]) : undefined,
         objectType: objectText,
         phone: parseFirst(/(?:\+?38)?\s*\(?0\d{2}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/, phoneText),
      };
   }

   function parseRowDataStrict(elements) {
      const row = elements.find((item) => isDataRow(item) || hasObjectCells(item));
      const cells = row ? Array.from(row.querySelectorAll('td[data-title]')) : [];

      const textAt = (index) => {
         const cell = cells[index];
         if (!cell) return '';

         const clone = cell.cloneNode(true);
         clone.querySelectorAll('script, style, input, button, a[href*="maps.google"]').forEach((node) => node.remove());
         return clean(clone.innerText || clone.textContent || '');
      };

      const objectText = getCellText(row, "Об'єкт") || getCellText(row, 'Обʼєкт') || textAt(0);
      const roomsText = getCellText(row, 'Кімнат') || textAt(1);
      const areaText = getCellText(row, 'Площа') || textAt(2);
      const floorText = getCellText(row, 'Поверх') || textAt(3);
      const address = getCellText(row, 'Адрес') || textAt(4);
      const priceText = getCellText(row, 'Ціна') || textAt(5);
      const phoneText = getCellText(row, 'Телефон') || textAt(6);
      const rowText = clean(row?.innerText || '');
      const siteName = parseFirst(/\b(OLX|Real Estate|DIM\.RIA|Rieltor|LUN|DomRia|Obyava|Besplatka)\b/i, rowText);

      const floorMatch = floorText.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)/);
      const roomsMatch = roomsText.match(/(\d+)/);
      return {
         address,
         price: parseUsdPrice(priceText),
         floor: floorMatch ? Number(floorMatch[1]) : undefined,
         floors: floorMatch ? Number(floorMatch[2]) : undefined,
         square: areaMatch ? parseNumber(areaMatch[1]) : undefined,
         rooms: roomsMatch ? Number(roomsMatch[1]) : undefined,
         objectType: objectText,
         phone: parseFirst(/(?:\+?38)?\s*\(?0\d{2}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/, phoneText),
         siteName,
      };
   }

   function parseRowDataByTitle(elements) {
      const row = elements.find((item) => isDataRow(item) || hasObjectCells(item));
      const cells = row ? Array.from(row.querySelectorAll('td[data-title]')) : [];

      const cellByTitle = (labels) => {
         const list = Array.isArray(labels) ? labels : [labels];
         return cells.find((cell) => {
            const title = String(cell.getAttribute('data-title') || '').toLowerCase();
            return list.some((label) => title.includes(String(label).toLowerCase()));
         });
      };

      const textFromCell = (cell) => {
         if (!cell) return '';
         const clone = cell.cloneNode(true);
         clone.querySelectorAll('script, style, input, button, a[href*="maps.google"]').forEach((node) => node.remove());
         return clean(clone.innerText || clone.textContent || '');
      };

      const objectText = textFromCell(cellByTitle(['\u041e\u0431', '\u041e\u0431\u0027\u0454\u043a\u0442', '\u041e\u0431\u2019\u0454\u043a\u0442']));
      const roomsText = textFromCell(cellByTitle('\u041a\u0456\u043c\u043d\u0430\u0442'));
      const areaText = textFromCell(cellByTitle('\u041f\u043b\u043e\u0449\u0430'));
      const floorText = textFromCell(cellByTitle('\u041f\u043e\u0432\u0435\u0440\u0445'));
      const address = textFromCell(cellByTitle('\u0410\u0434\u0440\u0435\u0441'));
      const priceText = textFromCell(cellByTitle('\u0426\u0456\u043d\u0430'));
      const phoneText = textFromCell(cellByTitle('\u0422\u0435\u043b\u0435\u0444\u043e\u043d'));
      const rowText = clean(row?.innerText || '');
      const siteName = parseFirst(/\b(OLX|Real Estate|DIM\.RIA|Rieltor|LUN|DomRia|Obyava|Besplatka)\b/i, rowText);

      const floorMatch = floorText.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
      const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)/);
      const roomsMatch = roomsText.match(/(\d+)/);
      return {
         address,
         price: parseUsdPrice(priceText),
         floor: floorMatch ? Number(floorMatch[1]) : undefined,
         floors: floorMatch ? Number(floorMatch[2]) : undefined,
         square: areaMatch ? parseNumber(areaMatch[1]) : undefined,
         rooms: roomsMatch ? Number(roomsMatch[1]) : undefined,
         objectType: objectText,
         phone: parseFirst(/(?:\+?38)?\s*\(?0\d{2}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/, phoneText),
         siteName,
      };
   }

   function parseNumber(value) {
      const normalized = clean(value).replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
      return normalized ? Number(normalized) : undefined;
   }

   function parseUsdPrice(value) {
      const text = clean(value);
      if (!text) return undefined;

      const dollar = text.match(/\$\s*([\d\s.,]+)/);
      if (dollar) return parseNumber(dollar[1]);

      const usd = text.match(/([\d\s.,]+)\s*USD/i);
      if (usd) return parseNumber(usd[1]);

      const firstNumber = text.match(/[\d\s.,]+/);
      return parseNumber(firstNumber?.[0]);
   }

   function parseUkrDateTime(value) {
      const text = clean(value);
      if (!text) return '';

      const months = {
         січня: 0,
         лютого: 1,
         березня: 2,
         квітня: 3,
         травня: 4,
         червня: 5,
         липня: 6,
         серпня: 7,
         вересня: 8,
         жовтня: 9,
         листопада: 10,
         грудня: 11,
      };
      const match = text.match(/(\d{1,2})\s+([а-яіїєґ]+)\s+(\d{4})\s+в\s+(\d{1,2}):(\d{2})/i);
      if (!match) return '';

      const month = months[match[2].toLowerCase()];
      if (month === undefined) return '';

      const date = new Date(Number(match[3]), month, Number(match[1]), Number(match[4]), Number(match[5]));
      return Number.isNaN(date.getTime()) ? '' : date.toISOString();
   }

   function extractDateAfterLabel(text, label) {
      const value = String(text || '');
      const index = value.toLowerCase().indexOf(label.toLowerCase());
      if (index < 0) return '';

      const tail = value.slice(index + label.length, index + label.length + 80);
      return parseUkrDateTime(tail);
   }

   function normalizeImageKey(src) {
      try {
         const url = new URL(src, location.href);
         ['w', 'width', 'h', 'height', 'size', 'thumb', 'preview', 'resize', 'quality'].forEach((key) => url.searchParams.delete(key));
         const path = url.pathname.toLowerCase()
            .replace(/\/(?:thumb|thumbnail|small|mini|preview|cache)\//gi, '/')
            .replace(/([_-])(?:\d{2,4}x\d{2,4}|\d{2,4})($|\.)/gi, '$1$2')
            .replace(/\/(?:\d{2,4}x\d{2,4}|\d{2,4})\//gi, '/')
            .replace(/(?:_|-)?(?:small|thumb|thumbnail|preview|mini)(?=\.)/gi, '');

         return `${url.hostname}${path}`
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');
      } catch {
         return String(src || '').split('?')[0].toLowerCase()
            .replace(/([_-])(?:\d{2,4}x\d{2,4}|\d{2,4})($|\.)/gi, '$1$2')
            .replace(/(?:_|-)?(?:small|thumb|thumbnail|preview|mini)(?=\.)/gi, '');
      }
   }

   function isThumbUrl(src) {
      return /(?:thumb|thumbnail|small|mini|preview|\/\d{2,3}x\d{2,3}\/|[_-]\d{2,3}x\d{2,3}(?=\.))/i.test(String(src || ''));
   }

   function isVisibleMedia(node) {
      if (!node || !node.getBoundingClientRect) return false;
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width >= 35 &&
         rect.height >= 35 &&
         style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         Number(style.opacity || 1) > 0.05;
   }

   function isBadImageUrl(src) {
      const value = String(src || '').toLowerCase();
      return !value ||
         value.startsWith('data:') ||
         value.includes('logo') ||
         value.includes('avatar') ||
         value.includes('user') ||
         value.includes('reamak') && value.includes('img');
   }

   function collectImages(elements) {
      const byKey = new Map();
      const detailScopes = elements.filter((scope) => !isDataRow(scope) && scope?.querySelectorAll?.('img')?.length);
      const scopes = (detailScopes.length ? detailScopes : elements).filter(Boolean);

      scopes.forEach((scope) => {
         scope.querySelectorAll('img, a[href]').forEach((node) => {
            if (!isVisibleMedia(node)) return;
            const parentHref = node.closest?.('a[href]')?.href || '';
            const srcset = node.getAttribute?.('srcset') || '';
            const srcsetUrl = srcset
               .split(',')
               .map((part) => part.trim().split(/\s+/)[0])
               .filter(Boolean)
               .pop();
            const candidates = [
               parentHref,
               node.getAttribute?.('data-full'),
               node.getAttribute?.('data-original'),
               srcsetUrl ||
                  '',
               node.currentSrc,
               node.src,
               node.href ||
                  '',
               node.getAttribute?.('data-src'),
            ].filter(Boolean);

            const src = candidates.find((item) => !isThumbUrl(item)) || candidates[0] || '';

            if (!isBadImageUrl(src) && /\.(jpe?g|png|webp)(\?|$)/i.test(src)) {
               const rect = node.getBoundingClientRect();
               if (isThumbUrl(src) && (node.naturalWidth || rect.width) < 120 && (node.naturalHeight || rect.height) < 120) return;

               const key = normalizeImageKey(src);
               const old = byKey.get(key);
               const oldScore = old?.score || 0;
               const pixels = (node.naturalWidth || rect.width || 0) * (node.naturalHeight || rect.height || 0);
               const score = String(src).length + (isThumbUrl(src) ? -1000 : 0) + (pixels > 40000 ? 1000 : 0);
               if (!old || score > oldScore) byKey.set(key, { url: src, score });
            }
         });
      });
      return Array.from(byKey.values()).map((item) => item.url).slice(0, 8);
   }

   function getNodeUrlCandidates(node) {
      const attrs = ['href', 'data-href', 'data-url', 'data-link', 'data-original-url', 'onclick'];
      return attrs.map((name) => node.getAttribute?.(name) || '').filter(Boolean);
   }

   function extractOriginalUrl(value) {
      const raw = String(value || '').replace(/\\\//g, '/').replace(/&amp;/gi, '&');
      let decoded = raw;
      try {
         decoded = decodeURIComponent(raw);
      } catch {
         decoded = raw;
      }
      const text = `${raw} ${decoded}`;
      const urls = text.match(/https?:\/\/[^\s'")<>]+/gi) || [];
      const found = urls.find((href) => {
         if (/reamak\.info/i.test(href)) return false;
         return /olx|dom\.ria|dim\.ria|rieltor|lun|realestate|obyava|besplatka/i.test(href);
      });
      if (!found) return '';

      try {
         return decodeURIComponent(found);
      } catch {
         return found;
      }
   }

   function findOriginalUrl(elements) {
      const nodes = elements.flatMap((scope) => Array.from(scope.querySelectorAll('a[href], button, [data-url], [data-href], [onclick]')));
      const candidates = nodes.flatMap(getNodeUrlCandidates).concat(elements.map((item) => clean(item.innerText)));

      for (const candidate of candidates) {
         const url = extractOriginalUrl(candidate);
         if (url) return url;
      }

      return '';
   }

   function detectSiteName(text, originalUrl) {
      const url = String(originalUrl || '').toLowerCase();
      if (url.includes('olx.')) return 'OLX';
      if (url.includes('dom.ria') || url.includes('dim.ria')) return 'DIM.RIA';
      if (url.includes('rieltor.')) return 'Rieltor';
      if (url.includes('lun.')) return 'LUN';
      if (url.includes('realestate')) return 'Real Estate';
      if (url.includes('obyava')) return 'Obyava';
      return parseFirst(/\b(Real Estate|DIM\.RIA|OLX|Rieltor|LUN|DomRia|Obyava|Besplatka)\b/i, text) || '';
   }

   function buildOriginalUrlFallback(siteName, siteId) {
      const site = String(siteName || '').toLowerCase();
      const id = clean(siteId);
      if (!id) return '';
      if (site.includes('olx')) return `https://www.olx.ua/uk/list/q-${encodeURIComponent(id)}/`;
      if (site.includes('dim') || site.includes('dom') || site.includes('ria')) return `https://dom.ria.com/uk/search/?query=${encodeURIComponent(id)}`;
      if (site.includes('real')) return `https://real-estate.lviv.ua/search?query=${encodeURIComponent(id)}`;
      return '';
   }

   function parseFloor(text) {
      const floorZone = text.match(/(?:поверх|РџРѕРІРµСЂС…)[^\d]{0,12}(\d{1,2})\s*\/\s*(\d{1,2})/i);
      if (floorZone) {
         const pair = { floor: Number(floorZone[1]), floors: Number(floorZone[2]) };
         if (pair.floor > 0 && pair.floors > 0 && pair.floor <= pair.floors && pair.floors <= 40) return pair;
      }

      const pairs = Array.from(text.matchAll(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/g))
         .map((match) => ({ floor: Number(match[1]), floors: Number(match[2]) }))
         .filter((pair) => pair.floor > 0 && pair.floors > 0 && pair.floor <= pair.floors && pair.floors <= 40);

      return pairs[pairs.length - 1] || {};
   }

   function parseArea(text) {
      const match = text.match(/\b(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?){0,2}\s*м(?:2|²|ВІ)\b/i);
      return match ? parseNumber(match[1]) : undefined;
   }

   function parseDescription(elements) {
      const editable = elements.map((scope) => scope.querySelector('textarea, [contenteditable="true"]')).find(Boolean);
      if (editable) return clean(editable.value || editable.innerText);

      const detailBlocks = elements.flatMap((scope) => Array.from(scope.querySelectorAll('td, div, section, article')))
         .map((node) => clean(node.innerText))
         .filter((text) => text.length > 80 && /продаж|оренда|квартира|будинок|паркінг|ремонт|мебл/i.test(text));

      return detailBlocks.sort((a, b) => b.length - a.length)[0] || '';
   }

   function cleanDescription(value) {
      let text = clean(value);
      if (!text) return '';

      const stopPatterns = [
         /Стан об'єкту:/i,
         /Стан об’єкту:/i,
         /Час додавання на сайт:/i,
         /ID на сайті:/i,
         /ID оголошення:/i,
         /ще\s+\d+\s+фото/i,
         /РЎС‚Р°РЅ РѕР±['вЂ™]С”РєС‚Сѓ:/i,
         /Р§Р°СЃ РґРѕРґР°РІР°РЅРЅСЏ РЅР° СЃР°Р№С‚:/i,
      ];

      for (const pattern of stopPatterns) {
         const index = text.search(pattern);
         if (index > 120) text = text.slice(0, index);
      }

      const head = text.slice(0, Math.min(260, text.length));
      const repeatIndex = text.indexOf(head, Math.max(300, head.length + 20));
      if (repeatIndex > 0) text = text.slice(0, repeatIndex);

      return text
         .replace(/\s*-{5,}\s*/g, ' ')
         .replace(/\s{2,}/g, ' ')
         .trim()
         .slice(0, 2500);
   }

   function parseAddress(text) {
      const lines = linesFrom(text);
      const cityLine = lines.find((line) => /Львів|Трускавець|міська рада|район|вул\.|вулиця/i.test(line)) || '';
      return cityLine;
   }

   function parseCleanAddress(text) {
      const bad = /знайти схожі|згорнути|детальніше|продаж|оренда|кімнат|м2|м²|\$|usd|телефон|\(?0\d{2}\)?|пов'язані|категорія|оброблено|важливо|фуфло|реалізовано|Р—РЅР°Р№С‚Рё|Р—РіРѕСЂРЅСѓС‚Рё|Р”РµС‚Р°Р»СЊРЅС–С€Рµ|РџСЂРѕРґР°Р¶|РћСЂРµРЅРґР°|РєС–РјРЅР°С‚|РўРµР»РµС„РѕРЅ/i;
      const good = /Львів|Трускавець|Винники|Брюховичі|Сокільники|Зимна Вода|міська рада|район|вул\.|вулиця|Р›СЊРІС–РІ|РўСЂСѓСЃРєР°РІРµС†СЊ|Р’РёРЅРЅРёРєРё|Р‘СЂСЋС…РѕРІРёС‡С–|РЎРѕРєС–Р»СЊРЅРёРєРё|РјС–СЃСЊРєР° СЂР°РґР°|СЂР°Р№РѕРЅ|РІСѓР»\.|РІСѓР»РёС†СЏ/i;
      const lines = clean(text).split(/\n| {2,}/).map(clean).filter(Boolean);
      const direct = lines
         .map((item) => item.replace(/^\d+\s*\/\s*\d+\s*/, ''))
         .find((item) => item.length >= 4 && item.length <= 90 && good.test(item) && !bad.test(item));

      if (direct) return direct;

      const fallback = parseAddress(text);
      if (fallback && !bad.test(fallback)) return fallback;

      const match = clean(text).match(/((?:[А-ЯІЇЄҐA-Z][\w'’.-]+\s+){0,3}(?:міська рада|район|вул\.?\s*[А-ЯІЇЄҐA-Z][^,$\n]{1,50}|Львів|Трускавець)[^,$\n]{0,60})/i);
      return clean(match?.[1] || '');
   }

   function parseStructuredAddress(text) {
      const rawLines = String(text || '').split(/\n/).map(clean).filter(Boolean);
      const bad = /знайти|схожі|згорнути|детальніше|продаж|оренда|кімнат|м2|м²|\$|usd|телефон|пов'язані|категорія|оброблено|важливо|фуфло|реалізовано|ID|Р—РЅР°Р№С‚Рё|Р—РіРѕСЂРЅСѓС‚Рё|Р”РµС‚Р°Р»|РџСЂРѕРґР°Р¶|РћСЂРµРЅРґР°|РєС–РјРЅР°С‚|РўРµР»РµС„РѕРЅ/i;
      const good = /Львів|Трускавець|Винники|Брюховичі|Сокільники|Зимна Вода|міська рада|район|вул\.|вулиця|Р›СЊРІС–РІ|РўСЂСѓСЃРєР°РІРµС†СЊ|Р’РёРЅРЅРёРєРё|Р‘СЂСЋС…|РЎРѕРє|РјС–СЃСЊРєР° СЂР°РґР°|СЂР°Р№РѕРЅ|РІСѓР»\.|РІСѓР»РёС†СЏ/i;

      for (let i = 0; i < rawLines.length; i += 1) {
         const line = rawLines[i].replace(/^\d+\s*\/\s*\d+\s*/, '');
         if (line.length < 4 || line.length > 90 || bad.test(line) || !good.test(line)) continue;

         const next = rawLines[i + 1] || '';
         const canAppendNext = next &&
            next.length <= 40 &&
            !bad.test(next) &&
            /(Львів|Трускавець|Винники|Брюховичі|Сокільники|Зимна Вода|Р›СЊРІС–РІ|РўСЂСѓСЃРєР°РІРµС†СЊ)/i.test(next) &&
            !line.includes(next);

         return clean(canAppendNext ? `${line}, ${next}` : line);
      }

      return parseCleanAddress(text);
   }

   function extractAddressFromDescription(text) {
      const value = clean(text);
      if (!value) return '';

      const withStreet = value.match(/(?:вул\.?|вулиця)\s*([А-ЯІЇЄҐA-Z][^,.]{2,50}\s+\d+\s*[А-Яа-яA-Za-z]?)/i);
      if (withStreet) return clean(`вул. ${withStreet[1]}`);

      const withComplex = value.match(/(?:жк|ЖК)\s+([А-ЯІЇЄҐA-Z][^,.]{2,35})\s+([А-ЯІЇЄҐA-Z][а-яіїєґ'’.-]+(?:ська|цька|ова|ева|на|ний|ська|ський)\s+\d+\s*[А-Яа-яA-Za-z]?)/i);
      if (withComplex) return clean(`ЖК ${withComplex[1]} ${withComplex[2]}`);

      const streetLike = value.match(/\b([А-ЯІЇЄҐA-Z][а-яіїєґ'’.-]+(?:ська|цька|ова|ева|на|ний|ський)\s+\d+\s*[А-Яа-яA-Za-z]?)\b/);
      return clean(streetLike?.[1] || '');
   }

   function buildReadableTitle({ rooms, objectType, address }) {
      const parts = [];
      const roomCount = Number(rooms);
      if (Number.isFinite(roomCount) && roomCount > 0) parts.push(`${roomCount}к`);
      parts.push(/кварт/i.test(objectType) ? 'квартира' : clean(objectType || 'обʼєкт').toLowerCase());

      const city = parseFirst(/\b(Львів|Трускавець|Винники|Брюховичі|Сокільники|Зимна Вода)\b/i, address);
      const street = parseFirst(/(?:вул\.?|вулиця)\s*([^,]+)/i, address);
      if (city) parts.push(city);
      if (street) parts.push(`вул. ${street}`);
      return clean(parts.join(' '));
   }

   function detectContactKind(text) {
      if (/власник/i.test(text)) return 'owner';
      if (/маклер|агентств/i.test(text)) return 'realtor';
      return 'unknown';
   }

   function buildPayload(container) {
      const elements = findAdElements(container);
      const text = elements.map((item) => item.innerText || '').join('\n');
      const detailText = getDetailText(elements);
      const titleRowData = parseRowDataByTitle(elements);
      const fallbackRowData = parseRowDataStrict(elements);
      const rowData = {
         ...fallbackRowData,
         ...Object.fromEntries(Object.entries(titleRowData).filter(([, value]) => value !== undefined && value !== '')),
      };
      const hasRowIdentity = !!(rowData.address || rowData.price || rowData.square || rowData.floor || rowData.rooms);
      if (!hasRowIdentity) {
         throw new Error('Не знайшов верхній рядок обʼєкта. Клікни по шапці рядка або по його розгорнутих деталях ще раз.');
      }
      const fullText = clean(text);
      const originalUrl = findOriginalUrl(elements);
      const phone = parseFirst(/(?:\+?38)?\s*\(?0\d{2}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/, fullText);
      const priceText = parseFirst(/\$\s*([\d\s.,]+)/, fullText) || parseFirst(/([\d\s.,]+)\s*(?:USD|\$)/i, fullText);
      const roomText = parseFirst(/(\d+)\s*кімнат/i, fullText);
      const reamakId = parseFirst(/\b(?:ID оголошення|ID)\s*:?\s*([A-Za-zА-Яа-я0-9/-]+)/i, fullText);
      const siteId = extractByLabel(text, ['ID на сайті']) || parseFirst(/\bID на сайті\s*:?\s*([A-Za-zА-Яа-я0-9/-]+)/i, fullText);
      const siteName = rowData.siteName || detectSiteName(fullText, originalUrl);
      const sourceUrl = originalUrl || buildOriginalUrlFallback(siteName, siteId);
      const objectType = linesFrom(text).find((line) => /квартира|будинок|паркомісце|гараж|земля|комерц/i.test(line)) || '';
      const address = extractByLabel(text, ['Адреса']) || parseAddress(text);
      const floorInfo = parseFloor(fullText);
      const rooms = parseNumber(roomText);
      const cleanAddress = parseStructuredAddress(text) || parseCleanAddress(text) || address;
      const description = cleanDescription(parseDescription(elements));
      const descriptionAddress = extractAddressFromDescription(description);
      const safeSiteId = extractSiteId(detailText) || extractSiteId(text) || extractSiteId(fullText) || String(siteId || '').match(/[0-9]{4,}/)?.[0] || '';
      const safeReamakId = extractReamakId(detailText) || extractReamakId(text) || extractReamakId(fullText) || String(reamakId || '').match(/[0-9]+\/[0-9]+/)?.[0] || '';
      const safeSourceUrl = originalUrl || buildOriginalUrlFallback(siteName, safeSiteId);
      const sourcePublishedAt = extractDateAfterLabel(detailText, 'Час додавання на сайт:');
      const sourceUpdatedAt = extractDateAfterLabel(detailText, 'Час останнього оновлення:');
      const sourceLastScannedAt = extractDateAfterLabel(detailText, 'Час останнього сканування:') || new Date().toISOString();
      const finalAddress = rowData.address || cleanAddress || descriptionAddress;
      const finalRooms = rowData.rooms || rooms;
      const finalObjectType = rowData.objectType || objectType;

      return {
         source: 'reamak',
         sourceUrl: safeSourceUrl,
         reamakPageUrl: location.href,
         reamakId: safeReamakId,
         siteId: safeSiteId,
         siteName,
         title: buildReadableTitle({ rooms: finalRooms, objectType: finalObjectType, address: finalAddress }),
         objectType: finalObjectType,
         dealType: /оренда/i.test(fullText) ? 'Оренда' : /продаж/i.test(fullText) ? 'Продаж' : '',
         address: finalAddress,
         rooms: finalRooms,
         square: rowData.square || parseArea(fullText),
         floor: rowData.floor || floorInfo.floor,
         floors: rowData.floors || floorInfo.floors,
         price: rowData.price || parseUsdPrice(priceText),
         currency: (rowData.price || priceText) ? 'USD' : '',
         phone: rowData.phone || phone,
         contactKind: detectContactKind(fullText),
         description,
         sourcePublishedAt,
         sourceUpdatedAt,
         sourceLastScannedAt,
         images: collectImages(elements),
         attrs: {
            sourceLastScannedAt: new Date().toISOString(),
            reamak: {
               pageTitle: document.title,
               selectedText: clean(String(window.getSelection())),
               rawText: fullText.slice(0, 12000),
            },
         },
      };
   }

   function getToken() {
      let token = localStorage.getItem(TOKEN_KEY) || '';
      if (!token) {
         token = window.prompt('REAMAK import token для Karamax CRM (можна лишити пустим для тесту):', '') || '';
         if (token) localStorage.setItem(TOKEN_KEY, token);
      }
      return token;
   }

   async function send(payload) {
      const token = getToken();
      const response = await fetch(API_URL, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
         },
         body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
   }

   async function onClick(event) {
      if (!event.altKey) return;
      event.preventDefault();
      event.stopPropagation();

      const elements = findAdElements(event.target);
      elements.forEach((item) => item.classList.add('karamax-reamak-target'));
      panel('<b>Забираю об\'єкт...</b><br>Перевіряю дубль по REAMAK ID / ID сайту.');

      try {
         const payload = buildPayload(event.target);
         const data = await send(payload);
         const status = data.created ? 'Створено в базі парсингу' : data.duplicates ? 'Вже є в базі, оновив скан' : 'Готово';
         panel(`<b>${status}</b><br>Створено: ${data.created || 0}, дублікати: ${data.duplicates || 0}.<br>Alt+клік - забрати ще один.`);
      } catch (error) {
         panel(`<b>Не вийшло імпортувати</b><br>${clean(error.message)}<br>Alt+клік - спробувати ще раз.`);
      } finally {
         window.setTimeout(() => elements.forEach((item) => item.classList.remove('karamax-reamak-target')), 1500);
      }
   }

   function onMouseOver(event) {
      if (!event.altKey) return;
      const elements = findAdElements(event.target);
      window.__karamaxReamakHunter?.lastTargets?.forEach((item) => item.classList.remove('karamax-reamak-target'));
      elements.forEach((item) => item.classList.add('karamax-reamak-target'));
      window.__karamaxReamakHunter.lastTargets = elements;
   }

   function stop() {
      document.documentElement.classList.remove('karamax-reamak-hunter');
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mouseover', onMouseOver, true);
      document.getElementById(PANEL_ID)?.remove();
      window.__karamaxReamakHunter?.lastTarget?.classList.remove('karamax-reamak-target');
      window.__karamaxReamakHunter?.lastTargets?.forEach((item) => item.classList.remove('karamax-reamak-target'));
      window.__karamaxReamakHunter = null;
   }

   addStyle();
   document.documentElement.classList.add('karamax-reamak-hunter');
   document.addEventListener('click', onClick, true);
   document.addEventListener('mouseover', onMouseOver, true);
   window.__karamaxReamakHunter = { active: true, stop, lastTarget: null, lastTargets: [] };
   panel('<b>REAMAK Hunter увімкнено</b><br>Затисни Alt і клікни по картці/рядку об\'єкта. Повторний запуск bookmarklet вимикає режим.');
})();
