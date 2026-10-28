import { useUserStore } from '@/stores/user';
import { labelTemplateService as api } from './labelTemplate.service';
import { templatePdf } from './templateRenderer';
import { createAssetLoader } from './templateAssets';
import { checkTiMini, submitTiMiniPdf, previewTiMiniPdf, saveLabelSettings } from '../thermal/timiniClient';

export async function printTemplateLabels(rows, settings) {
  const companyId = useUserStore().currentCompany?.id;
  if (!settings.templateId || !settings.revisionId || settings.companyId !== companyId) throw Error('اختر قالبًا منشورًا للشركة الحالية.');
  const items = rows
    .filter(r => Number(r.quantity) > 0)
    .map(r => ({ variant_id: r.variant_id, invoice_item_id: r.invoice_item_id, unit_id: r.unit_id || undefined, quantity: Number(r.quantity) }));
  if (!items.length || items.some(r => !Number.isInteger(r.quantity)) || items.reduce((sum, r) => sum + r.quantity, 0) > 100)
    throw Error('اختر من 1 إلى 100 ملصق بكميات صحيحة.');
  const destination = settings.destination,
    layout = settings.layout || 'roll',
    native = ['timini', 'timini-preview'].includes(destination);
  if (!['browser', 'pdf', 'timini', 'timini-preview'].includes(destination)) throw Error('اختر طريقة الطباعة.');
  if (layout === 'a4' && native) throw Error('طباعة A4 متاحة عبر المتصفح أو PDF، ولا تُرسل إلى طابعة الملصقات.');
  const snapshot = await api.prepare({ template_id: settings.templateId, revision_id: settings.revisionId, items });
  let geometry;
  if (native) {
    const health = await checkTiMini(settings);
    geometry = health.geometry;
    if (!geometry?.widthDots || !geometry?.dpi) throw Error('تعذر تحديد عرض رأس الطابعة ودقتها. أعد فحص الخدمة.');
    if (!health.paperOptions?.some(p => p.value === settings.paper)) throw Error('نوع الورق المختار غير مدعوم للطابعة الحالية.');
  }
  const design = { ...snapshot.design, sheet: settings.sheetOverrides || snapshot.design.sheet };
  const result = await templatePdf(design, snapshot.records, {
    layout,
    startCell: Number(settings.startCell || 1),
    geometry,
    monochrome: layout === 'a4' ? settings.monochrome !== false : true,
    loadImage: createAssetLoader(),
  });
  if (snapshot.company_id !== companyId || useUserStore().currentCompany?.id !== companyId)
    throw Error('تغيرت الشركة أثناء تجهيز الطلب؛ لم يُرسل للطباعة. افتح النافذة مجددًا.');
  const complete = message =>
    message + (result.warnings?.length ? '\nملاحظات الجودة: ' + [...new Set(result.warnings.map(i => `${i.product}: ${i.message}`))].join('؛ ') : '');
  saveLabelSettings(settings);
  if (destination === 'pdf') {
    const url = URL.createObjectURL(result.blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'hwnix-product-labels.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return complete('تم تنزيل ملف الملصقات بالقالب المختار.');
  }
  if (native) {
    if (destination === 'timini-preview') {
      await previewTiMiniPdf(result.base64, result.count, settings);
      return complete('أُرسلت الملصقات للمعاينة داخل HWNiX. ابدأ الطباعة من البرنامج بعد مراجعتها.');
    }
    await submitTiMiniPdf(result.base64, result.count, settings);
    return complete('اكتمل إرسال الملصقات. تحقق من خروجها وقراءة الباركود.');
  }
  const url = URL.createObjectURL(result.blob),
    frame = document.createElement('iframe');
  frame.title = 'طباعة ملصقات المنتجات';
  frame.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;border:0;opacity:0';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
      reject(Error('تعذر فتح معاينة الطباعة. جرّب تنزيل PDF.'));
    }, 20000);
    frame.onload = () => {
      clearTimeout(timer);
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        resolve();
      } catch (e) {
        reject(Error('المتصفح لا يدعم طباعة PDF مباشرة هنا. اختر تنزيل PDF.'));
      } finally {
        setTimeout(() => {
          frame.remove();
          URL.revokeObjectURL(url);
        }, 60000);
      }
    };
    frame.src = url;
    document.body.append(frame);
  });
  return complete('تم فتح طباعة الملصقات بالقالب المختار. استخدم حجمًا فعليًا بنسبة 100%.');
}
