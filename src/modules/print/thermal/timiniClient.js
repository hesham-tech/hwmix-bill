const BASE_URL = 'http://127.0.0.1:19191';
const STORAGE_KEY = 'hwnix.timini.settings.v1';
const DEVICE_KEYS = ['destination','heightMm','paper','darkness','token','bluetoothName','modelKey','widthDots','dpi','paperOptions'];
const deviceSettings = settings => Object.fromEntries(DEVICE_KEYS.filter(key => settings[key] !== undefined).map(key => [key,settings[key]]));

export function loadLabelSettings() {
  const defaults = { destination: 'browser', heightMm: 60, paper: 'tag_384r', darkness: 3, token: '' };
  try { return { ...defaults, ...deviceSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) }; }
  catch { return defaults; }
}

export function saveLabelSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deviceSettings(settings)));
}

async function request(path, settings, options = {}) {
  if (!/^[a-f0-9]{64}$/i.test(settings.token || '')) throw new Error('افتح أداة HWNiX Print Bridge وانسخ رمز الربط إلى هذه الخانة.');
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'X-Print-Token': settings.token, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error('تعذر الوصول لخدمة الطباعة. شغّل HWNiX Print Bridge من قائمة ابدأ وتحقق من السماح لهذا الموقع بالوصول المحلي. إذا أرسلت طلبًا بالفعل فافحص الطابعة قبل إعادة الإرسال.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'فشل طلب الطباعة المحلية.');
  return result;
}

export async function checkTiMini(settings) {
  const health = await request('/health', settings);
  if (health.service !== 'hwnix-timini' || health.version !== 1) throw new Error('خدمة طباعة غير متوافقة.');
  if (!health.cliReady) throw new Error('ملف TiMini CLI غير موجود؛ أعد تشغيل إعداد خدمة الطباعة.');
  if (health.configured === false) throw new Error('افتح أداة HWNiX Print Bridge واختر الطابعة واحفظ الإعداد أولًا.');
  return health;
}

export async function submitTiMiniPdf(pdf, count, settings) {
  await checkTiMini(settings);
  const id = crypto.randomUUID();
  let job = await request('/jobs', settings, {
    method: 'POST', body: JSON.stringify({ id, pdf, count, paper: settings.paper, darkness: Number(settings.darkness) }),
  });
  const deadline = Date.now() + Math.max(11 * 60_000, count * 15_000 + 180_000);
  while (['queued', 'checking', 'printing'].includes(job.status)) {
    if (Date.now() > deadline) throw new Error('لم تتأكد نتيجة الطلب. افحص الطابعة قبل إعادة الطباعة لتجنب التكرار.');
    await new Promise(resolve => setTimeout(resolve, 750));
    job = await request(`/jobs/${id}`, settings);
  }
  if (job.status !== 'succeeded') throw new Error(job.error || 'تعذر إكمال الطباعة. افحص الطابعة قبل إعادة الإرسال.');
  return job;
}

export async function previewTiMiniPdf(pdf, count, settings) {
  const health = await checkTiMini(settings);
  if (!health.nativePreview) throw new Error('حدّث أداة HWNiX إلى الإصدار 1.1 أو أحدث للمعاينة داخل البرنامج.');
  return await request('/handoff', settings, { method: 'POST', body: JSON.stringify({ id: crypto.randomUUID(), pdf, count, paper: settings.paper, darkness: Number(settings.darkness) }) });
}
