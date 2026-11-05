import test from 'node:test';
import assert from 'node:assert/strict';
import { selectShareImages } from '../utils/crm/shareImages.mjs';

const stages = ['draft', 'processed', 'branded'];
const photo = (stage, extra = {}) => ({ stage, url: `https://photos.test/${stage}.jpg`, ...extra });
const urls = result => result.map(image => image.url);

test('every folder combination selects one group, with processed preferred for clients and partners', () => {
   for (let mask = 0; mask < 8; mask++) {
      const images = stages.filter((_, index) => mask & (1 << index)).map(stage => photo(stage));
      for (const type of ['client', 'partner']) {
         const priorities = type === 'partner' ? ['processed', 'draft'] : ['processed', 'branded', 'draft'];
         const expected = priorities.find(stage => images.some(image => image.stage === stage));
         assert.deepEqual(urls(selectShareImages(images, { type, useBrandedPhotos: true })), expected ? [`https://photos.test/${expected}.jpg`] : [], `${type}: folders ${mask}`);
      }
   }
});

test('partner links never fall back to the branded folder, even when it also has ordinary URL fields', () => {
   const image = photo('branded', { processedUrl: 'https://photos.test/copy.jpg', variants: { full: 'https://photos.test/full.jpg' } });
   assert.deepEqual(selectShareImages([image], { type: 'partner', useBrandedPhotos: true }), []);
});

test('unbranded folders never select branded URL variants or return them in the payload', () => {
   const image = photo('processed', { processedUrl: 'https://photos.test/clean.jpg', brandedUrl: 'https://photos.test/logo.jpg', variants: { branded: 'https://photos.test/variant-logo.jpg' }, privateField: 'not public' });
   for (const type of ['client', 'partner']) {
      const result = selectShareImages([image], { type });
      assert.deepEqual(urls(result), ['https://photos.test/clean.jpg']);
      assert.ok(!JSON.stringify(result).includes('logo'));
      assert.ok(!JSON.stringify(result).includes('privateField'));
   }
   assert.deepEqual(selectShareImages([photo('draft', { brandedUrl: 'https://photos.test/draft.jpg' })], { type: 'partner' }), []);
});

test('hidden and unusable preferred photos do not prevent fallback to an available group', () => {
   const images = [null, 'invalid', photo('processed', { isHidden: true }), photo('processed', { url: ' ' }), photo('branded'), photo('draft')];
   assert.deepEqual(urls(selectShareImages(images, { type: 'client' })), ['https://photos.test/branded.jpg']);
   assert.deepEqual(urls(selectShareImages(images, { type: 'partner' })), ['https://photos.test/draft.jpg']);
   for (const value of [null, undefined, {}, []]) assert.deepEqual(selectShareImages(value), []);
});

test('selected group retains its order and public metadata without mutating source records', () => {
   const images = Object.freeze([
      Object.freeze(photo('processed', { url: 'second.jpg', sortOrder: 20, width: 1200, height: 800 })),
      Object.freeze(photo('draft', { isMain: true, sortOrder: 0 })),
      Object.freeze(photo('processed', { url: 'first.jpg', sortOrder: 10, isMain: true })),
   ]);
   const result = selectShareImages(images, { type: 'client' });
   assert.deepEqual(urls(result), ['first.jpg', 'second.jpg']);
   assert.equal(result[0].isMain, true);
   assert.equal(result[1].width, 1200);
   assert.equal(result[1].height, 800);
   assert.equal(images[0].url, 'second.jpg');
});

test('legacy photos without a stage remain usable while known branded-only legacy photos stay out of partner links', () => {
   assert.deepEqual(urls(selectShareImages([{ url: 'original.jpg' }], { type: 'partner' })), ['original.jpg']);
   const images = [{ processedUrl: 'clean.jpg' }, { brandedUrl: 'logo.jpg' }, { url: 'original.jpg' }];
   assert.deepEqual(urls(selectShareImages(images, { type: 'client' })), ['clean.jpg']);
   assert.deepEqual(selectShareImages([{ brandedUrl: 'logo.jpg', url: 'logo.jpg' }], { type: 'partner' }), []);
});
