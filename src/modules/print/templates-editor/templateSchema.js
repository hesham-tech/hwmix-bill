export const ELEMENT_TYPES = ['text', 'barcode', 'qr', 'image', 'line', 'rect', 'ellipse', 'row'];
export const FONTS = ['Tahoma', 'Arial', 'Noto Sans Arabic'];
export const clone = value => JSON.parse(JSON.stringify(value));
export const mmToDots = (mm, dpi) => Math.round((Number(mm) * dpi) / 25.4);

export function createStarterDesign() {
  const text = (id, content, y, height, fontSize) => ({
    id,
    type: 'text',
    x: 3,
    y,
    width: 44,
    height,
    content,
    fontFamily: 'Tahoma',
    fontSize,
    minFontSize: fontSize,
    bold: true,
    align: 'center',
    direction: 'auto',
    color: '#000000',
    lineHeight: 1.2,
    overflow: 'ellipsis',
    visible: true,
    rotation: 0,
  });
  return {
    schemaVersion: 1,
    widthMm: 50,
    heightMm: 60,
    marginMm: 1,
    background: '#ffffff',
    sheet: {
      columns: 3,
      rows: 4,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      gapX: 2,
      gapY: 2,
      orientation: 'portrait',
      direction: 'ltr',
    },
    elements: [
      text('company', '{{company.name}}', 14, 4, 7),
      text('name', '{{product.name}}', 18, 8, 10.5),
      text('price', '{{variant.retail_price}} ج.م', 26, 5, 9),
      {
        id: 'barcode',
        type: 'barcode',
        x: 3,
        y: 32,
        width: 44,
        height: 11,
        field: 'variant.barcode',
        format: 'CODE128',
        showText: true,
        fontSize: 7.8,
        fontFamily: 'Tahoma',
        visible: true,
        rotation: 0,
      },
      text('sku', '{{variant.sku}}', 47, 4, 6.4),
    ],
  };
}

export const SAMPLE_VALUES = Object.freeze({
  'company.currency': 'ج.م',
  'company.name': 'هونكس ساس',
  'company.address': 'القاهرة',
  'company.phone': '01000000000',
  'company.website': 'https://bill.hwnix.com',
  'company.tax_number': '123456789',
  'product.name': 'منتج 1 ملابس جاهزة',
  'product.description': 'وصف المنتج التجريبي',
  'product.description_long': 'منتج عالي الجودة، متاح بعدة مقاسات وألوان.',
  'product.category': 'الملابس الجاهزة',
  'product.brand': 'علامة تجريبية',
  'product.type': 'physical',
  'variant.sku': 'SKU-FKL2LLV0',
  'variant.barcode': '1000000000',
  'variant.retail_price': 75,
  'variant.wholesale_price': 65,
  'variant.purchase_price': 50,
  'variant.attributes': 'اللون: أزرق — المقاس: كبير',
  'variant.discount': 0,
  'variant.tax': 14,
  'variant.weight': 0.25,
  'variant.dimensions': '10 × 20 × 5',
  'unit.name': 'قطعة',
  'unit.conversion_factor': 1,
  'unit.price': 75,
  'invoice.unit_price': 70,
  'invoice.number': 'INV-12345',
  'invoice.date': '2026-10-28',
  'print.date': '2026-10-28',
});

export function newElement(type, field = '') {
  if (!ELEMENT_TYPES.includes(type)) throw new Error('نوع العنصر غير مدعوم.');
  return {
    id: crypto.randomUUID(),
    type,
    x: 4,
    y: 4,
    width: type === 'qr' || type === 'image' ? 20 : 35,
    height: type === 'line' ? 0.4 : ['qr', 'image', 'barcode', 'ellipse', 'rect'].includes(type) ? 18 : 8,
    rotation: 0,
    visible: true,
    locked: false,
    groupId: null,
    fontFamily: 'Tahoma',
    fontSize: 9,
    minFontSize: 7,
    lineHeight: 1.2,
    bold: true,
    align: 'center',
    direction: 'auto',
    color: '#000000',
    fill: '#ffffff',
    strokeWidth: 0.3,
    overflow: 'shrink',
    valueFormat: 'text',
    showText: true,
    format: 'CODE128',
    content: type === 'text' ? (field ? `{{${field}}}` : 'نص جديد') : '',
    field: type === 'text' ? '' : field,
  };
}

export function elementBounds(element) {
  const angle = (Number(element.rotation || 0) * Math.PI) / 180;
  const w = Number(element.width),
    h = Number(element.height),
    cx = Number(element.x) + w / 2,
    cy = Number(element.y) + h / 2;
  const width = Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h;
  const height = Math.abs(Math.sin(angle)) * w + Math.abs(Math.cos(angle)) * h;
  return { left: cx - width / 2, top: cy - height / 2, right: cx + width / 2, bottom: cy + height / 2 };
}

export function validateDesign(design, { geometry, sheet = false, startCell = 1, allowEmpty = false, allowOverflow = false } = {}) {
  if (
    ![1, 2].includes(design?.schemaVersion) ||
    !Array.isArray(design.elements) ||
    (!allowEmpty && !design.elements.length) ||
    design.elements.length > 100
  )
    throw new Error('بنية قالب الملصق غير مدعومة.');
  if (
    design.schemaVersion === 2 &&
    !allowEmpty &&
    !design.elements.some(
      e => e.type !== 'row' && e.visible !== false && (!e.parentId || design.elements.find(r => r.id === e.parentId)?.visible !== false)
    )
  )
    throw Error('أضف محتوى ظاهرًا إلى الملصق قبل النشر أو الطباعة.');
  const width = Number(design.widthMm),
    height = Number(design.heightMm);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 5 || width > 210 || height < 5 || height > 1000)
    throw new Error('مقاس الملصق غير صالح.');
  const printableWidth = geometry ? Math.min(width, (geometry.widthDots * 25.4) / geometry.dpi) : width;
  const left = (width - printableWidth) / 2;
  const ids = new Set();
  for (const e of design.elements) {
    if (!e.id || ids.has(e.id) || !ELEMENT_TYPES.includes(e.type)) throw new Error('يوجد عنصر غير صالح أو معرّف مكرر.');
    ids.add(e.id);
    if (![e.x, e.y, e.width, e.height, e.rotation || 0].every(v => Number.isFinite(Number(v))) || Number(e.width) <= 0 || Number(e.height) <= 0)
      throw new Error('أبعاد عنصر غير صالحة.');
    if (['text', 'barcode'].includes(e.type) && !FONTS.includes(e.fontFamily || 'Tahoma')) throw new Error('خط غير مدعوم.');
    if (['barcode', 'qr'].includes(e.type) && Number(e.rotation || 0) % 90 !== 0) throw new Error('دوران الرموز يكون بمضاعفات 90 درجة.');
    if (e.type === 'row' && (design.schemaVersion !== 2 || Number(e.rotation || 0) !== 0 || e.parentId))
      throw Error('الصفوف المتداخلة أو المدورة غير مدعومة.');
    if (e.parentId && !design.elements.some(r => r.id === e.parentId && r.type === 'row')) throw Error('صف العنصر غير موجود.');
    if (e.visible === false || e.parentId) continue;
    const bounds = elementBounds(e);
    if (!allowOverflow && (bounds.left < left - 0.02 || bounds.top < -0.02 || bounds.right > width - left + 0.02 || bounds.bottom > height + 0.02))
      throw new Error('عنصر يتجاوز المساحة القابلة للطباعة. عدّل موضعه أو حجمه؛ لن يُصغّر القالب تلقائيًا.');
  }
  if (sheet) validateSheet(design, startCell);
  return true;
}

export function validateSheet(design, startCell = 1) {
  const s = design.sheet;
  if (!s || !Number.isInteger(Number(s.columns)) || !Number.isInteger(Number(s.rows)) || s.columns < 1 || s.rows < 1 || s.columns > 30 || s.rows > 60)
    throw new Error('عدد صفوف أو أعمدة A4 غير صالح.');
  if (![s.marginLeft, s.marginTop, s.gapX, s.gapY].every(v => Number.isFinite(Number(v)) && Number(v) >= 0))
    throw new Error('هوامش أو فواصل A4 غير صالحة.');
  const right = Number(s.marginRight ?? s.marginLeft),
    bottom = Number(s.marginBottom ?? s.marginTop);
  if (![right, bottom].every(v => Number.isFinite(v) && v >= 0)) throw new Error('هوامش A4 غير صالحة.');
  const pageWidth = s.orientation === 'landscape' ? 297 : 210,
    pageHeight = s.orientation === 'landscape' ? 210 : 297;
  if (
    Number(s.marginLeft) + right + s.columns * design.widthMm + (s.columns - 1) * s.gapX > pageWidth + 0.01 ||
    Number(s.marginTop) + bottom + s.rows * design.heightMm + (s.rows - 1) * s.gapY > pageHeight + 0.01
  )
    throw new Error('شبكة الملصقات تتجاوز حدود ورقة A4.');
  if (!Number.isInteger(Number(startCell)) || startCell < 1 || startCell > s.columns * s.rows) throw new Error('خانة بدء الطباعة خارج شبكة A4.');
  return true;
}

export function sheetPlacements(design, count, startCell = 1) {
  validateSheet(design, startCell);
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('عدد الملصقات يجب أن يكون بين 1 و100.');
  const s = design.sheet,
    cells = s.columns * s.rows;
  return Array.from({ length: count }, (_, i) => {
    const n = Number(startCell) - 1 + i,
      cell = n % cells;
    const column = s.direction === 'rtl' ? s.columns - 1 - (cell % s.columns) : cell % s.columns;
    return {
      page: Math.floor(n / cells),
      x: Number(s.marginLeft) + column * (Number(design.widthMm) + Number(s.gapX)),
      y: Number(s.marginTop) + Math.floor(cell / s.columns) * (Number(design.heightMm) + Number(s.gapY)),
    };
  });
}

export function designWarnings(design) {
  const result = [];
  if (design.elements.some(e => e.visible !== false && ['text', 'barcode'].includes(e.type) && Number(e.fontSize || 9) < 7))
    result.push('بعض النصوص أصغر من 7 نقاط؛ قد يقل وضوحها على الطابعة الحرارية.');
  return result;
}
