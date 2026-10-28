export const MAX_LABELS = 100;
export const LABEL_SIZES = [
  { title: '50 × 60 مم', value: 60 },
  { title: '50 × 30 مم', value: 30 },
  { title: '50 × 20 مم', value: 20 },
];

export function normalizeLabels(rows) {
  const labels = [];
  for (const row of rows) {
    const quantity = Number(row.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_LABELS) throw new Error('عدد الملصقات يجب أن يكون عددًا صحيحًا من 0 إلى 100.');
    if (!quantity) continue;
    const barcode = String(row.barcode ?? '').trim();
    // Never invent a fallback barcode or silently truncate an unprintable value.
    if (!barcode || !/^[\x20-\x7E]+$/.test(barcode)) throw new Error(`المنتج «${row.productName || ''}» يحتاج باركود أو كود صنف صالحًا للطباعة بنظام CODE128.`);
    const price = Number(row.price ?? 0);
    if (!Number.isFinite(price) || price < 0) throw new Error('سعر المنتج غير صالح.');
    if (labels.length + quantity > MAX_LABELS) throw new Error('الحد الأقصى 100 ملصق للطلب الواحد.');
    for (let i = 0; i < quantity; i++) labels.push({ productName: String(row.productName || 'منتج'), barcode, sku: String(row.sku || ''), price });
  }
  if (!labels.length) throw new Error('اختر ملصقًا واحدًا على الأقل.');
  return labels;
}

export function validateLabelOptions(options) {
  if (!LABEL_SIZES.some(size => size.value === Number(options.heightMm))) throw new Error('مقاس الملصق غير صالح.');
  const papers = Array.isArray(options.paperOptions) && options.paperOptions.length ? options.paperOptions.map(paper => paper.value) : ['tag_384r', 'plain_384r', 'blacktag_384r'];
  if (!papers.includes(options.paper)) throw new Error('اختر نوع الورق الذي يدعمه تعريف الطابعة.');
  if (!Number.isInteger(Number(options.darkness)) || Number(options.darkness) < 1 || Number(options.darkness) > 5) throw new Error('درجة السواد يجب أن تكون من 1 إلى 5.');
}

export function labelGeometry(options) {
  const selectedPaper = options.paperOptions?.find(paper => paper.value === options.paper);
  const widthDots = Number(selectedPaper?.widthDots ?? options.widthDots ?? 384);
  const dpi = Number(selectedPaper?.dpi ?? options.dpi ?? 203);
  if (!Number.isInteger(widthDots) || widthDots < 64 || widthDots > 2048 || !Number.isFinite(dpi) || dpi < 100 || dpi > 600) throw new Error('أبعاد الطابعة غير صالحة. أعد فحص خدمة الطباعة.');
  return { widthDots, dpi, widthMm: widthDots * 25.4 / dpi };
}
