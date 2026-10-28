import { defaultTemplate } from '/editor-schema.mjs';
import { renderTemplate, labelPdf } from '/editor.js';

const $ = id => document.getElementById(id);
const activation = new URLSearchParams(location.hash.slice(1));
const adminKey = activation.get('key') || sessionStorage.getItem('hwnix-admin-key');
if (adminKey) { sessionStorage.setItem('hwnix-admin-key', adminKey); history.replaceState(null, '', '/'); }
let state; let devices = []; let selected = new Set(); let selectedIncoming = new Set(); let currentDocument;
let pdfDocument; let pdfPage = 1; let rendering; let previewEpoch = 0; let renderedLabel; let printing = false; let selectingPrinter = false;
const headers = () => ({ 'X-Admin-Token': adminKey || '' });
const messageQueue = [];
function showMessage(message, kind = 'error') {
  const dialog = $('messageDialog');
  if (dialog.open && $('messageBody').textContent === message) return;
  if (!messageQueue.some(item => item.message === message)) messageQueue.push({ message, kind });
  nextMessage();
}
function nextMessage() {
  if ($('messageDialog').open || !messageQueue.length) return;
  const item = messageQueue.shift();
  $('messageTitle').textContent = item.kind === 'warning' ? 'تنبيه' : 'تعذر إكمال العملية';
  $('messageIcon').textContent = item.kind === 'warning' ? '!' : '×';
  $('messageDialog').dataset.kind = item.kind;
  $('messageBody').textContent = item.message;
  $('messageDialog').showModal(); $('messageOk').focus();
}
$('messageOk').addEventListener('click', () => $('messageDialog').close());
$('messageDialog').addEventListener('close', nextMessage);
function notice(message, error = false, kind = '') {
  if (error || kind === 'warning') { $('notice').hidden = true; showMessage(message, error ? 'error' : 'warning'); return; }
  $('notice').hidden = false; $('notice').className = ''; $('notice').textContent = message;
}
async function api(path, data) {
  const response = await fetch('/admin/' + path, { method: data === undefined ? 'GET' : 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(['scan', 'config', 'check-printer'].includes(path) ? 120_000 : 60_000) });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || 'تعذر تنفيذ الطلب.'); return result;
}
const tabInfo = {
  files: ['الملفات والطباعة', 'أضف ملفات PDF أو الصور، وراجعها قبل إرسالها للطابعة.'],
  editor: ['محرر الملصقات', 'خمسة صفوف قابلة للتخصيص، مع معاينة مباشرة للنص وQR والباركود.'],
  incoming: ['مهام الموقع', 'راجع الملفات المرسلة من نظام الفواتير قبل الطباعة.'],
  settings: ['الطابعة والربط', 'إعداد مستقل لهذا اللابتوب، بدون فتح نافذة متصفح خارج البرنامج.'],
};
function showTab(tab) {
  for (const panel of document.querySelectorAll('.panel')) panel.hidden = panel.id !== `panel-${tab}`;
  for (const button of document.querySelectorAll('[data-tab]')) button.classList.toggle('active', button.dataset.tab === tab);
  $('pageTitle').textContent = tabInfo[tab][0]; $('pageSubtitle').textContent = tabInfo[tab][1];
  $('printControls').hidden = tab === 'settings';
  if (tab === 'editor') { showEditorRow(); updateEditor(); }
}
for (const button of document.querySelectorAll('[data-tab]')) button.addEventListener('click', () => showTab(button.dataset.tab));

function geometry() {
  const paper = state?.paperOptions?.find(option => option.value === $('paper').value);
  return { widthDots: paper?.widthDots || state?.geometry?.widthDots || 384, dpi: paper?.dpi || state?.geometry?.dpi || 203 };
}
function populateModels(filter = '') {
  const selectedModel = $('model').value || state.modelKey; $('model').replaceChildren();
  const query = filter.toLowerCase().trim();
  for (const model of state.catalog.filter(model => !query || `${model.key} ${model.label}`.toLowerCase().includes(query))) $('model').add(new Option(`${model.label} — ${model.key}`, model.key));
  if ([...$('model').options].some(option => option.value === selectedModel)) $('model').value = selectedModel;
}
function showState(fillSettings = false) {
  $('status').textContent = state.configured ? 'الطابعة مُعدّة' : 'اختر الطابعة';
  $('status').className = state.configured ? 'badge ready' : 'badge';
  $('printerSummary').textContent = state.configured ? ((state.bluetoothName ? state.bluetoothName + ' · ' : '') + state.bluetooth) : 'اضبط الطابعة من تبويب الطابعة والربط';
  $('queueCount').textContent = state.pending ? `${state.pending} طلب في طابور الطباعة` : '';
  if (fillSettings) {
    $('bluetooth').value = state.bluetooth; $('origins').value = state.allowedOrigins.join('\n'); $('token').value = state.token;
    populateModels();
    const oldPaper = $('paper').value; $('paper').replaceChildren();
    for (const paper of state.paperOptions) $('paper').add(new Option(paper.title, paper.value));
    if (state.paperOptions.some(paper => paper.value === oldPaper)) $('paper').value = oldPaper;
    const g = state.geometry;
    $('geometry').textContent = state.configured && g ? `عرض الطباعة نحو ${(g.widthDots * 25.4 / g.dpi).toFixed(1)} مم · ${g.dpi} dpi` : 'اختر الموديل واحفظ الإعداد.';
  }
  renderDocuments(); renderPrinterPicker(); updatePrintButtons();
}
async function refresh(fillSettings = false) { state = await api('state'); showState(fillSettings); }
function renderDocuments() {
  $('fileList').replaceChildren(); $('incomingList').replaceChildren();
  const incoming = state.documents.filter(document => document.source === 'website'); $('incomingCount').textContent = incoming.length;
  const makeRow = (item, container, set) => {
    const row = document.createElement('div'); row.className = `file-item${set.has(item.id) ? ' selected' : ''}`;
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = set.has(item.id); check.setAttribute('aria-label', `تحديد ${item.name}`);
    check.addEventListener('change', () => { if (check.checked) set.add(item.id); else set.delete(item.id); renderDocuments(); });
    const button = document.createElement('button'); button.className = 'name'; button.textContent = item.name;
    const detail = document.createElement('small'); detail.textContent = `${item.type.toUpperCase()} · ${(item.size / 1024).toFixed(0)} كيلوبايت${item.source === 'website' ? ' · من الموقع' : ''}`; button.append(detail);
    button.addEventListener('click', async () => { selected = new Set([item.id]); showTab('files'); renderDocuments(); try { await previewDocument(item.id); } catch (error) { notice(error.message, true); } });
    const remove = document.createElement('button'); remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label', `إزالة ${item.name} من القائمة`);
    remove.addEventListener('click', async () => { try { await api('remove-document', { id: item.id }); selected.delete(item.id); selectedIncoming.delete(item.id); await refresh(); if (currentDocument === item.id) { currentDocument = null; $('documentStage').hidden = true; $('documentEmpty').hidden = false; } } catch (error) { notice(error.message, true); } });
    row.append(check, button, remove); container.append(row);
  };
  for (const item of state.documents) makeRow(item, $('fileList'), selected);
  for (const item of incoming) makeRow(item, $('incomingList'), selectedIncoming);
  if (!state.documents.length) $('fileList').textContent = 'لم تُضَف ملفات بعد.';
  if (!incoming.length) $('incomingList').textContent = 'لا توجد مهام واردة حاليًا.';
}
function updatePrintButtons() {
  $('printerPicker').disabled = printing || selectingPrinter || Boolean(state?.pending);
  $('addPrinter').disabled = printing || selectingPrinter || Boolean(state?.pending);
  $('printFiles').disabled = printing || selectingPrinter || !state?.configured;
  $('printIncoming').disabled = printing || selectingPrinter || !state?.configured;
  $('printLabel').disabled = printing || selectingPrinter || !state?.configured || !renderedLabel;
}
function asBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('تعذرت قراءة الملف.')); reader.readAsDataURL(file); }); }
$('filePicker').addEventListener('change', async event => {
  const files = [...event.target.files]; if (!files.length) return;
  try {
    if (files.length > 10 || files.some(file => file.size > 20 * 1024 * 1024) || files.reduce((sum, file) => sum + file.size, 0) > 40 * 1024 * 1024) throw new Error('اختر حتى 10 ملفات، بحد 20 ميجابايت للملف و40 ميجابايت إجمالًا.');
    notice('جارٍ إضافة الملفات…');
    const response = await api('documents', { files: await Promise.all(files.map(async file => ({ name: file.name, data: await asBase64(file) }))) });
    selected = new Set(response.documents.map(document => document.id)); await refresh();
    await previewDocument(response.documents[0].id); notice('أُضيفت الملفات. راجع المعاينة ونوع الورق قبل الطباعة.');
  } catch (error) { notice(error.message, true); }
  finally { event.target.value = ''; }
});

async function previewDocument(id) {
  const epoch = ++previewEpoch; currentDocument = id; pdfPage = 1;
  if (rendering) { rendering.cancel(); await rendering.promise.catch(() => {}); rendering = null; }
  if (pdfDocument) { await pdfDocument.loadingTask.destroy(); pdfDocument = null; }
  const metadata = state.documents.find(document => document.id === id); if (!metadata) return;
  $('documentName').textContent = metadata.name; $('documentEmpty').hidden = true; $('documentStage').hidden = false;
  const response = await fetch('/admin/documents/' + id, { headers: headers() }); if (!response.ok) throw new Error('تعذرت قراءة الملف للمعاينة.');
  const bytes = new Uint8Array(await response.arrayBuffer()); if (epoch !== previewEpoch) return;
  if (metadata.type === 'pdf') {
    const pdf = await import('/vendor/pdf.mjs'); pdf.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.mjs';
    const loaded = await pdf.getDocument({ data: bytes, isEvalSupported: false, cMapUrl: '/vendor/pdf-assets/cmaps/', cMapPacked: true, standardFontDataUrl: '/vendor/pdf-assets/standard_fonts/', wasmUrl: '/vendor/pdf-assets/wasm/' }).promise;
    if (epoch !== previewEpoch) { await loaded.loadingTask.destroy(); return; }
    pdfDocument = loaded; await drawPdfPage();
  } else {
    const bitmap = await createImageBitmap(new Blob([bytes], { type: metadata.mime })); if (epoch !== previewEpoch) { bitmap.close(); return; }
    const canvas = $('documentPreview'); const scale = Math.min(1, 1000 / bitmap.width); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close(); $('pageLabel').textContent = 'صورة';
  }
  $('pagePrevious').disabled = !pdfDocument || pdfPage <= 1; $('pageNext').disabled = !pdfDocument || pdfPage >= pdfDocument.numPages;
}
async function drawPdfPage() {
  if (!pdfDocument) return;
  if (rendering) { rendering.cancel(); await rendering.promise.catch(() => {}); }
  const page = await pdfDocument.getPage(pdfPage); const unit = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(1.5, 900 / unit.width) });
  const canvas = $('documentPreview'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  rendering = page.render({ canvasContext: canvas.getContext('2d'), canvas, viewport }); await rendering.promise; rendering = null;
  $('pageLabel').textContent = `${pdfPage} / ${pdfDocument.numPages}`; $('pagePrevious').disabled = pdfPage <= 1; $('pageNext').disabled = pdfPage >= pdfDocument.numPages;
}
$('pagePrevious').addEventListener('click', async () => { if (pdfDocument && pdfPage > 1) { pdfPage--; try { await drawPdfPage(); } catch (error) { notice(error.message, true); } } });
$('pageNext').addEventListener('click', async () => { if (pdfDocument && pdfPage < pdfDocument.numPages) { pdfPage++; try { await drawPdfPage(); } catch (error) { notice(error.message, true); } } });

function setTemplate(template) {
  $('labelWidth').value = template.widthMm; $('labelHeight').value = template.heightMm; $('labelPadding').value = template.paddingMm; $('labelGap').value = template.gapMm;
  $('textRows').replaceChildren();
  template.rows.forEach((row, index) => {
    const field = document.createElement('fieldset'); field.className = 'editor-row';
    field.innerHTML = `<legend><label class="check-label"><input id="rowEnabled${index}" type="checkbox">الصف ${index + 1}</label></legend><label>النص<input id="rowText${index}" maxlength="300" dir="auto"></label><div class="row-options"><label>الخط pt<input id="rowFont${index}" type="number" min="5" max="36"></label><label>المحاذاة<select id="rowAlign${index}"><option value="center">وسط</option><option value="right">يمين</option><option value="left">يسار</option></select></label><label class="check-label"><input id="rowBold${index}" type="checkbox">عريض</label></div>`;
    $('textRows').append(field); $(`rowEnabled${index}`).checked = row.enabled; $(`rowText${index}`).value = row.text; $(`rowFont${index}`).value = row.fontPt; $(`rowBold${index}`).checked = row.bold; $(`rowAlign${index}`).value = row.align;
  });
  $('codeEnabled').checked = template.code.enabled; $('codeType').value = template.code.type; $('codeValue').value = template.code.value; $('codeHeight').value = template.code.heightMm; $('codeFont').value = template.code.fontPt; $('codeShowText').checked = template.code.showText;
  showEditorRow(); updateEditor();
}
function readTemplate() {
  return { widthMm: Number($('labelWidth').value), heightMm: Number($('labelHeight').value), paddingMm: Number($('labelPadding').value), gapMm: Number($('labelGap').value),
    rows: Array.from({ length: 4 }, (_, index) => ({ enabled: $(`rowEnabled${index}`).checked, text: $(`rowText${index}`).value, fontPt: Number($(`rowFont${index}`).value), bold: $(`rowBold${index}`).checked, align: $(`rowAlign${index}`).value })),
    code: { enabled: $('codeEnabled').checked, type: $('codeType').value, value: $('codeValue').value, heightMm: Number($('codeHeight').value), fontPt: Number($('codeFont').value), showText: $('codeShowText').checked } };
}
function updateEditor() {
  if (!$('rowText0')) return;
  try {
    renderedLabel = renderTemplate(readTemplate(), geometry());
    const canvas = $('labelPreview'); canvas.width = renderedLabel.canvas.width; canvas.height = renderedLabel.canvas.height; canvas.getContext('2d').drawImage(renderedLabel.canvas, 0, 0);
    $('labelDimensions').textContent = `${renderedLabel.template.widthMm} × ${renderedLabel.template.heightMm} مم`;
    $('editorError').textContent = '';
  } catch (error) { renderedLabel = null; $('editorError').textContent = error.message; $('labelPreview').width = 0; }
  updatePrintButtons();
}
$('panel-editor').addEventListener('input', updateEditor); $('paper').addEventListener('change', updateEditor);
$('resetTemplate').addEventListener('click', () => setTemplate(defaultTemplate()));
$('saveTemplate').addEventListener('click', async () => { try { await api('template', readTemplate()); notice('حُفظ القالب على هذا الجهاز.'); } catch (error) { notice(error.message, true); } });
$('loadTemplate').addEventListener('click', async () => { try { const result = await api('template'); if (!result.template) throw new Error('لا يوجد قالب محفوظ بعد.'); setTemplate(result.template); notice('استُعيد القالب المحفوظ.'); } catch (error) { notice(error.message, true); } });

async function printSelection(ids, overrides = {}) {
  if (!ids.length) { notice('حدد ملفًا واحدًا على الأقل.', true); return; }
  printing = true; updatePrintButtons(); $('jobArea').hidden = false; $('jobStatus').textContent = 'جارٍ الإرسال';
  try {
    const id = crypto.randomUUID();
    let job = await api('print', { id, documentIds: ids, printerId: $('printerPicker').value, paper: $('paper').value, copies: Number($('copies').value), darkness: Number($('darkness').value), imageMode: $('imageMode').value, trimMargins: $('trimMargins').checked, pdfPages: $('pdfPages').value, ...overrides });
    const deadline = Date.now() + 45 * 60_000;
    while (['queued', 'checking', 'printing'].includes(job.status)) {
      $('jobStatus').textContent = job.status === 'queued' ? 'في الانتظار' : job.phase === 'checking' ? 'جارٍ فحص الطابعة' : 'جارٍ الطباعة'; $('jobProgress').textContent = job.progress || '';
      if (Date.now() > deadline) throw new Error('لم تتأكد نتيجة الطلب. افحص الطابعة قبل إعادة الإرسال.');
      await new Promise(resolve => setTimeout(resolve, 800)); job = await api('jobs/' + id);
    }
    if (job.status !== 'succeeded') throw new Error(job.error || 'فشلت الطباعة. قد يكون جزء من الملفات طُبع بالفعل؛ افحص الورق قبل الإعادة.');
    $('jobStatus').textContent = 'انتهى الإرسال'; notice('اكتمل الإرسال للطابعة. تحقق من خروج الورق وجودة الرمز.');
  } catch (error) { $('jobStatus').textContent = 'تعذر إكمال الطلب'; $('jobProgress').textContent = ''; notice(error.message, true); }
  finally { printing = false; updatePrintButtons(); }
}
$('printFiles').addEventListener('click', () => printSelection([...selected]));
$('printIncoming').addEventListener('click', () => printSelection([...selectedIncoming]));
$('printLabel').addEventListener('click', async () => {
  if (!renderedLabel || printing) return;
  printing = true; updatePrintButtons();
  let temporaryId;
  try { const result = await api('documents', { files: [{ name: 'ملصق من المحرر.pdf', data: labelPdf(renderedLabel) }] }); temporaryId = result.documents[0].id; await refresh(); await printSelection([temporaryId], { imageMode: 'threshold', trimMargins: false, pdfPages: '' }); }
  catch (error) { notice(error.message, true); }
  finally { printing = false; updatePrintButtons(); if (temporaryId) { await api('remove-document', { id: temporaryId }).catch(() => {}); await refresh().catch(() => {}); } }
});

$('modelFilter').addEventListener('input', event => populateModels(event.target.value));
$('devices').addEventListener('change', event => { const device = devices.find(device => device.address === event.target.value); if (!device) return; $('bluetooth').value = device.address; if (device.models.length === 1) { $('modelFilter').value = ''; populateModels(); $('model').value = device.models[0]; } });
$('scan').addEventListener('click', async () => {
  $('scan').disabled = true; $('save').disabled = true; $('scanStatus').textContent = 'جارٍ البحث…';
  try { devices = (await api('scan', {})).devices; $('devices').replaceChildren(new Option('اختر الطابعة', '')); for (const device of devices) $('devices').add(new Option(`${device.name} — ${device.address}`, device.address)); $('scanStatus').textContent = devices.length ? `تم العثور على ${devices.length} جهاز` : 'لم تظهر طابعة متوافقة. تحقق من تشغيلها ثم ابحث مجددًا.'; if (!devices.length) notice('لم يتم العثور على طابعة متوافقة. تأكد من تشغيل الطابعة وتفعيل Bluetooth وقربها، ثم أعد البحث.', false, 'warning'); }
  catch (error) { notice(error.message, true); $('scanStatus').textContent = 'تعذر إكمال البحث'; }
  finally { $('scan').disabled = false; $('save').disabled = false; }
});
$('save').addEventListener('click', async () => {
  $('save').disabled = true; $('scan').disabled = true; $('save').textContent = 'جارٍ حفظ إعداد الطابعة…';
  try { await api('config', { bluetooth: $('devices').value || $('bluetooth').value.trim(), modelKey: $('model').value, allowedOrigins: $('origins').value.split(/\r?\n/).map(value => value.trim()).filter(Boolean) }); await refresh(true); updateEditor(); notice('تم حفظ الإعداد. ابدأ بملصق واحد لتأكيد الاتصال والمحاذاة.'); }
  catch (error) { notice(error.message, true); }
  finally { $('save').disabled = false; $('scan').disabled = false; $('save').textContent = 'حفظ الطابعة والموقع'; }
});
$('copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('token').value); notice('نُسخ رمز الربط. الصقه في إعدادات الملصقات بالموقع.'); } catch { $('token').type = 'text'; $('token').select(); notice('حدد الرمز وانسخه باستخدام Ctrl+C.'); } });
$('refreshIncoming').addEventListener('click', () => refresh().catch(error => notice(error.message, true)));
window.hwnixActivate = async target => {
  try { await refresh(); if (target && target !== 'files' && state.documents.some(document => document.id === target)) { selected = new Set([target]); selectedIncoming = new Set([target]); $('copies').value = '1'; showTab('files'); renderDocuments(); await previewDocument(target); notice('وصلت مهمة من الموقع. راجع المعاينة والورق ثم اضغط طباعة.'); } else { showTab('files'); if (state.documents.length) { const item = state.documents.at(-1); selected = new Set([item.id]); renderDocuments(); await previewDocument(item.id); } } }
  catch (error) { notice(error.message, true); }
};
try {
  await refresh(true); setTemplate(defaultTemplate());
  const saved = await api('template'); if (saved.template) setTemplate(saved.template);
  showTab(state.configured ? 'files' : 'settings');
  if (activation.get('target')) await window.hwnixActivate(activation.get('target'));
  setInterval(() => refresh().catch(() => {}), 8000);
} catch (error) { notice(error.message, true); $('status').textContent = 'تعذر الاتصال بالخدمة'; }

$('checkPrinter').addEventListener('click', async () => {
  $('checkPrinter').disabled = true; notice('جارٍ فحص Bluetooth والبحث عن الطابعة…');
  try { const result = await api('check-printer', {}); notice(result.message); }
  catch (error) { notice(error.message, true); }
  finally { $('checkPrinter').disabled = false; }
});


function showEditorRow() {
  const selectedRow = $('editorRowPicker').value;
  [...$('textRows').children].forEach((field, index) => { field.hidden = String(index) !== selectedRow; });
  $('codeEditorRow').hidden = selectedRow !== 'code';
}
$('editorRowPicker').addEventListener('change', showEditorRow);
function renderPrinterPicker() {
  if (!state) return;
  $('printerPicker').replaceChildren();
  for (const printer of state.printers || []) {
    const label = printer.bluetoothName || printer.bluetooth;
    $('printerPicker').add(new Option(`${label} · ${printer.modelKey}`, printer.id));
  }
  if (!$('printerPicker').options.length) $('printerPicker').add(new Option('أضف طابعة لبدء الطباعة', ''));
  else $('printerPicker').value = state.activePrinterId;
}
$('printerPicker').addEventListener('change', async event => {
  const id = event.target.value; selectingPrinter = true; updatePrintButtons();
  try { await api('select-printer', { printerId: id }); await refresh(true); updateEditor(); notice('تم اختيار الطابعة. المهام الجديدة ستستخدم هذا الاختيار.'); }
  catch (error) { renderPrinterPicker(); notice(error.message, true); }
  finally { selectingPrinter = false; updatePrintButtons(); }
});
function fillQuickDevices() {
  const previous = $('quickDevices').value; $('quickDevices').replaceChildren(new Option('اختر الجهاز', ''));
  for (const device of devices) $('quickDevices').add(new Option(`${device.name} — ${device.address}`, device.address));
  if (devices.some(device => device.address === previous)) $('quickDevices').value = previous;
}
function fillQuickModels() {
  $('quickModel').replaceChildren();
  const device = devices.find(device => device.address === $('quickDevices').value);
  const preferred = device?.models || [];
  for (const model of state.catalog) $('quickModel').add(new Option(`${preferred.includes(model.key) ? '★ ' : ''}${model.label} — ${model.key}`, model.key));
  if (preferred.includes(state.modelKey)) $('quickModel').value = state.modelKey;
  else if (preferred.length === 1) $('quickModel').value = preferred[0];
  else if (state.modelKey) $('quickModel').value = state.modelKey;
}
$('addPrinter').addEventListener('click', () => { fillQuickDevices(); fillQuickModels(); $('quickPrinterStatus').textContent = ''; $('printerDialog').showModal(); if (!devices.length) $('quickScan').click(); });
$('closePrinterDialog').addEventListener('click', () => $('printerDialog').close());
$('quickDevices').addEventListener('change', fillQuickModels);
$('quickScan').addEventListener('click', async () => {
  $('quickScan').disabled = true; $('saveQuickPrinter').disabled = true; $('quickPrinterStatus').textContent = 'جارٍ البحث…';
  try { devices = (await api('scan', {})).devices; fillQuickDevices(); fillQuickModels(); $('quickPrinterStatus').textContent = devices.length ? 'اختر الجهاز والموديل ثم احفظ.' : 'لم تظهر طابعة. تأكد من تشغيلها وBluetooth ثم ابحث مجددًا.'; if (!devices.length) showMessage('لم يتم العثور على طابعة. شغّل الطابعة وBluetooth وقرّبها من اللابتوب ثم أعد البحث.', 'warning'); }
  catch (error) { $('quickPrinterStatus').textContent = 'تعذر إكمال البحث.'; showMessage(error.message); }
  finally { $('quickScan').disabled = false; $('saveQuickPrinter').disabled = false; }
});
$('saveQuickPrinter').addEventListener('click', async () => {
  if (!$('quickDevices').value) { showMessage('اختر جهازًا من نتيجة البحث أولًا.', 'warning'); return; }
  $('saveQuickPrinter').disabled = true; $('quickScan').disabled = true; selectingPrinter = true; updatePrintButtons();
  try { await api('config', { bluetooth: $('quickDevices').value, modelKey: $('quickModel').value, allowedOrigins: state.allowedOrigins }); await refresh(true); updateEditor(); $('printerDialog').close(); notice('حُفظت الطابعة وأصبحت محددة للطباعة.'); }
  catch (error) { $('quickPrinterStatus').textContent = 'لم يتم حفظ الإعداد.'; showMessage(error.message); }
  finally { $('saveQuickPrinter').disabled = false; $('quickScan').disabled = false; selectingPrinter = false; updatePrintButtons(); }
});
