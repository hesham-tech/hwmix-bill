/**
 * ملف اختبارات وحدة للتحقق من معمارية نظام الإشعارات الجديد (NotificationManager).
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const assert = require('assert');

// 1. إعداد الـ Mocks لمكتبة vue3-toastify لمنع تعطل الاختبارات في بيئة Node.js
const mockToastCalls = [];
const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  if (request === 'vue3-toastify') {
    const toastMock = (message, options) => {
      mockToastCalls.push({ method: 'notify', message, options });
      return options.toastId || 'mock-uuid-1';
    };
    toastMock.success = (msg, opts) => mockToastCalls.push({ method: 'success', message: msg, options: opts });
    toastMock.error = (msg, opts) => mockToastCalls.push({ method: 'error', message: msg, options: opts });
    toastMock.warning = (msg, opts) => mockToastCalls.push({ method: 'warning', message: msg, options: opts });
    toastMock.info = (msg, opts) => mockToastCalls.push({ method: 'info', message: msg, options: opts });
    toastMock.clearAll = () => mockToastCalls.push({ method: 'clearAll' });
    toastMock.dismiss = (id) => mockToastCalls.push({ method: 'dismiss', id });
    toastMock.update = (id, opts) => mockToastCalls.push({ method: 'update', id, options: opts });
    
    return { toast: toastMock };
  }
  if (request === 'vue3-toastify/dist/index.css') {
    return {};
  }
  return originalLoad.apply(this, arguments);
};

// 2. قراءة كلاس NotificationManager الأصلي وتحويل صيغة ESM إلى CommonJS للتشغيل في بيئة الاختبارات
const originalCodePath = path.join(__dirname, '../src/services/notificationManager.js');
let code = fs.readFileSync(originalCodePath, 'utf8');

// تحويل الاستيراد والتصدير برمجياً
code = code.replace(/import\s+{(.*?)}\s+from\s+['"]vue3-toastify['"];?/g, "const {$1} = require('vue3-toastify');");
code = code.replace(/import\s+['"]vue3-toastify\/dist\/index\.css['"];?/g, "// CSS Mocked");
code = code.replace(/export\s+default\s+notificationManager;?/g, "module.exports = { notificationManager, default: notificationManager };");
code = code.replace(/export\s+{\s*notificationManager\s*};?/g, "// Export Mocked");

// حفظ الكود المحول في ملف مؤقت داخل مجلد scratch للاستيراد
const tempDir = path.join('C:\\Users\\hesham-mohamed\\.gemini\\antigravity\\brain\\c0b49ccf-8b63-47b0-8a55-4ddac032304e\\scratch');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
const tempPath = path.join(tempDir, 'notificationManager.mock.cjs');
fs.writeFileSync(tempPath, code, 'utf8');

// 3. استيراد كلاس المدير المهيأ للاختبار
const { notificationManager } = require(tempPath);

console.log('🧪 بدء اختبارات نظام الإشعارات الجديد (NotificationManager)...');

// اختبار 1: إطلاق إشعار نجاح بسيط
const id1 = notificationManager.success('تمت العملية بنجاح');
assert.ok(id1, 'يجب أن يعيد معرف التنبيه بنجاح');
assert.strictEqual(mockToastCalls.length, 1);
assert.strictEqual(mockToastCalls[0].method, 'notify'); // يمر عبر notify أولاً
assert.strictEqual(mockToastCalls[0].message, 'تمت العملية بنجاح');
assert.strictEqual(notificationManager.getHistory().length, 1);
console.log('✅ [نجح]: إرسال التنبيه الفعلي وتخزينه في التاريخ');

// اختبار 2: التحقق من حظر التنبيهات المكررة (Deduplication)
mockToastCalls.length = 0;
const id2 = notificationManager.success('تنبيه مكرر', { deduplicate: true });
const id3 = notificationManager.success('تنبيه مكرر', { deduplicate: true });
assert.ok(id2, 'التنبيه الأول يجب أن يعود بمعرف');
assert.strictEqual(id3, null, 'التنبيه المكرر فوراً يجب أن يتم حجبه ويعود بـ null');
assert.strictEqual(mockToastCalls.length, 1, 'يجب إرسال تنبيه واحد فقط للمكتبة');
console.log('✅ [نجح]: حجب التنبيه المكرر بنجاح خلال مهلة debounce');

// اختبار 3: التنبيهات الحرجة وخصائصها
mockToastCalls.length = 0;
notificationManager.error('خطأ فادح في النظام', { severity: 'critical', domain: 'system' });
assert.strictEqual(mockToastCalls.length, 1);
assert.strictEqual(mockToastCalls[0].options.autoClose, false, 'الأخطاء الحرجة يجب ألا تغلق تلقائياً (autoClose = false)');
console.log('✅ [نجح]: التنبيه الحرج لا يغلق تلقائياً');

// اختبار 4: اختبار الـ Promises والتحول من التحميل إلى النجاح/الفشل
mockToastCalls.length = 0;
const myPromise = new Promise((resolve) => setTimeout(resolve, 50));
notificationManager.promise(myPromise, {
  loading: 'جاري الحفظ...',
  success: 'تم الحفظ بنجاح',
  error: 'فشل الحفظ'
}).then(() => {
  // التحقق من إشعار التحميل
  const loadingCall = mockToastCalls.find(c => c.options.type === 'default');
  assert.ok(loadingCall, 'يجب عرض إشعار تحميل مبدئي');
  assert.strictEqual(loadingCall.options.autoClose, false, 'إشعار التحميل يجب ألا يغلق تلقائياً');

  // التحقق من تحديث الإشعار بعد انتهاء الـ Promise
  const updateCall = mockToastCalls.find(c => c.method === 'update');
  assert.ok(updateCall, 'يجب استدعاء دالة التحديث (update) بعد نجاح الـ Promise');
  assert.strictEqual(updateCall.options.type, 'success');
  assert.strictEqual(updateCall.options.render, 'تم الحفظ بنجاح');
  
  console.log('✅ [نجح]: تحديث إشعار الـ Promise بعد النجاح بنجاح');
  
  runRemainingTests();
}).catch(err => {
  console.error('❌ فشل اختبار الـ Promise:', err);
  process.exit(1);
});

function runRemainingTests() {
  // اختبار 5: مسح الإشعارات وتصفير الحالة
  mockToastCalls.length = 0;
  notificationManager.clear();
  assert.strictEqual(mockToastCalls.length, 1);
  assert.strictEqual(mockToastCalls[0].method, 'clearAll');
  
  const history = notificationManager.getHistory();
  assert.ok(history.every(item => item.status === 'dismissed'), 'حالة كافة العناصر في التاريخ يجب أن تتحول لـ dismissed');
  console.log('✅ [نجح]: مسح وإلغاء كافة الإشعارات الفعالة وتحديث التاريخ');

  // تنظيف الملف المؤقت
  try {
    fs.unlinkSync(tempPath);
  } catch (e) {}

  console.log('\n📊 ملخص الاختبارات: نجح جميع الاختبارات بنجاح تام! 🎉');
  process.exit(0);
}
