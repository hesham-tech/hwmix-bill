export function defaultTemplate() {
  return { widthMm: 50, heightMm: 60, paddingMm: 2, gapMm: 1.2,
    rows: [
      { enabled: true, text: 'اسم المنتج', fontPt: 10, bold: true, align: 'center' },
      { enabled: true, text: '75.00 ج.م', fontPt: 10, bold: true, align: 'center' },
      { enabled: true, text: 'SKU-001', fontPt: 8, bold: false, align: 'center' },
      { enabled: false, text: '', fontPt: 8, bold: false, align: 'center' },
    ], code: { enabled: true, type: 'barcode', value: '1000000000', heightMm: 14, showText: true, fontPt: 7 } };
}
export function normalizeTemplate(input) {
  if (!input || !Array.isArray(input.rows) || input.rows.length !== 4) throw new Error('القالب يتكون من أربعة صفوف نصية وصف للرمز.');
  const number = (value, min, max, label) => { const n = Number(value); if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label} يجب أن يكون بين ${min} و${max}.`); return n; };
  const rows = input.rows.map(row => {
    if (typeof row.text !== 'string' || row.text.length > 300 || !['center', 'right', 'left'].includes(row.align)) throw new Error('محتوى أحد الصفوف غير صالح.');
    return { enabled: row.enabled === true, text: row.text, fontPt: number(row.fontPt, 5, 36, 'حجم الخط'), bold: row.bold === true, align: row.align };
  });
  const code = input.code;
  if (!code || !['barcode', 'qr'].includes(code.type) || typeof code.value !== 'string' || code.value.length > 2048) throw new Error('بيانات الباركود أو QR غير صالحة.');
  if (code.enabled && !code.value.trim()) throw new Error('أدخل قيمة الرمز أو عطّل صف الرمز.');
  if (code.enabled && code.type === 'barcode' && !/^[\x20-\x7E]+$/.test(code.value)) throw new Error('CODE128 يدعم أرقامًا وحروفًا لاتينية. استخدم QR للنص العربي.');
  return { widthMm: number(input.widthMm, 10, 110, 'عرض الملصق'), heightMm: number(input.heightMm, 15, 150, 'طول الملصق'),
    paddingMm: number(input.paddingMm, 0, 5, 'الهامش'), gapMm: number(input.gapMm, 0, 5, 'المسافة بين الصفوف'), rows,
    code: { enabled: code.enabled === true, type: code.type, value: code.value, heightMm: number(code.heightMm, 8, 60, 'ارتفاع الرمز'), showText: code.showText === true, fontPt: number(code.fontPt, 5, 16, 'خط قيمة الرمز') } };
}
