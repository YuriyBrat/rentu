// node scripts/test-unified-call.cjs — isolated checks; no database/network writes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const swc = require('next/dist/build/swc');
const phoneSource = fs.readFileSync('utils/crm/phone.js','utf8').replace(/export (const|function)/g,'$1');
const phoneUtils = vm.runInNewContext(phoneSource+'\n({normalizePhone,getPhoneValidation});');
const phoneIndexSource=fs.readFileSync('utils/crm/phoneIndex.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export (function|const)/g,'$1');
const phoneIndexUtils=vm.runInNewContext(phoneIndexSource+'\n({installPhoneIndex,ownerPhoneKeys});',{...phoneUtils});
const uncachedQuery=(_key,_ttl,read)=>read();
const marketSource=fs.readFileSync('utils/crm/parsingMarket.js','utf8').replace(/export (function|const)/g,'$1');
const marketUtils=vm.runInNewContext(marketSource+'\n({getParsingMarketState,buildParsingMarketPatch,parsingPropertySnapshot,PARSING_MARKET_REASONS});');

const pageSource = fs.readFileSync('app/(crm)/crm/parsing/page.jsx', 'utf8');
const submitSource = pageSource.slice(pageSource.indexOf('   const handleSubmitStatus = async () => {'), pageSource.indexOf('   const handleReserveInspection = async'));

function submission(overrides = {}, options = {}) {
   const state = { actions: [], patches: [], calls: new Map(), notes: 0, closed: false, error: '', failures: options.patchFailures || 0, lostResponse: options.lostResponse || false };
   const item = { _id: '507f1f77bcf86cd799439011', stage: 'raw', callQueue: { ownerKey: 'alice' } };
   const form = { status: 'base', callOutcome: 'reached', submissionId: randomUUID(), nextContactAt: '', communication: { type: 'call', text: 'Owner confirmed', tone: 'important' }, callCenter: {}, ...overrides };
   const context = vm.createContext({
      Date, console: { error() {} }, statusItem: item, statusForm: form,
      statusSavingRef: { current: false }, statusSavedContact: { current: null },
      workspace: { actor: { key: 'alice' }, notify() {}, async mutate(target, payload) {
         state.actions.push(payload);
         if (payload.action === 'outcome') {
            if (!state.calls.has(payload.submissionId)) state.calls.set(payload.submissionId, { _id: payload.submissionId, ...payload });
            if (state.lostResponse) { state.lostResponse = false; throw new Error('Response lost'); }
            return { communication: state.calls.get(payload.submissionId) };
         }
         return {};
      } },
      createCommunication: async () => { state.notes++; return { _id: 'note' }; },
      patchItem: async (target, patch) => { state.patches.push(patch); if (state.failures-- > 0) throw new Error('Save interrupted'); },
      setSavingStatus() {}, setStatusError: value => { state.error = value; },
      setCallFeedback: value => { state.feedback = value; },
      setStatusItem: value => { state.closed = value === null; }, setStatusForm() {}, load: async () => {},
      getParsingRequestError: error => error.message,
   });
   vm.runInContext(submitSource + '\nglobalThis.submit = handleSubmitStatus;', context);
   return { state, context, form, submit: context.submit };
}

async function testSubmission() {
   const attemptTime = new Date(Date.now() - 90000).toISOString();
   const missed = submission({ status: 'duplicate', duplicatePropertyId: '', callOutcome: 'no_answer', communication: { type: 'call', text: '', happenedAt: attemptTime }, nextContactAt: new Date(Date.now() + 3600000).toISOString() });
   await missed.submit();
   assert.equal(missed.state.calls.size, 1);
   assert.equal(missed.state.patches.length, 0, 'Missed call never changes stage or creates a Property');
   assert.equal(missed.state.notes, 0);
   assert.equal(missed.state.closed, true);
   const missPayload = missed.state.actions.find(action => action.action === 'outcome');
   assert.equal(missPayload.outcome, 'no_answer');
   assert.equal(missPayload.retainClaim, false);
   assert.ok(missPayload.nextContactAt);
   assert.equal(missPayload.happenedAt,attemptTime,'Missed-call timestamp is separate from the future callback');
   assert.equal(missed.state.feedback.queue,'callbacks');
   assert.ok(missed.state.feedback.message.includes('залишається в «Нових»'));

   const reached = submission({contactType:'owner',phone:'0971234567',leadname:'Олена',location_text:'Львів, вул. Наукова, 10, кв. 5'});
   await Promise.all([reached.submit(), reached.submit()]);
   assert.equal(reached.state.calls.size, 1, 'Double click creates one call');
   assert.equal(reached.state.patches.length, 1);
   assert.equal(reached.state.patches[0].action, 'moveToObjects');
   assert.equal(reached.state.patches[0].editableFields,true);
   assert.equal(reached.state.patches[0].contactType,'owner');
   assert.equal(reached.state.patches[0].phone,'0971234567');
   assert.equal(reached.state.patches[0].leadname,'Олена');
   assert.equal(reached.state.patches[0].location_text,'Львів, вул. Наукова, 10, кв. 5');
   assert.equal(reached.state.notes, 0, 'No second generic communication is created');
   assert.equal(reached.state.actions.find(action => action.action === 'outcome').retainClaim, true);
   assert.equal(reached.state.actions.find(action => action.action === 'outcome').tone, 'important');
   assert.ok(reached.state.actions.some(action => action.action === 'release'));

   const retry = submission({}, { patchFailures: 1 });
   await retry.submit();
   assert.equal(retry.state.closed, false);
   assert.equal(retry.state.calls.size, 1);
   await retry.submit();
   assert.equal(retry.state.closed, true);
   assert.equal(retry.state.calls.size, 1, 'Retry after decision failure reuses the recorded contact');
   assert.equal(retry.state.actions.filter(action => action.action === 'outcome').length, 1);

   const lost = submission({ callOutcome: 'no_answer' }, { lostResponse: true });
   await lost.submit();
   await lost.submit();
   assert.equal(lost.state.calls.size, 1, 'Response loss reuses the same submission id');
   assert.equal(lost.state.closed, true);
   assert.equal(lost.state.feedback.queue,'retry','Unscheduled missed call is explicitly discoverable outside the New queue');

   const past = submission({ callOutcome: 'no_answer', nextContactAt: '2020-01-01T10:00:00Z' });
   await past.submit();
   assert.equal(past.state.actions.length, 0);
   assert.ok(past.state.error);

   const note = submission({ communication: { type: 'note', text: 'Checked the source' } });
   await note.submit();
   assert.equal(note.state.notes, 1);
   assert.equal(note.state.calls.size, 0, 'Notes are not counted as phone calls');
   console.log('PASS: unified submission, missed-call scheduling, unchanged market status, double-click protection, decision retry and response-loss deduplication.');
}

async function testServer() {
   // Reuse only the existing in-memory database fixtures; do not run or change its test runner.
   const fixtureSource = fs.readFileSync('scripts/test-call-center.cjs', 'utf8');
   const module = { exports: {} };
   vm.runInNewContext(fixtureSource.slice(0, fixtureSource.indexOf('async function run()')) + '\nmodule.exports = { client, records, calls, id };', { require, module, console, structuredClone, Response, Date });
   const { client, records, calls, id } = module.exports;
   records.set(id, { _id: id, title: 'Property', stage: 'raw', callRequests: [] });
   const alice = client('alice');
   const bob = client('bob');
   assert.equal((await alice.post({ action: 'claim' })).status, 200);
   const payload = { action: 'outcome', retainClaim: true, submissionId: randomUUID(), outcome: 'reached', tone: 'important', text: 'Confirmed', happenedAt: new Date(Date.now() - 60000).toISOString() };
   assert.equal((await alice.post(payload)).status, 200);
   assert.equal(records.get(id).callQueue.ownerKey, 'alice', 'Claim remains during the decision update');
   assert.equal((await bob.post({ action: 'claim' })).status, 409);
   assert.equal((await alice.post(payload)).status, 200);
   assert.equal(calls.size, 1);
   assert.equal([...calls.values()][0].tone, 'important');
   assert.equal(new Date([...calls.values()][0].happenedAt).toISOString(), payload.happenedAt);
   await alice.post({ action: 'release' });
   await alice.post({ action: 'claim' });
   const attemptedAt = new Date(Date.now()-120000).toISOString();
   const missed = { action: 'outcome', submissionId: randomUUID(), outcome: 'no_answer', happenedAt:attemptedAt, nextContactAt: new Date(Date.now() + 3600000).toISOString() };
   assert.equal((await alice.post(missed)).status, 200);
   assert.equal((await alice.post(missed)).status, 200);
   assert.equal(calls.size, 2);
   assert.equal(records.get(id).stage, 'raw');
   assert.equal(records.get(id).callQueue.ownerKey, '');
   assert.equal(records.get(id).callQueue.lastOutcome, 'no_answer');
   assert.equal(new Date([...calls.values()].find(call=>call.meta.callCenter.outcome==='no_answer').happenedAt).toISOString(),attemptedAt);
   console.log('PASS: real workflow endpoint retains ownership for combined saves, records one communication per id, preserves tone/time and releases after a missed call.');
}

async function testCounter() {
   const source = fs.readFileSync('app/api/crm/parsing/route.js', 'utf8');
   const code = source.slice(source.indexOf('async function attachLastCommunications('), source.indexOf('function applyQualityFilter('));
   const events = [
      { type: 'call', happenedAt: '2026-11-03T09:12:00Z', meta: { callCenter: { outcome: 'no_answer' } } },
      { type: 'call', happenedAt: '2026-11-02T08:03:00Z', meta: { callCenter: { outcome: 'busy' } } },
      { type: 'call', meta: { callCenter: { outcome: 'reached' } } },
      { type: 'note', meta: { callCenter: { outcome: 'no_answer' } } },
      { type: 'call', meta: {} },
   ];
   const evaluate = (value, row) => {
      if (typeof value === 'string' && value.startsWith('$')) return value.slice(1).split('.').reduce((next, key) => next?.[key], row);
      if (Array.isArray(value)) return value.map(part => evaluate(part, row));
      if (!value || typeof value !== 'object') return value;
      if ('$eq' in value) { const [a,b] = evaluate(value.$eq,row); return a === b; }
      if ('$in' in value) { const [a,b] = evaluate(value.$in,row); return b.includes(a); }
      if ('$and' in value) return evaluate(value.$and,row).every(Boolean);
      if ('$cond' in value) return evaluate(value.$cond[0],row) ? evaluate(value.$cond[1],row) : evaluate(value.$cond[2],row);
      throw new Error('Unknown counter expression');
   };
   const context = vm.createContext({ Communication: { aggregate: async pipeline => {
      const group = pipeline.find(step => step.$group).$group;
      return [{
         _id: 'property', communicationCount: events.length,
         missedCallCount: events.reduce((count,row) => count + evaluate(group.missedCallCount.$sum,row),0),
         missedCallTimes: events.map(row => evaluate(group.missedCallTimes.$push,row)),
         hasSuccessfulCall: events.some(row => evaluate(group.hasSuccessfulCall.$max,row)),
      }];
   } } });
   vm.runInContext(code,context);
   const contacted = (await context.attachLastCommunications([{ _id: 'property' }]))[0];
   assert.equal(contacted.missedCallCount,2);
   assert.deepEqual(Array.from(contacted.missedCallTimes), ['2026-11-03T09:12:00Z', '2026-11-02T08:03:00Z'], 'Tooltip receives actual missed-call timestamps, excluding notes and other calls');
   assert.equal(contacted.hasSuccessfulCall,true,'First successful conversation hides the badge without deleting failed attempts');
   events.splice(2,1);
   events.push({ type:'sms',meta:{callCenter:{outcome:'reached'}} });
   assert.equal((await context.attachLastCommunications([{ _id: 'property' }]))[0].hasSuccessfulCall,false,'Notes and SMS do not confirm a phone conversation');
   console.log('PASS: failure history is preserved; successful calls confirm contact; notes and SMS do not.');
}

async function testNewQueue() {
   const helper = fs.readFileSync('utils/crm/callCenter.js','utf8').replace(/export (const|function)/g,'$1');
   const source = fs.readFileSync('app/api/crm/parsing/route.js','utf8');
   const summary = fs.readFileSync('app/api/crm/call-center/route.js','utf8');
   const addAndFilter = source.slice(source.indexOf('function addAndFilter('), source.indexOf('function buildSourceId('));
   const queueCode = source.slice(source.indexOf('      const filter = {};'), source.indexOf('      const now = new Date();',source.indexOf('      const filter = {};')));
   const now = new Date();
   const context = vm.createContext({Date,now,Response,sp:new URLSearchParams({callQueue:'new'}),getSessionUser:async()=>({user:{id:'alice'}})});
   vm.runInContext(helper+'\n'+addAndFilter+'\nglobalThis.getFilter = async () => {\n'+queueCode+'\nreturn filter;};', context);
   const listFilter = await context.getFilter();
   const start = summary.indexOf('new: [{ $match: ') + 'new: [{ $match: '.length;
   const end = summary.indexOf("} }, { $count: 'count' }],", start) + 1;
   const countFilter = vm.runInContext('('+summary.slice(start,end)+')',context);
   const read = (row,key) => key.split('.').reduce((value,part)=>value?.[part],row);
   const matches = (row,filter) => Object.entries(filter).every(([key,value])=>{
      if(key==='$and') return value.every(part=>matches(row,part));
      if(key==='$or') return value.some(part=>matches(row,part));
      const actual=read(row,key);
      if(value===null) return actual==null;
      if(value.$in) return value.$in.includes(actual);
      if(value.$lte) return actual!=null && actual<=value.$lte;
      throw new Error('Unexpected queue predicate');
   });
   const attempted = {stage:'raw',lastCallAt:now,callQueue:{lastHandledAt:now,lastOutcome:'no_answer'}};
   for(const row of [
      {stage:'raw'},
      attempted,
      {...attempted,callQueue:{...attempted.callQueue,lastOutcome:'busy'}},
      {...attempted,callQueue:{...attempted.callQueue,nextContactAt:new Date(now.getTime()+3600000)}},
   ]) {
      assert.ok(matches(row,listFilter),'Unprocessed cards remain in New after missed calls, including scheduled callbacks');
      assert.ok(matches(row,countFilter),'New counter includes the same missed cards as the list');
   }
   for(const lastOutcome of ['reached','callback','wrong_number','']) {
      const row = {...attempted,callQueue:{...attempted.callQueue,lastOutcome}};
      assert.ok(!matches(row,listFilter));
      assert.ok(!matches(row,countFilter));
   }
   assert.ok(!matches({...attempted,stage:'moved'},countFilter),'Processed market stages never return to New');
   assert.ok(!matches({...attempted,inspectionReservation:{expiresAt:new Date(now.getTime()+60000)}},countFilter),'Active viewing reservations remain excluded');
   console.log('PASS: real list and counter predicates retain missed calls in New, including scheduled callbacks and existing saved attempts.');
}

async function testExistingPropertyDecision() {
   const helper = fs.readFileSync('utils/crm/callCenter.js','utf8').replace(/export (const|function)/g,'$1');
   const route = fs.readFileSync('app/api/crm/parsing/[id]/route.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export const /g,'const ');
   const property = { _id:'507f1f77bcf86cd799439012',actualityGroup:'active',crmStage:'base' };
   const item = { _id:'507f1f77bcf86cd799439011',stage:'moved',sourceId:'source:1',propertyId:property._id,callQueue:{ownerKey:'alice',expiresAt:new Date(Date.now()+60000)},async save(){} };
   let creates = 0;
   const context = vm.createContext({
      ...phoneUtils,...marketUtils,
      Date,Response,console,randomUUID,connectDB:async()=>{},
      getSessionUser:async()=>({user:{id:'alice',name:'Alice'},userId:'alice',role:'callcenter'}),
      LeadProperty:{findById:async()=>item},
      Property:{findById:async()=>property,findByIdAndUpdate:async(id,update)=>{assert.equal(String(id),property._id);Object.assign(property,update.$set);return property;},create:async()=>{creates++;throw new Error('Duplicate property');}},
      pickActivitySnapshot:value=>({stage:value.stage,propertyId:value.propertyId}),buildActivityDiff:()=>[],logActivity:async()=>{},
   });
   vm.runInContext(helper+'\n'+route+'\nglobalThis.patch = PATCH;',context);
   const call = async body=>context.patch({json:async()=>body},{params:{id:item._id}});
   assert.equal((await call({action:'moveToObjects',actualityGroup:'inactive',marketReason:'removed'})).status,200);
   assert.equal(property.actualityGroup,'inactive');
   assert.equal(item.reviewStatus,'not_actual');
   assert.equal(property.actualityStatus,'Неактуальний. Знятий з реалізації');
   const soldResponse=await call({action:'moveToObjects',actualityGroup:'inactive',marketReason:'sold_owner'});
   assert.equal(soldResponse.status,200);
   const soldItem=(await soldResponse.json()).item;
   assert.equal(soldItem.propertyId.actualityNote,'sold_owner');
   assert.equal(marketUtils.getParsingMarketState(soldItem).label,'Проданий власником');
   assert.equal(property.actualityStatus,'Неактуальний. Реалізований не мною');
   assert.ok(property.inactiveAt);
   assert.equal(property.inactiveNote,'Проданий власником');
   const pausedResponse=await call({action:'moveToObjects',actualityGroup:'paused',marketReason:'deposit'});
   assert.equal(pausedResponse.status,200);
   assert.equal(marketUtils.getParsingMarketState((await pausedResponse.json()).item).label,'Завдаток');
   assert.equal(property.actualityStatus,'Зупинений. Завдаток не мій');
   item.callCenter = {verifiedAddressText:'Стара точна адреса'};
   assert.equal((await call({action:'moveToObjects',actualityGroup:'active',editableFields:true,location_text:'Уточнена адреса'})).status,200);
   assert.equal(property.actualityGroup,'active');
   assert.equal(item.location_text,'Уточнена адреса');
   assert.equal(property.location_text,'Уточнена адреса','Existing Base property receives the same corrected address');
   assert.equal(item.callCenter.verifiedAddressText,undefined,'The legacy address is removed when the canonical address is saved');
   assert.equal(property.crmStage,'base');
   assert.equal(creates,0);
   item.callQueue.ownerKey='bob';
   assert.equal((await call({action:'moveToObjects',actualityGroup:'inactive'})).status,409);
   assert.equal(property.actualityGroup,'active');
   console.log('PASS: existing Base property actuality changes without duplicating or changing its CRM stage; another operator is blocked.');
}

async function testContactTransfer() {
   const mongoose = require('mongoose');
   const modelSource = fs.readFileSync('models/LeadProperty.js','utf8').replace(/^import .*;\r?\n/gm,'').replace('export default LeadProperty;','globalThis.LeadProperty = LeadProperty;');
   const modelContext = vm.createContext({...phoneIndexUtils,Schema:mongoose.Schema,model:mongoose.model,models:mongoose.models});
   vm.runInContext(modelSource,modelContext);
   const item = modelContext.LeadProperty.hydrate({_id:new mongoose.Types.ObjectId(),stage:'raw',sourceId:'source:contact',phone:'old phone',location_text:'Приблизна адреса',callCenter:{verifiedAddressText:'Стара точна адреса'},attrs:{contactType:'unknown',sourceMarker:'keep'}});
   let savedContactType;
   item.save = async () => {
      assert.ok(item.isModified('attrs'),'Mongoose Mixed contact type is marked for persistence');
      savedContactType = item.attrs.contactType;
   };
   let createdProperty;
   const helper = fs.readFileSync('utils/crm/callCenter.js','utf8').replace(/export (const|function)/g,'$1');
   const route = fs.readFileSync('app/api/crm/parsing/[id]/route.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export const /g,'const ');
   const context = vm.createContext({...phoneUtils,...marketUtils,Date,Response,console,randomUUID,connectDB:async()=>{},
      getSessionUser:async()=>({user:{id:'alice'},userId:'alice',role:'callcenter'}),
      LeadProperty:{findById:()=>({then:resolve=>Promise.resolve(item).then(resolve),populate(){return this;},lean:async()=>item})},
      Property:{create:async data=>{createdProperty={...data,_id:new mongoose.Types.ObjectId()};return createdProperty;}},
      buildPhoneIntelMap:async()=>({}),attachPhoneIntel:items=>items,
      pickActivitySnapshot:()=>({}),buildActivityDiff:()=>[],logActivity:async()=>{},
   });
   vm.runInContext(helper+'\n'+route+'\nglobalThis.patch = PATCH;',context);
   const response = await context.patch({json:async()=>({action:'moveToObjects',actualityGroup:'active',editableFields:true,contactType:'owner',phone:' 8 (097) 123-45-67 ',leadname:' Олена ',location_text:' Львів, вул. Наукова, 10, кв. 5 ',callCenter:{inspectionLoyalty:'yes'}})},{params:{id:String(item._id)}});
   assert.equal(response.status,200);
   assert.equal(item.phone,'0971234567');
   assert.equal(item.leadname,'Олена');
   assert.equal(savedContactType,'owner');
   assert.equal(item.attrs.sourceMarker,'keep','Imported metadata is preserved');
   assert.equal(createdProperty.owners[0].name,'Олена');
   assert.equal(createdProperty.owners[0].phones[0],'0971234567','New Base property receives the edited contact in the same save');
   assert.equal(item.location_text,'Львів, вул. Наукова, 10, кв. 5');
   assert.equal(createdProperty.location_text,item.location_text,'New Base property receives the corrected main address');
   assert.equal(item.callCenter.verifiedAddressText,undefined);
   item.callCenter.verifiedAddressText='Застаріла окрема адреса';
   const edited = await context.patch({json:async()=>({editableFields:true,location_text:'Адреса з редагування'})},{params:{id:String(item._id)}});
   assert.equal(edited.status,200);
   assert.equal(item.location_text,'Адреса з редагування','General editing changes the same address');
   assert.equal(item.callCenter.verifiedAddressText,undefined);
   const legacy = await context.patch({json:async()=>({callCenter:{verifiedAddressText:'Уточнення зі старої форми'}})},{params:{id:String(item._id)}});
   assert.equal(legacy.status,200);
   assert.equal(item.location_text,'Уточнення зі старої форми','Previously opened forms still save into the main address');
   assert.equal(item.callCenter.verifiedAddressText,undefined);
   item.propertyId=undefined;
   item.stage='raw';
   const firstInactive=await context.patch({json:async()=>({action:'moveToObjects',actualityGroup:'inactive',marketReason:'sold_owner'})},{params:{id:String(item._id)}});
   assert.equal(firstInactive.status,200);
   const firstItem=(await firstInactive.json()).item;
   assert.equal(createdProperty.actualityGroup,'inactive');
   assert.equal(createdProperty.actualityStatus,'Неактуальний. Реалізований не мною','First contact does not leave the Property defaulted to Active');
   assert.equal(marketUtils.getParsingMarketState(firstItem).label,'Проданий власником');
   console.log('PASS: real PATCH saves contact fields, marks Mixed metadata for persistence and transfers the updated owner into Base.');
}

async function testInspectionReport() {
   const {Types} = require('mongoose');
   const fixedNow = new Date('2026-11-04T12:00:00Z');
   class TestDate extends Date {
      constructor(...args) { super(...(args.length ? args : [fixedNow])); }
      static now() { return +fixedNow; }
   }
   const event = (entityId,overrides={}) => ({entityType:'leadProperty',entityId,createdAt:fixedNow,actorUserId:'alice',after:{propertyId:entityId},diff:[{field:'callCenter.inspectionLoyalty',before:'unknown',after:'yes'}],...overrides});
   const events = [
      event('a'),event('a'),event('another-import',{after:{propertyId:'a'}}),event('b'),
      event('other-user',{actorUserId:'bob'}),
      event('earlier',{createdAt:new Date('2026-11-01T12:00:00Z')}),
      event('unchanged',{diff:[{field:'callCenter.inspectionLoyalty',before:'yes',after:'yes'}]}),
      event('maybe',{diff:[{field:'callCenter.inspectionLoyalty',before:'unknown',after:'maybe'}]}),
      event('future',{createdAt:new Date('2026-11-05T12:00:00Z')}),
   ];
   const read = (row,key)=>key.split('.').reduce((value,part)=>value?.[part],row);
   const matches = (row,filter)=>Object.entries(filter).every(([key,value])=>{
      const actual=read(row,key);
      if(value===null) return actual==null;
      if(typeof value!=='object') return actual===value;
      if('$elemMatch' in value) return (actual||[]).some(part=>matches(part,value.$elemMatch));
      return Object.entries(value).every(([operator,expected])=>{
         if(operator==='$ne') return actual!==expected;
         if(operator==='$gte') return actual>=expected;
         if(operator==='$lte') return actual<=expected;
         throw new Error('Unexpected report predicate '+operator);
      });
   });
   const chain = value=>({sort(){return this;},limit(){return this;},select(){return this;},lean:async()=>value});
   const helper = fs.readFileSync('utils/crm/callCenter.js','utf8').replace(/export (const|function)/g,'$1');
   const route = fs.readFileSync('app/api/crm/call-center/route.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export (const|async function)/g,'$1');
   const context = vm.createContext({Date:TestDate,Intl,Types,Response,console,cachedCRMQuery:uncachedQuery,connectDB:async()=>{},
      getSessionUser:async()=>({user:{id:'alice'},userId:'alice',role:'callcenter'}),
      LeadProperty:{collection:{name:'leadproperties'},findOne:()=>chain(null),aggregate:async()=>[{}]},
      Communication:{findOne:()=>chain(null),find:()=>chain([]),aggregate:async()=>[]},
      CRMActivityLog:{findOne:()=>chain(null),aggregate:async pipeline=>{
         const rows=events.filter(row=>matches(row,pipeline[0].$match));
         const group=pipeline[1].$group._id;
         const keys=rows.map(row=>typeof group==='string'?read(row,group.slice(1)):group.$ifNull.map(path=>read(row,path.slice(1))).find(value=>value!=null));
         return [...new Set(keys)].map(_id=>({_id}));
      }},
   });
   vm.runInContext(helper+'\n'+route+'\nglobalThis.getSummary = GET;',context);
   const today = await (await context.getSummary({nextUrl:new URL('http://localhost/api/crm/call-center?days=1')})).json();
   assert.equal(today.stats.inspectionReady,2,'Report counts unique objects for the current operator and period, including duplicate imports only once');
   const week = await (await context.getSummary({nextUrl:new URL('http://localhost/api/crm/call-center?days=7')})).json();
   assert.equal(week.stats.inspectionReady,3,'Changing report period includes earlier successful inspection outcomes');
   console.log('PASS: real summary counts inspection readiness per operator and period, excluding duplicate saves, other operators, unchanged values and future events.');
}

async function testInterface() {
   const buttons = [];
   const tooltips = [];
   const iconButtons = [];
   const textFields = [];
   const typography = [];
   const material = new Proxy({}, { get(target, name) {
      if (name === '__esModule') return false;
      return props => {
         if (name === 'Button') buttons.push(props);
         if (name === 'Tooltip') tooltips.push(props);
         if (name === 'IconButton') iconButtons.push(props);
         if (name === 'TextField') textFields.push(props);
         if (name === 'Typography') typography.push(props);
         if (name === 'Dialog' && !props.open) return null;
         if (name === 'TextField') return React.createElement('label', null, props.label, React.createElement('input', { value: props.value || '', readOnly: true, disabled: props.disabled }));
         return React.createElement('div', null, props.children);
      };
   } });
   const theme = { text: '#fff', textSoft: '#aaa', border: '#333', accent: '#80f', accentLight: '#a8f', hover: '#222', bgPanel: '#111' };
   const common = {
      '@mui/material': material,
      '@/utils/crm/phone': phoneUtils,
      '@/utils/crm/parsingMarket': marketUtils,
      '@/app/(crm)/crm/context/CRMThemeContext': { useCRMTheme: () => ({ theme, mode: 'dark' }) },
      '../context/CRMThemeContext': { useCRMTheme: () => ({ theme, mode: 'dark' }) },
      '@/crm_components/communications/communicationMeta': { COMMUNICATION_TYPE_OPTIONS: [{value:'call',label:'Call'}], COMMUNICATION_TONE_OPTIONS: [{value:'info',label:'Info'}], toDatetimeLocal: () => '2026-11-02T12:00' },
      './ParsingRowCard': { getParsingStageKey: () => 'raw', isInspectionReservationActive: () => false },
      '@/crm_components/ImageLightbox': { __esModule: true, default: () => null },
      recharts: {},
   };
   async function load(filename, stubs = {}) {
      const result = await swc.transform(fs.readFileSync(filename,'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: filename.endsWith('.jsx') }, target:'es2020', transform:{react:{runtime:'automatic'}} }, module:{type:'commonjs'} });
      const module = { exports:{} };
      vm.runInNewContext(result.code, { module, exports:module.exports, Date, Intl, console, require: name => {
         if (name.startsWith('@mui/icons-material/')) return { __esModule:true, default:()=>null };
         return stubs[name] || common[name] || require(name);
      } });
      return module.exports;
   }
   const status = await load('app/(crm)/crm/parsing/ParsingStatusDialog.jsx');
   let changedForm;
   const props = { open:true,item:{stage:'raw'},form:status.buildInitialStatusForm({stage:'raw'}),theme,mode:'dark',onChange:value=>{changedForm=value;} };
   const regular = renderToStaticMarkup(React.createElement(status.default,props));
   assert.ok(regular.includes('Опис') && regular.includes('Статус') && regular.includes('Технічка продзвону'));
   assert.ok(regular.includes('Тип контакту') && regular.includes('Телефон') && regular.includes('Ім’я'));
   const prefilled = status.buildInitialStatusForm({stage:'raw',phone:'0971234567',leadname:'Олена',attrs:{contactType:'owner'}});
   assert.equal(prefilled.phone,'0971234567');
   assert.equal(prefilled.leadname,'Олена');
   assert.equal(prefilled.contactType,'owner');
   assert.equal(status.buildInitialStatusForm({location_text:'Адреса з парсингу'}).location_text,'Адреса з парсингу');
   assert.equal(status.buildInitialStatusForm({location_text:'Адреса з парсингу',callCenter:{verifiedAddressText:'Уточнена раніше адреса'}}).location_text,'Уточнена раніше адреса','Earlier verified addresses are preserved when opening the unified field');
   const editCode=pageSource.slice(pageSource.indexOf('function buildEditForm('),pageSource.indexOf('function getParsingRequestError('));
   const editContext=vm.createContext({toDatetimeLocalInput:()=>''});
   vm.runInContext(editCode,editContext);
   assert.equal(editContext.buildEditForm({location_text:'Єдина адреса'}).location_text,'Єдина адреса');
   assert.equal(editContext.buildEditForm({location_text:'Неточна',callCenter:{verifiedAddressText:'Раніше уточнена'}}).location_text,'Раніше уточнена');
   assert.equal(status.buildInitialStatusForm({reviewStatus:'actual'}).contactType,'unknown');
   assert.equal(status.buildInitialStatusForm({reviewStatus:'realtor'}).contactType,'realtor');
   assert.equal(status.buildInitialStatusForm({stage:'moved',propertyId:{actualityGroup:'paused'}}).status,'paused');
   assert.equal(status.buildInitialStatusForm({stage:'moved',propertyId:{actualityGroup:'inactive',actualityNote:'sold_owner'}}).marketReason,'sold_owner');
   assert.equal(status.buildInitialStatusForm({stage:'moved',propertyId:{actualityGroup:'paused',actualityNote:'deposit'}}).marketReason,'deposit');
   assert.match(props.form.submissionId,/^[a-zA-Z0-9-]{16,80}$/);
   buttons.find(button=>button.children==='Недодзвін').onClick();
   assert.equal(changedForm.callOutcome,'no_answer');
   assert.equal(changedForm.communication.happenedAt,'2026-11-02T12:00','Selecting missed-call mode autofills the current local time');
   assert.equal(changedForm.nextContactAt,'','Current attempt does not create an immediate callback');
   const missed = renderToStaticMarkup(React.createElement(status.default,{...props,form:{...props.form,callOutcome:'no_answer'}}));
   assert.ok(missed.includes('Дата й час недодзвону'));
   assert.ok(!missed.includes('Коли передзвонити'),'Callback scheduling is optional and initially collapsed');
   const scheduled = renderToStaticMarkup(React.createElement(status.default,{...props,form:{...props.form,callOutcome:'no_answer',scheduleFollowup:true}}));
   assert.ok(scheduled.includes('Коли передзвонити'));
   assert.ok(!missed.includes('Опис') && !missed.includes('Технічка продзвону') && !missed.includes('Причина неактуальності'));
   renderToStaticMarkup(React.createElement(status.default,{...props,form:{...props.form,phone:'12345'}}));
   const invalidPhoneField=textFields.filter(field=>field.label==='Телефон').at(-1);
   assert.equal(invalidPhoneField.error,true);
   assert.ok(invalidPhoneField.helperText.includes('5 із 10'));
   renderToStaticMarkup(React.createElement(status.default,{...props,form:{...props.form,phone:'971234567'}}));
   const shortPhoneField=textFields.filter(field=>field.label==='Телефон').at(-1);
   assert.equal(shortPhoneField.error,false,'Nine digits without a leading zero can be repaired');
   shortPhoneField.onBlur();
   assert.equal(changedForm.phone,'0971234567');
   const helper = await load('utils/crm/callCenter.js');
   const workspace = await load('app/(crm)/crm/parsing/CallCenterWorkspace.jsx',{'@/utils/crm/callCenter':helper});
   const row = await load('app/(crm)/crm/parsing/ParsingRowCard.jsx',{'./CallCenterWorkspace':workspace});
   const missedTimes = ['2026-11-03T09:12:00Z', '2026-11-02T08:03:00Z'];
   const item = {_id:'property',stage:'raw',lastCommunicationAt:new Date().toISOString(),missedCallCount:3,missedCallTimes:missedTimes,callQueue:{ownerKey:'alice',ownerName:'Alice',expiresAt:new Date(Date.now()+60000)}};
   let opens = 0;
   buttons.length = 0;
   iconButtons.length = 0;
   tooltips.length = 0;
   const html = renderToStaticMarkup(React.createElement(row.default,{item,onStatus:()=>{opens++;},workspace:{actor:{key:'alice',role:'callcenter'}}}));
   assert.ok(html.includes('н.д. 3'));
   assert.equal(iconButtons[0].sx.color,'#f59e0b','A recent missed call does not turn the communication clock green');
   const missedTooltip = tooltips.find(tooltip=>React.isValidElement(tooltip.title));
   const tooltipHtml = renderToStaticMarkup(missedTooltip.title);
   for(const time of missedTimes) {
      const expected = new Date(time).toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
      assert.ok(tooltipHtml.includes(expected),'Hover tooltip displays the actual attempt date and time');
   }
   const entrypoints = buttons.filter(button => button.children === 'Нові' || button.children === 'Результат дзвінка');
   assert.equal(entrypoints.length,2);
   entrypoints.forEach(button=>button.onClick());
   assert.equal(opens,2,'Status and call-result buttons use the same opening handler');
   item.hasSuccessfulCall = true;
   item.missedCallCount = 4;
   iconButtons.length = 0;
   const contactedHtml = renderToStaticMarkup(React.createElement(row.default,{item,workspace:{actor:{key:'alice',role:'callcenter'}}}));
   assert.ok(!contactedHtml.includes('н.д. 4'),'Badge stays hidden after first contact even when later attempts fail');
   assert.equal(iconButtons[0].sx.color,'#22c55e','Normal clock recency colors return after first successful contact');
   renderToStaticMarkup(React.createElement(row.default,{item:{...item,phone:'12345'},workspace:{actor:{key:'alice',role:'callcenter'}}}));
   assert.equal(typography.find(props=>props.children==='12345').sx.color,'#ef4444','Invalid card phone is highlighted red');
   const soldItem={...item,stage:'moved',propertyId:{actualityGroup:'inactive',actualityNote:'sold_owner',crmStage:'base'}};
   assert.equal(row.getParsingStageKey(soldItem),'inactive');
   const soldHtml=renderToStaticMarkup(React.createElement(row.default,{item:soldItem}));
   assert.ok(soldHtml.includes('Проданий власником'),'Sold-by-owner result is visible on the actual card');
   const depositItem={...item,stage:'moved',propertyId:{actualityGroup:'paused',actualityNote:'deposit',crmStage:'base'},callCenter:{inspectionLoyalty:'yes'}};
   assert.equal(row.getParsingStageKey(depositItem),'paused','Paused status overrides earlier readiness for viewing');
   assert.ok(renderToStaticMarkup(React.createElement(row.default,{item:depositItem})).includes('Завдаток'));
   console.log('PASS: shared entrypoints, complete conversation form, minimal missed-call mode and rendered n.d. counter.');
}

async function testPhoneValidation() {
   const variants=['0971234567','971234567','+38 (097) 123-45-67','38 097 123 45 67','8 (097) 123-45-67','38 971234567'];
   for(const value of variants) {
      const phone=phoneUtils.getPhoneValidation(value);
      assert.equal(phone.normalized,'0971234567',value);
      assert.equal(phone.isValid,true,value);
   }
   for(const value of ['', '12345', '097123456', '+38097123456', '09712345678', '0971234567,0677654321','0000000000']) {
      assert.equal(phoneUtils.getPhoneValidation(value).isValid,false,'Invalid or ambiguous phone: '+value);
   }
   const leadRows=[{_id:'a',phone:variants[2],attrs:{contactType:'owner'}},{_id:'b',phone:variants[4]},{_id:'c',phone:variants[1]},{_id:'d',phone:'12345',attrs:{contactType:'owner'}},{_id:'e',phone:'12345'}];
   const propertyRows=[{_id:'property',owners:[{phones:[variants[0]]}]}];
   const query=rows=>({select(){return this;},lean:async()=>rows});
   const source=fs.readFileSync('utils/crm/phoneIntel.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export \{ normalizePhone \} from .*;\r?\n/gm,'').replace(/export (async function|function)/g,'$1');
   const context=vm.createContext({...phoneUtils,...phoneIndexUtils,cachedCRMQuery:uncachedQuery,LeadProperty:{find:()=>query(leadRows)},Property:{find:()=>query(propertyRows)}});
   vm.runInContext(source,context);
   vm.runInContext('ensurePhoneIndexes = async()=>{}; getPhoneRevision = async()=>"test";',context);
   const map=await context.buildPhoneIntelMap(leadRows);
   const rows=context.attachPhoneIntel(leadRows,map);
   assert.equal(rows[0].phoneCount,4,'Equivalent formats match across Parsing and Objects');
   assert.equal(rows[1].phoneCount,4);
   assert.equal(rows[3].phoneCount,0,'Identical malformed phones never create false matches');
   assert.equal(rows[4].phoneIntel,null);
   assert.ok((await context.getPhoneContactIds('owner')).includes('d'),'Manual contact classification remains available for filtering');
   const route=fs.readFileSync('app/api/crm/parsing/route.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export (const|async function)/g,'$1');
   const apiContext=vm.createContext({...phoneUtils,randomUUID,Date});
   vm.runInContext(route,apiContext);
   const doc=apiContext.buildLeadPropertyData({sourceId:'test',phone:variants[2]});
   assert.equal(doc.phone,'0971234567');
   assert.equal(doc.attrs.phoneNormalized,'0971234567');
   const invalidDoc=apiContext.buildLeadPropertyData({sourceId:'test',phone:'12345'});
   assert.equal(invalidDoc.phone,'12345','Malformed source values remain visible for correction');
   assert.equal(invalidDoc.attrs.phoneNormalized,'');
   const reamak=fs.readFileSync('app/api/crm/integrations/reamak/import/route.js','utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/export (async function|function|const)/g,'$1');
   const reamakContext=vm.createContext({...phoneUtils,Date});
   vm.runInContext(reamak,reamakContext);
   assert.equal(reamakContext.normalizeItem({sourceId:'test',phone:variants[4]}).phone,'0971234567');
   assert.equal(reamakContext.normalizeItem({sourceId:'test',phone:'12345'}).attrs.phoneNormalized,'');
   const dimria=fs.readFileSync('app/api/crm/integrations/dimria/import/route.js','utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/export (async function|function|const)/g,'$1');
   const dimriaContext=vm.createContext({...phoneUtils,Date,fetchDimriaAdvert:async id=>({phone:id}),mapDimriaAdvertToLeadProperty:value=>value});
   vm.runInContext(dimria,dimriaContext);
   const imported=await dimriaContext.fetchLeadItems([variants[2],'12345']);
   assert.equal(imported.errors.length,0);
   assert.equal(imported.items[0].phone,'0971234567');
   assert.equal(imported.items[1].attrs.phoneNormalized,'');
   console.log('PASS: phone cleanup, prefix handling, nine-digit repair, format errors, API storage and false-match protection.');
}

(async()=>{ await testPhoneValidation(); await testSubmission(); await testServer(); await testCounter(); await testNewQueue(); await testExistingPropertyDecision(); await testContactTransfer(); await testInspectionReport(); await testInterface(); })().catch(error=>{console.error(error);process.exitCode=1;});
