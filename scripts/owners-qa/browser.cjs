// Owner POSTs are mocked: this QA never creates CRM leads or Telegram messages.
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const WebSocket = require('next/dist/compiled/ws');
const base = process.env.OWNERS_QA_URL || 'http://localhost:3000';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const output = path.resolve('node_modules/.cache/owners-qa');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const vitalsOnly = process.argv.includes('--vitals');
let browser, socket;
const errors = [], submissions = [], failedScripts = [];

(async () => {
  for (const route of ['/owners', '/owners2']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('https://karamax.com.ua/owners'));
    if (route === '/owners2') assert.match(html, /noindex/);
  }
  console.log('PASS both routes, canonical, archive noindex');
  for (const [body, headers, status] of [
    ['{}', { 'Content-Type': 'application/json' }, 400],
    ['{}', { 'Content-Type': 'application/json', Origin: 'https://invalid.example' }, 403],
    ['{}', { 'Content-Type': 'text/plain' }, 415],
  ]) assert.equal((await fetch(base + '/api/public/owner-requests', { method: 'POST', headers, body })).status, status);
  console.log('PASS API rejects invalid payload, cross-origin, and non-JSON requests');
  browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=9339', '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'owners-v2-')), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 100; i++) {
    try { targets = await fetch('http://127.0.0.1:9339/json/list').then(r => r.json()); if (targets.length) break; } catch {}
    await wait(200);
  }
  assert.ok(targets?.length, 'Chrome did not start');
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let sequence = 0;
  const pending = new Map();
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  socket.on('message', async raw => {
    const message = JSON.parse(raw);
    if (message.id) {
      const task = pending.get(message.id);
      if (task) { pending.delete(message.id); message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result); }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
    if (message.method === 'Network.responseReceived' && message.params.type === 'Script' && message.params.response.status >= 400) failedScripts.push(message.params.response.url);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      submissions.push(JSON.parse(request.postData));
      await wait(600);
      const first = submissions.length === 1;
      await cdp('Fetch.fulfillRequest', { requestId, responseCode: first ? 503 : 201, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(first ? { error: 'Тестова помилка збереження' } : { success: true })).toString('base64') });
    }
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const poll = async (expression, label) => {
    for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await wait(200); }
    throw new Error('Timed out: ' + label);
  };
  const screenshot = async filename => {
    const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, filename), Buffer.from(result.data, 'base64'));
  };
  const size = async (width, height, mobile = true) => { await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }); await wait(250); };
  const navigate = async route => { await cdp('Page.navigate', { url: base + route }); await poll('document.readyState === "complete" && !!document.getElementById("owners-title")', route); await wait(1000); };
  const setValue = (name, value) => evaluate(`(()=>{const el=document.getElementsByName(${JSON.stringify(name)})[0];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  const eventCount = name => evaluate(`(window.dataLayer || []).filter(item=>item.event===${JSON.stringify(name)}).length`);
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
  if (vitalsOnly) {
    await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.ownersVitals={cls:0,lcp:0,interactions:[]};
      for (const type of ['layout-shift','largest-contentful-paint','event']) {
        new PerformanceObserver(list=>list.getEntries().forEach(entry=>{
          if(type==='layout-shift'&&!entry.hadRecentInput)window.ownersVitals.cls+=entry.value;
          if(type==='largest-contentful-paint'){window.ownersVitals.lcp=entry.startTime;window.ownersVitals.element={tag:entry.element?.tagName,id:entry.element?.id,url:entry.url,loadTime:entry.loadTime,renderTime:entry.renderTime};}
          if(type==='event'&&entry.interactionId)window.ownersVitals.interactions.push({name:entry.name,duration:entry.duration});
        })).observe({type,buffered:true,durationThreshold:16});
      }` });
    await cdp('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: vitalsOnly ? 'no-preference' : 'reduce' }] });
  await size(vitalsOnly ? 390 : 1440, vitalsOnly ? 844 : 1000, vitalsOnly);
  await navigate('/owners?utm_source=google&utm_medium=cpc&gclid=qa-first&fbclid=qa-meta&email=private#top');
  if (vitalsOnly) {
    await wait(2000);
    await screenshot('v2-production-mobile.png');
    const point = await evaluate('(()=>{const r=document.querySelector("[data-placement=hero]").querySelector("a").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    await wait(1600);
    await evaluate('document.getElementsByName("location")[0].focus()');
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'L', code: 'KeyL', text: 'L' });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'L', code: 'KeyL' });
    await wait(500);
    const vitals = await evaluate('window.ownersVitals');
    console.log('LAB ONLY (390px, CPU 4x, local network):', JSON.stringify(vitals));
    assert.ok(vitals.lcp > 0, 'LCP not observed');
    assert.ok(vitals.cls <= 0.1, 'unexpected layout shift');
    assert.equal(errors.length, 0, errors.join('\n'));
    await screenshot('v2-production-form.png');
    await cdp('Browser.close');
    return;
  }
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
  assert.equal(await evaluate('document.getElementById("owners-title").textContent'), 'Дізнайтеся, за скільки реально можна продати вашу квартиру у Львові');
  assert.equal(await evaluate('[...document.scripts].filter(s=>/googletagmanager|facebook.net/.test(s.src)).length'), 0);
  assert.equal(await eventCount('owners_view'), 0);
  await screenshot('v2-desktop-hero.png');
  await evaluate('document.querySelector("#owners-privacy details").open=true; document.querySelectorAll("#owners-privacy input").forEach(el=>el.click()); document.querySelector("#owners-privacy button").click()');
  await poll('(window.dataLayer || []).some(item=>item.event==="owners_view")', 'consented view');
  assert.equal(await eventCount('owners_view'), 1);
  await navigate('/owners');
  assert.equal(await eventCount('owners_view'), 1);
  console.log('PASS consent defaults, view once, first-touch navigation');
  await evaluate('document.getElementById("tab-speed").click()');
  assert.equal(await evaluate('document.getElementById("tab-speed").getAttribute("aria-selected")'), 'true');
  await evaluate('document.getElementById("tab-speed").focus()');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
  assert.equal(await evaluate('document.activeElement.id'), 'tab-balance');
  await evaluate('document.getElementById("faq-question-2").click()');
  assert.equal(await evaluate('document.getElementById("faq-answer-2").getAttribute("aria-hidden")'), 'false');
  await evaluate('document.getElementById("faq-question-2").click()');
  assert.equal(await evaluate('document.getElementById("faq-answer-2").getAttribute("aria-hidden")'), 'true');
  console.log('PASS strategy keyboard navigation and FAQ opening/closing');
  for (const [width, height] of [[1440, 1000], [390, 844], [320, 740], [768, 1024]]) {
    await size(width, height, width < 1000);
    await evaluate('scrollTo(0,0)'); await wait(250);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'overflow ' + width);
    if (width <= 390) {
      const bottom = await evaluate('document.querySelector("[data-placement=hero]").querySelector("a").getBoundingClientRect().bottom');
      assert.ok(bottom <= height, `hero CTA below first screen (${width}): ${bottom}`);
      await screenshot(`v2-mobile-${width}.png`);
    }
  }
  console.log('PASS responsive widths 320/390/768/1440, mobile hero CTA visible');
  await size(390, 844);
  await evaluate('scrollTo(0,100)'); await wait(200);
  assert.equal(await evaluate('document.querySelector("[data-placement=mobile_sticky]").getAttribute("aria-hidden")'), 'true');
  await evaluate('scrollTo(0,document.querySelector("[data-placement=hero]").offsetHeight+20)'); await wait(250);
  assert.equal(await evaluate('document.querySelector("[data-placement=mobile_sticky]").getAttribute("aria-hidden")'), 'false');
  await evaluate('document.querySelector("[data-placement=mobile_sticky]").lastElementChild.click()');
  await wait(400);
  assert.equal(await evaluate('document.querySelector("[data-placement=mobile_sticky]").getAttribute("aria-hidden")'), 'true');
  assert.ok(await evaluate('document.getElementById("request").getBoundingClientRect().top >= document.querySelector("header").getBoundingClientRect().bottom'), 'header covers form');
  assert.ok(await evaluate('[...document.querySelectorAll("a")].filter(el=>el.getAttribute("href")==="#request").length >= 6'));
  await evaluate('document.querySelector("button[aria-controls=owners-mobile-nav]").click()');
  await poll('!!document.getElementById("owners-mobile-nav")', 'menu');
  await evaluate('document.getElementById("owners-mobile-nav").lastElementChild.click()');
  await poll('!document.getElementById("owners-mobile-nav")', 'menu closes');
  await wait(350);
  const honey = await evaluate('(()=>{const el=document.getElementsByName("website")[0];return {tab:el.tabIndex,hidden:el.closest("[aria-hidden]").getAttribute("aria-hidden"),x:el.getBoundingClientRect().right};})()');
  assert.equal(honey.tab, -1); assert.equal(honey.hidden, 'true'); assert.ok(honey.x < 0);
  await evaluate('document.querySelector("form button[type=submit]").click()');
  assert.equal(await evaluate('document.querySelector("form").checkValidity()'), false);
  assert.equal(submissions.length, 0);
  await setValue('location', 'Франківський район');
  await evaluate('[...document.getElementsByName("rooms")].find(el=>el.value==="2").click()');
  await evaluate('document.querySelector("form button[type=submit]").click()');
  await poll('!!document.getElementsByName("phone")[0]', 'step 2');
  assert.equal(await evaluate('document.activeElement.tagName'), 'H3');
  await evaluate('document.querySelector("form button[type=button]").click()');
  await poll('!!document.getElementsByName("location")[0]', 'back');
  assert.equal(await evaluate('document.getElementsByName("location")[0].value'), 'Франківський район');
  assert.equal(await evaluate('document.activeElement.tagName'), 'H3');
  await evaluate('document.querySelector("form button[type=submit]").click()');
  await poll('!!document.getElementsByName("phone")[0]', 'step 2 again');
  assert.equal(await eventCount('owners_step_2'), 1);
  await setValue('name', 'Тест QA'); await setValue('phone', '123');
  await evaluate('document.getElementsByName("consent")[0].click(); document.querySelector("form button[type=submit]").click()');
  await poll('!!document.querySelector("[role=alert]")', 'phone validation');
  assert.equal(submissions.length, 0);
  await setValue('phone', '0679850911');
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*api/public/owner-requests', requestStage: 'Request' }] });
  await evaluate('(()=>{const button=document.querySelector("form button[type=submit]");button.click();button.click();})()');
  await poll('document.querySelector("[role=alert]")?.textContent.includes("Тестова помилка")', 'mock 503');
  assert.equal(submissions.length, 1);
  assert.equal(await evaluate('document.getElementsByName("phone")[0].value'), '0679850911');
  assert.equal(await eventCount('owners_submit_success'), 0);
  await evaluate('(()=>{const form=document.querySelector("form");form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));})()');
  await poll('document.body.textContent.includes("Дякуємо за довіру")', 'mock success');
  assert.equal(submissions.length, 2);
  assert.equal(submissions[1].attribution.utm_source, 'google');
  assert.equal(submissions[1].attribution.gclid, 'qa-first');
  assert.equal(submissions[1].attribution.fbclid, 'qa-meta');
  assert.equal(submissions[1].attribution.landing_page, base + '/owners');
  for (const event of ['owners_form_start', 'owners_step_2', 'owners_submit_success', 'owner_analysis_request']) assert.equal(await eventCount(event), 1, event);
  const events = await evaluate('(window.dataLayer || []).filter(item=>item.event)');
  assert.ok(!JSON.stringify(events).includes('0679850911')); assert.ok(!JSON.stringify(events).includes('Франківський'));
  await evaluate('document.addEventListener("click",e=>{if(e.target.closest("a[href^=tel]"))e.preventDefault()},{once:true});document.querySelector("header a[href^=tel]").click()');
  assert.equal(await eventCount('owners_phone_click'), 1);
  assert.ok(await eventCount('owners_cta_click') >= 2);
  await screenshot('v2-mobile-success.png');
  console.log('PASS form steps/back/focus/validation, honeypot, 503 recovery, double-submit lock, consent and attribution, all six events');
  await cdp('Fetch.disable');
  await cdp('Page.navigate', { url: base + '/' });
  await poll('document.readyState === "complete" && [...document.links].some(link=>link.getAttribute("href")?.startsWith("/views/"))', 'home');
  assert.equal(failedScripts.length, 0, failedScripts.join('\n'));
  await navigate('/owners2');
  assert.ok(!(await evaluate('document.getElementById("owners-title").textContent')).includes('Дізнайтеся'));
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS homepage navigation, archive original H1, no runtime/console errors or failed scripts');
  await cdp('Browser.close');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); browser?.kill(); });
