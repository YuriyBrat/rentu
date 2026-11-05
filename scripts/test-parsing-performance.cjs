// Offline integration checks: node scripts/test-parsing-performance.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
let clock = +new Date('2026-11-05T12:00:00Z');
class TestDate extends Date {
   constructor(...args) { super(...(args.length ? args : [clock])); }
   static now() { return clock; }
}
const read = (row, path) => path.split('.').reduce((value, part) => Array.isArray(value)
   ? value.flatMap(item => item?.[part] ?? []) : value?.[part], row);
const matches = (row, filter) => Object.entries(filter).every(([key, value]) => {
   if (key === '$or') return value.some(part => matches(row, part));
   if (key === '$and') return value.every(part => matches(row, part));
   const actual = read(row, key);
   if (typeof value?.toHexString === 'function') return String(actual) === String(value);
   if (value && typeof value === 'object' && '$regex' in value) return new RegExp(value.$regex,value.$options || '').test(String(actual ?? ''));
   if (value === null) return actual == null;
   if (typeof value !== 'object' || value instanceof Date) return String(actual) === String(value);
   return Object.entries(value).every(([operator, expected]) => {
      if (operator === '$in') return (Array.isArray(actual) ? actual.flat() : [actual]).some(a => expected.some(b => typeof b?.test === 'function' ? b.test(a || '') : String(a) === String(b)));
      if (operator === '$ne') return expected === null ? actual != null : actual !== expected;
      if (operator === '$nin') return !expected.includes(actual);
      if (operator === '$exists') return (actual !== undefined) === expected;
      if (operator === '$gt') return actual > expected;
      if (operator === '$lte') return actual != null && actual <= expected;
      throw new Error('Unexpected predicate ' + operator);
   });
});
const leads = Array.from({length:2000}, (_,i) => ({
   _id:i+1, phone:i<12?'0971234567':`067${String(1000000+i)}`, source:'olx',
   title:`Listing ${i}`, stage:i%20===19?'fake':'raw', importedAt:new Date(clock-i*1000), updatedAt:new Date(clock-5000), phoneIntelUpdatedAt:new Date(clock-5000),
   attrs:{phoneIndexVersion:1,phoneNormalized:i<12?'0971234567':`067${String(1000000+i)}`,contactType:i<12?'owner':'unknown'},
}));
leads.push({_id:2001,phone:'+38 (066) 123-45-67',source:'olx',stage:'raw',updatedAt:new Date(clock-5000),attrs:{sourceMarker:'keep'}});
const properties = [{_id:3000,owners:[{name:'Owner',phones:['+38 (097) 123-45-67']}],updatedAt:new Date(clock-5000),crmStage:'base'}];
const metrics={filteredLeadReads:0,filteredPropertyReads:0,returnedLeadRows:0,backfills:0};

function query(rows, filter, property, single = false) {
   const state={sort:null,skip:0,limit:Infinity,select:''};
   return {
      select(value){state.select=value;return this;},sort(value){state.sort=value;return this;},
      skip(value){state.skip=value;return this;},limit(value){state.limit=value;return this;},populate(){return this;},
      async lean(){
         let result=rows.filter(row=>matches(row,filter));
         if(state.sort) result=result.slice().sort((a,b)=>{for(const [key,direction] of Object.entries(state.sort)){const av=read(a,key),bv=read(b,key);if(av>bv)return direction;if(av<bv)return -direction;}return 0;});
         result=result.slice(state.skip,state.skip+state.limit);
         if (filter.$or?.some(part=>part.phoneKeys || part['attrs.phoneNormalized'])) {
            metrics[property?'filteredPropertyReads':'filteredLeadReads']++;
            if(!property) metrics.returnedLeadRows+=result.length;
         }
         return single ? result[0] || null : result;
      },
   };
}
function evaluate(expression, row) {
   if(typeof expression==='string' && expression.startsWith('$'))return read(row,expression.slice(1));
   if(Array.isArray(expression))return expression.map(value=>evaluate(value,row));
   if(expression==null || typeof expression!=='object' || expression instanceof Date)return expression;
   if(expression.$switch){for(const branch of expression.$switch.branches)if(evaluate(branch.case,row))return evaluate(branch.then,row);return evaluate(expression.$switch.default,row);}
   if(expression.$eq){const [a,b]=evaluate(expression.$eq,row);return a===b;}
   if(expression.$gt){const [a,b]=evaluate(expression.$gt,row);return a>b;}
   if(expression.$in){const [a,b]=evaluate(expression.$in,row);return b.includes(a);}
   if(expression.$and)return expression.$and.every(value=>evaluate(value,row));
   if(expression.$or)return expression.$or.some(value=>evaluate(value,row));
   if(expression.$ifNull){const [a,b]=evaluate(expression.$ifNull,row);return a??b;}
   if(expression.$arrayElemAt){const [a,b]=evaluate(expression.$arrayElemAt,row);return a?.[b];}
   throw new Error('Unexpected expression '+JSON.stringify(expression));
}
function model(rows, property=false){
   return {
      collection:{name:property?'properties':'leadproperties',async bulkWrite(operations){
         metrics.backfills++;
         for(const operation of operations){const doc=rows.find(row=>matches(row,operation.updateOne.filter));if(!doc)continue;
            const set=operation.updateOne.update[0].$set;
            if(set.attrs){doc.attrs={...(doc.attrs||{}),...set.attrs.$mergeObjects[1]};}
            for(const [key,value] of Object.entries(set))if(key!=='attrs')doc[key]=value;
         }
      }},
      find:filter=>query(rows,filter||{},property),findOne:filter=>query(rows,filter||{},property,true),
      estimatedDocumentCount:async()=>rows.length,countDocuments:async filter=>rows.filter(row=>matches(row,filter)).length,
      distinct:async(key,filter={})=>[...new Set(rows.filter(row=>matches(row,filter)).map(row=>read(row,key)))],
      async aggregate(pipeline){
         let selected=rows.filter(row=>matches(row,pipeline[0].$match||{}));
         const lookup=pipeline.find(step=>step.$lookup);
         if(lookup)selected=selected.map(row=>({...row,linked:properties.filter(p=>p._id===row.propertyId)}));
         const projection=pipeline.find(step=>step.$project);
         if(projection)selected=selected.map(row=>({stage:evaluate(projection.$project.stage,row)}));
         const counts={};for(const row of selected)counts[row.stage]=(counts[row.stage]||0)+1;
         return Object.entries(counts).map(([_id,count])=>({_id,count}));
      },
   };
}
const context=vm.createContext({Date:TestDate,console,Response,Types:mongoose.Types,connectDB:async()=>{},LeadProperty:model(leads),Property:model(properties,true),Communication:{aggregate:async()=>[]},getSessionUser:async()=>null});
function load(path){
   const source=fs.readFileSync(path,'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/^export \{.*?\} from .*;\r?\n/gm,'').replace(/export (async function|function|const)/g,'$1');
   vm.runInContext(source,context,{filename:path});
}
for(const path of ['utils/crm/phone.js','utils/crm/phoneIndex.js','utils/crm/queryCache.js','utils/crm/phoneIntel.js','utils/crm/parsingStats.js','utils/crm/callCenter.js','utils/crm/parsingMarket.js','app/api/crm/parsing/route.js'])load(path);
vm.runInContext('globalThis.list = GET;', context);

async function run(){
   const visible=leads.slice(0,40);
   const [first,simultaneous]=await Promise.all([context.buildPhoneIntelMap(visible),context.buildPhoneIntelMap(visible)]);
   assert.equal(first['0971234567'].parsingCount,12);
   assert.equal(first['0971234567'].objectsCount,1);
   assert.equal(first['0971234567'].relatedParsing.length,8);
   assert.equal(simultaneous['0971234567'].total,13);
   assert.equal(metrics.filteredLeadReads,1,'Simultaneous pages share a single phone lookup');
   assert.equal(metrics.filteredPropertyReads,1);
   assert.equal(metrics.returnedLeadRows,40,'Only the requested phone matches reach the server, rather than all 2001 leads');
   assert.equal(leads.at(-1).attrs.phoneNormalized,'0661234567');
   assert.equal(leads.at(-1).attrs.sourceMarker,'keep');
   assert.equal(leads.at(-1).phone,'+38 (066) 123-45-67','Backfill leaves source data intact');
   assert.deepEqual(Array.from(properties[0].phoneKeys),['0971234567']);
   await context.buildPhoneIntelMap(visible);
   assert.equal(metrics.filteredLeadReads,1,'Repeated page reuses phone summaries');
   const ownerIds=await context.getPhoneContactIds('owner');
   assert.equal(ownerIds.length,12,'Global filters include every matching lead beyond the eight related previews');
   leads[0].attrs.contactType='realtor';leads[0].phoneIntelUpdatedAt=new Date(clock+100);
   clock+=1100;
   const refreshed=await context.buildPhoneIntelMap(visible);
   assert.equal(refreshed['0971234567'].suggestedKind,'realtor','Changes made by another user invalidate existing summaries');
   const refreshedOwners=await context.getPhoneContactIds('owner');
   assert.equal(refreshedOwners.length,11);
   leads.splice(1,1);clock+=1100;
   const afterDelete=await context.buildPhoneIntelMap(visible);
   assert.equal(afterDelete['0971234567'].parsingCount,11,'Deleting an older document also invalidates cached counts');
   const response=await context.list({nextUrl:new URL('http://localhost/api/crm/parsing?stage=raw&page=2&contactKind=all')});
   assert.equal(response.status,200);
   const page=await response.json();
   assert.equal(page.items.length,40);
   assert.ok(page.stats.raw>40,'Status counters cover the full result set');
   assert.equal(page.stats.fake,100,'Selecting New does not erase other status totals');
   const filtered=await(await context.list({nextUrl:new URL('http://localhost/api/crm/parsing?contactKind=owner')})).json();
   assert.equal(filtered.total,10,'Global contact filtering uses current full membership after deletion');
   for(const [offset,group] of ['inactive','paused','active'].entries()){
      const id=4000+offset;
      properties.push({_id:id,actualityGroup:group,crmStage:'base',phoneKeys:[],phoneIndexVersion:1,owners:[],phoneIntelUpdatedAt:new Date(clock)});
      leads.push({_id:id,stage:'moved',propertyId:id,source:'olx',importedAt:new Date(clock),attrs:{phoneIndexVersion:1},phoneIntelUpdatedAt:new Date(clock)});
   }
   clock+=6000;
   for(const [stage,id] of [['inactive',4000],['paused',4001],['base',4002]]){
      const result=await(await context.list({nextUrl:new URL(`http://localhost/api/crm/parsing?stage=${stage}`)})).json();
      assert.equal(result.total,1,`Filter ${stage} excludes other market states`);
      assert.equal(result.items[0]._id,id);
      assert.equal(result.stats.inactive,1);
      assert.equal(result.stats.paused,1);
      assert.equal(result.stats.base,1);
   }
   const internalId=new mongoose.Types.ObjectId('507f1f77bcf86cd799439033');
   leads.push({_id:internalId,stage:'raw',source:'reamak',sourceId:'reamak:127/test',attrs:{phoneIndexVersion:1,reamak:{siteId:'939558499'}}});
   for(const q of [String(internalId),'939558499']) {
      const result=await(await context.list({nextUrl:new URL(`http://localhost/api/crm/parsing?q=${q}`)})).json();
      assert.equal(result.total,1,'Lookup accepts internal IDs and original site IDs');
      assert.equal(result.items[0]._id,String(internalId));
      assert.equal(result.stats.raw,1,'ID filters also work in aggregation counters');
   }
   let attempts=0;
   await assert.rejects(context.cachedCRMQuery('failure',1000,async()=>{attempts++;throw Error('offline');}));
   await context.cachedCRMQuery('failure',1000,async()=>{attempts++;return true;});
   assert.equal(attempts,2,'Failed queries are retried instead of poisoning the cache');
   const schema=new mongoose.Schema({phone:String,attrs:mongoose.Schema.Types.Mixed,owners:[{phones:[String]}]});
   const hookContext=vm.createContext({Date,getPhoneValidation:context.getPhoneValidation});
   vm.runInContext(fs.readFileSync('utils/crm/phoneIndex.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export function/g,'function'),hookContext);
   hookContext.installPhoneIndex(schema);
   const Model=mongoose.model('PhoneIndexOfflineTest',schema);
   const doc=new Model({phone:'+380971234567',attrs:{marker:'keep'}});
   await doc.validate();
   assert.equal(doc.attrs.phoneNormalized,'0971234567');
   assert.equal(doc.attrs.marker,'keep');
   const propertySchema=new mongoose.Schema({owners:[{phones:[String]}]});
   hookContext.installPhoneIndex(propertySchema,true);
   const PropertyModel=mongoose.model('PropertyPhoneIndexOfflineTest',propertySchema);
   const property=new PropertyModel({owners:[{phones:['0971234567','+380971234567']}]});
   await property.validate();
   assert.deepEqual(Array.from(property.phoneKeys),['0971234567']);
   const edit=PropertyModel.findOneAndUpdate({},{$set:{'owners.0.phones':['0671234567']}});
   await new Promise((resolve,reject)=>propertySchema.s.hooks.execPre('findOneAndUpdate',edit,error=>error?reject(error):resolve()));
   assert.equal(edit.getUpdate().$set.phoneIndexVersion,0,'Positional phone edits trigger a safe index rebuild');
   console.log('PASS: 2001-lead fixture, bounded page lookups, concurrent cache reuse, migration, cross-user edits, deletion, complete filters, global counters and Mongoose phone keys.');
   console.log(JSON.stringify(metrics));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
