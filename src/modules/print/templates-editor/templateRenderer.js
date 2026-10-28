import { formatPrice, priceField } from './priceFormat';
import { resolveFlexLayout, overlapIssues } from './flexLayout';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import { mmToDots, validateDesign, sheetPlacements } from './templateSchema';

function canvasOf(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width * height > 16_000_000 || width < 0 || height < 0)
    throw new Error('مساحة الرسم كبيرة جدًا أو أبعادها غير صالحة. قلل المقاس أو دقة الإخراج.');
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

const fontWeight = element => (element.type === 'barcode' ? (element.bold === false ? 400 : 700) : element.bold ? 700 : 400);

function availableFont(font, weight) {
  if (font === 'Noto Sans Arabic') return document.fonts.check(`${weight} 12px "Noto Sans Arabic"`, 'مرحبا ABC0123');
  const ctx = canvasOf(1, 1).getContext('2d');
  const sample = 'mmmmmmmmmmWWiiiiمرحبا';
  return ['monospace', 'serif', 'sans-serif'].some(base => {
    ctx.font = `72px ${base}`;
    const baseline = ctx.measureText(sample).width;
    ctx.font = `72px "${font}", ${base}`;
    return Math.abs(ctx.measureText(sample).width - baseline) > 0.01;
  });
}

async function loadFont(element) {
  const font = element.fontFamily || 'Tahoma';
  const weight = fontWeight(element);
  if (document.fonts) await document.fonts.load(`${weight} 20px "${font}"`, 'مرحبا المنتج السعر ABC0123456789');
  if (!availableFont(font, weight)) throw new Error(`الخط «${font}» غير متاح على هذا الجهاز. اختر خطًا متاحًا من المحرر؛ لن يُستبدل الخط تلقائيًا.`);
}

function valueText(value, element) {
  if (value === null || value === undefined) return '';
  if (element.valueFormat === 'date') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat('ar-EG').format(d);
  }
  if (['number', 'money'].includes(element.valueFormat) && Number.isFinite(Number(value)))
    return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: element.valueFormat === 'money' ? 2 : 0, maximumFractionDigits: 2 }).format(
      Number(value)
    );
  return String(value);
}

export function textFor(element, values) {
  let content = element.content || '';
  if (element.field) content = valueText(values[element.field], element);
  else content = content.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, key) => valueText(values[key], element));
  if (element.priceFormat) {
    const field = priceField(element);
    if (!field) throw Error('تنسيق السعر يحتاج حقلًا ماليًا.');
    const formatted = formatPrice(values[field], element.priceFormat, values);
    content = element.field
      ? formatted
      : (element.content || '').replace(/\{\{([\w.-]+)\}\}/g, (_, key) => (key === field ? formatted : valueText(values[key], element)));
  }
  return `${element.prefix || ''}${content}${element.suffix || ''}`;
}

function symbolValue(element, values) {
  const references = element.field ? [element.field] : [...(element.content || '').matchAll(/\{\{([a-zA-Z0-9_.-]+)\}\}/g)].map(match => match[1]);
  if (references.some(key => values[key] === null || values[key] === undefined || String(values[key]).trim() === ''))
    throw new Error('أحد حقول الرمز فارغ؛ أكمل بيانات المنتج أو اختر حقلًا آخر.');
  return textFor({ ...element, valueFormat: 'text' }, values);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      // Split long words at grapheme boundaries to avoid breaking combining marks.
      const characters =
        typeof Intl.Segmenter === 'function'
          ? [...new Intl.Segmenter('ar', { granularity: 'grapheme' }).segment(word)].map(s => s.segment)
          : Array.from(word);
      for (const character of characters) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderElement(element, values, { dpi = 203, loadImage } = {}) {
  if (
    ['text', 'barcode'].includes(element.type) &&
    ![element.fontSize ?? 9, element.minFontSize ?? 7].every(v => Number.isFinite(Number(v)) && Number(v) >= 3 && Number(v) <= 150)
  )
    throw new Error('حجم الخط يجب أن يكون بين 3 و150 نقطة.');
  const width = mmToDots(element.width, dpi),
    height = mmToDots(element.height, dpi);
  const canvas = canvasOf(width, height),
    ctx = canvas.getContext('2d');
  ctx.fillStyle = element.color || '#000000';
  if (['text', 'barcode'].includes(element.type)) await loadFont(element);
  if (element.type === 'text') {
    const content = textFor(element, values);
    let size = Number(element.fontSize || 9),
      lines,
      lineHeight,
      topOffset = 0;
    const min = Math.min(size, Number(element.minFontSize || 7));
    const atomic = !!element.priceFormat || (element.strictFit && !!priceField(element));
    do {
      const px = (size * dpi) / 72;
      ctx.font = `${element.bold ? 700 : 400} ${px}px "${element.fontFamily || 'Tahoma'}"`;
      ctx.textBaseline = 'top';
      const metrics = ctx.measureText(content.replace(/\r?\n/g, ' '));
      topOffset = Math.max(0, metrics.actualBoundingBoxAscent || 0);
      lineHeight = Math.max(px * Number(element.lineHeight || 1.2), (metrics.actualBoundingBoxDescent || 0) + topOffset + 1);
      lines = atomic ? [content] : wrapText(ctx, content, canvas.width - 2);
      if (
        (!atomic && element.overflow !== 'shrink') ||
        (lines.length * lineHeight <= canvas.height && (!atomic || ctx.measureText(content).width <= canvas.width - 2)) ||
        size <= min
      )
        break;
      size = Math.max(min, size - 0.25);
    } while (true);
    if (content && lineHeight > canvas.height + 0.1)
      throw new Error('ارتفاع حقل النص لا يكفي لحجم الخط المحدد. زد ارتفاعه أو قلل حجم الخط والحد الأدنى.');
    const maxLines = Math.max(1, Math.floor(canvas.height / lineHeight));
    if (lines.length > maxLines || ctx.measureText(lines.at(-1) || '').width > canvas.width - 2) {
      if (atomic || element.strictFit) throw Error('المحتوى لا يتسع دون اختصار؛ وسّع العنصر أو الصف أو قلّل حجم الخط والحد الأدنى.');
      lines = lines.slice(0, maxLines);
      let tail = lines.at(-1) || '';
      while (tail && ctx.measureText(`${tail}…`).width > canvas.width - 2) tail = tail.slice(0, -1);
      lines[lines.length - 1] = `${tail}…`;
    }
    ctx.textBaseline = 'top';
    ctx.textAlign = element.align || 'center';
    ctx.direction = element.direction === 'auto' || !element.direction ? (/[\u0600-\u06ff]/.test(content) ? 'rtl' : 'ltr') : element.direction;
    const x = ctx.textAlign === 'center' ? canvas.width / 2 : ctx.textAlign === 'right' ? canvas.width - 1 : 1;
    if (size < Number(element.fontSize || 9))
      canvas.labelWarnings = [
        { elementId: element.id, message: `صُغّر الخط من ${element.fontSize} إلى ${size} نقطة لاحتواء المحتوى.`, severity: 'warning' },
      ];
    lines.forEach((line, i) => ctx.fillText(line, x, Math.round(i * lineHeight + topOffset)));
  } else if (element.type === 'barcode') {
    const value = symbolValue(element, values);
    if (value === null || value === undefined || String(value) === '') throw new Error('حقل الباركود فارغ؛ اختر حقلًا صالحًا أو قالبًا آخر.');
    const caption = element.showText === false ? 0 : Math.ceil(((Number(element.fontSize || 7.8) * dpi) / 72) * 1.35);
    const barHeight = canvas.height - caption;
    if (barHeight < mmToDots(5, dpi)) throw new Error('ارتفاع الباركود أصغر من الحد المقروء.');
    const minModule = Math.max(2, Math.ceil((dpi * 0.2) / 25.4)),
      preferred = Math.max(minModule, Math.round((dpi * 0.375) / 25.4));
    let symbol;
    for (let module = preferred; module >= minModule; module--) {
      symbol = canvasOf(1, 1);
      try {
        JsBarcode(symbol, String(value), {
          format: element.format || 'CODE128',
          width: module,
          height: barHeight,
          displayValue: false,
          margin: 0,
          marginLeft: 10 * module,
          marginRight: 10 * module,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch {
        throw new Error('قيمة الباركود لا تتوافق مع نوع الرمز المحدد.');
      }
      if (symbol.width <= canvas.width) break;
    }
    if (symbol.width > canvas.width) throw new Error('الباركود أطول من المساحة المتاحة بدقة مقروءة. وسّع العنصر أو استخدم كودًا أقصر.');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(symbol, Math.floor((canvas.width - symbol.width) / 2), 0);
    if (caption) {
      ctx.font = `${fontWeight(element)} ${(Number(element.fontSize || 7.8) * dpi) / 72}px "${element.fontFamily || 'Tahoma'}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.direction = 'ltr';
      ctx.fillStyle = '#000000';
      if (ctx.measureText(String(value)).width > canvas.width) throw new Error('أرقام الباركود تتجاوز عرض العنصر.');
      ctx.fillText(String(value), canvas.width / 2, barHeight + 1);
    }
  } else if (element.type === 'qr') {
    const value = symbolValue(element, values);
    if (value === null || value === undefined || String(value) === '') throw new Error('حقل QR فارغ.');
    const qr = QRCode.create(String(value), { errorCorrectionLevel: 'M' }),
      count = qr.modules.size;
    const module = Math.floor(Math.min(canvas.width, canvas.height) / (count + 8));
    if (module < Math.max(2, Math.ceil((dpi * 0.2) / 25.4))) throw new Error('مساحة QR صغيرة جدًا للبيانات المدخلة.');
    const size = (count + 8) * module,
      x = Math.floor((canvas.width - size) / 2),
      y = Math.floor((canvas.height - size) / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#000000';
    for (let row = 0; row < count; row++)
      for (let col = 0; col < count; col++)
        if (qr.modules.get(row, col)) ctx.fillRect(x + (col + 4) * module, y + (row + 4) * module, module, module);
  } else if (element.type === 'image') {
    const value = element.field ? values[element.field] : null;
    if (element.mediaId || value) {
      if (!loadImage) throw new Error('تعذر تحميل صور القالب.');
      const image = await loadImage(value, element);
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      ctx.drawImage(
        image,
        Math.round((canvas.width - image.width * scale) / 2),
        Math.round((canvas.height - image.height * scale) / 2),
        Math.round(image.width * scale),
        Math.round(image.height * scale)
      );
    }
  } else {
    const stroke = Math.max(1, mmToDots(element.strokeWidth || 0.3, dpi));
    ctx.strokeStyle = element.color || '#000000';
    ctx.lineWidth = stroke;
    ctx.fillStyle = element.fill || '#ffffff';
    if (element.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(stroke / 2, canvas.height / 2);
      ctx.lineTo(canvas.width - stroke / 2, canvas.height / 2);
      ctx.stroke();
    } else if (element.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        Math.max(0.1, (canvas.width - stroke) / 2),
        Math.max(0.1, (canvas.height - stroke) / 2),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(stroke / 2, stroke / 2, canvas.width - stroke, canvas.height - stroke);
      ctx.strokeRect(stroke / 2, stroke / 2, canvas.width - stroke, canvas.height - stroke);
    }
  }
  return canvas;
}

export async function prepareTemplateLayout(design, values, { dpi = 203 } = {}) {
  if (design.schemaVersion !== 2) return { design, issues: [] };
  const result = await resolveFlexLayout(design, values, async e => {
    if (e.type !== 'text') return { width: e.width };
    await loadFont(e);
    const ctx = canvasOf(1, 1).getContext('2d');
    ctx.font = `${e.bold ? 700 : 400} ${(Number(e.fontSize || 9) * dpi) / 72}px "${e.fontFamily || 'Tahoma'}"`;
    return { width: ((Math.ceil(ctx.measureText(textFor(e, values)).width) + 2) * 25.4) / dpi };
  });
  for (const e of result.design.elements.filter(e => e.visible !== false && e.type !== 'row')) {
    if (priceField(e)) e.strictFit = true;
    const refs = e.field ? [e.field] : [...(e.content || '').matchAll(/\{\{([\w.-]+)\}\}/g)].map(m => m[1]);
    for (const key of refs)
      if (values[key] === null || values[key] === undefined || String(values[key]).trim() === '')
        result.issues.push({ elementId: e.id, message: `الحقل ${key} مفقود؛ أكمل البيانات أو أزل الحقل من القالب.` });
  }
  result.issues.push(...overlapIssues(result.design));
  return result;
}
export async function preflightTemplates(design, records, options = {}) {
  const issues = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i],
      label = record.values?.['product.name'] || `الملصق ${i + 1}`;
    try {
      const layout = await prepareTemplateLayout(design, record.values, options);
      for (const issue of layout.issues) issues.push({ ...issue, recordIndex: i, product: label });
      for (const e of layout.design.elements.filter(e => e.type !== 'row' && e.visible !== false))
        try {
          const canvas = await renderElement(e, record.values, options);
          for (const issue of canvas.labelWarnings || []) issues.push({ ...issue, recordIndex: i, product: label });
        } catch (error) {
          issues.push({ elementId: e.id, recordIndex: i, product: label, message: error.message });
        }
    } catch (error) {
      issues.push({ recordIndex: i, product: label, message: error.message });
    }
  }
  return issues;
}

export async function renderTemplate(design, values, { dpi = 203, monochrome = true, geometry, loadImage, validate = true } = {}) {
  if (validate) validateDesign(design, { geometry });
  const resolved = await prepareTemplateLayout(design, values, { dpi });
  if (resolved.issues.length) {
    const error = Error(resolved.issues.map(i => i.message).join('\n'));
    error.issues = resolved.issues;
    throw error;
  }
  design = resolved.design;
  const canvas = canvasOf(mmToDots(design.widthMm, dpi), mmToDots(design.heightMm, dpi)),
    ctx = canvas.getContext('2d');
  ctx.fillStyle = design.background || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const element of design.elements) {
    if (element.visible === false || element.type === 'row') continue;
    const image = await renderElement(element, values, { dpi, loadImage });
    const x = mmToDots(element.x, dpi),
      y = mmToDots(element.y, dpi);
    ctx.save();
    ctx.translate(x + image.width / 2, y + image.height / 2);
    ctx.rotate((Number(element.rotation || 0) * Math.PI) / 180);
    ctx.imageSmoothingEnabled = !['barcode', 'qr'].includes(element.type);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
  }
  if (monochrome) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const pixel = image.data[i] * 0.299 + image.data[i + 1] * 0.587 + image.data[i + 2] * 0.114 < 160 ? 0 : 255;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = pixel;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }
  if (geometry && canvas.width > geometry.widthDots) {
    const cropped = canvasOf(geometry.widthDots, canvas.height);
    cropped
      .getContext('2d')
      .drawImage(
        canvas,
        Math.floor((canvas.width - geometry.widthDots) / 2),
        0,
        geometry.widthDots,
        canvas.height,
        0,
        0,
        geometry.widthDots,
        canvas.height
      );
    return cropped;
  }
  return canvas;
}

export async function templatePdf(design, records, { layout = 'roll', startCell = 1, dpi, geometry, monochrome = true, loadImage } = {}) {
  const sheet = layout === 'a4';
  validateDesign(design, { geometry: sheet ? undefined : geometry, sheet, startCell });
  const count = records.reduce((sum, r) => sum + Number(r.quantity), 0);
  if (!Number.isInteger(count) || count < 1 || count > 100 || records.some(r => !Number.isInteger(Number(r.quantity)) || Number(r.quantity) < 1))
    throw new Error('اختر من 1 إلى 100 ملصق بكميات صحيحة.');
  dpi ||= sheet ? 300 : geometry?.dpi || 203;
  const issues = await preflightTemplates(design, records, { dpi, loadImage });
  const blockers = issues.filter(i => i.severity !== 'warning');
  if (blockers.length) {
    const error = Error('لم تُرسل الدفعة للطباعة:\n' + blockers.map(i => `${i.product} · ${i.elementId || ''}: ${i.message}`).join('\n'));
    error.issues = issues;
    throw error;
  }
  const landscape = sheet && design.sheet.orientation === 'landscape';
  const width = sheet
    ? landscape
      ? 297
      : 210
    : Math.min(Number(design.widthMm), geometry ? (geometry.widthDots * 25.4) / geometry.dpi : Number(design.widthMm));
  const height = sheet ? (landscape ? 210 : 297) : Number(design.heightMm),
    orientation = width > height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'mm', format: sheet ? 'a4' : [width, height], compress: true });
  const positions = sheet ? sheetPlacements(design, count, startCell) : null;
  let index = 0,
    page = 0;
  for (const record of records) {
    const canvas = await renderTemplate(design, record.values, { dpi, monochrome, geometry: sheet ? undefined : geometry, loadImage });
    const image = canvas.toDataURL('image/png');
    for (let copy = 0; copy < record.quantity; copy++, index++) {
      const target = sheet ? positions[index] : { page: index, x: 0, y: 0 };
      if (target.page !== page) {
        pdf.addPage(sheet ? 'a4' : [width, height], orientation);
        page = target.page;
      }
      pdf.addImage(
        image,
        'PNG',
        target.x,
        target.y,
        sheet ? Number(design.widthMm) : width,
        sheet ? Number(design.heightMm) : height,
        undefined,
        'FAST'
      );
    }
  }
  return {
    base64: pdf.output('datauristring').split(',')[1],
    blob: pdf.output('blob'),
    count,
    warnings: issues.filter(i => i.severity === 'warning'),
  };
}
