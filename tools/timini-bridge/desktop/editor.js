import { JsBarcode, QRCode, jsPDF } from '/vendor/print-vendor.mjs';
import { normalizeTemplate } from '/editor-schema.mjs';

export function renderTemplate(input, geometry = { widthDots: 384, dpi: 203 }) {
  const template = normalizeTemplate(input);
  const dpi = Number(geometry.dpi || 203); const head = Number(geometry.widthDots || 384);
  const dot = value => Math.round(value * dpi / 25.4);
  const canvas = document.createElement('canvas'); canvas.width = head; canvas.height = dot(template.heightMm);
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, head, canvas.height);
  const contentWidth = Math.min(head, dot(template.widthMm));
  const padding = dot(template.paddingMm); const gap = dot(template.gapMm);
  const left = Math.floor((head - contentWidth) / 2) + padding;
  const width = contentWidth - padding * 2;
  if (width < 32) throw new Error('العرض المتبقي صغير. قلل الهامش أو زد عرض الملصق.');
  ctx.fillStyle = '#000'; ctx.textBaseline = 'top'; let y = padding;
  let count = 0;
  for (const [index, row] of template.rows.entries()) {
    if (!row.enabled) continue;
    count++;
    const font = Math.max(1, Math.round(row.fontPt * dpi / 72));
    ctx.font = `${row.bold ? '700' : '400'} ${font}px Tahoma, Arial, sans-serif`;
    ctx.direction = 'rtl'; ctx.textAlign = row.align;
    if (ctx.measureText(row.text).width > width) throw new Error(`نص الصف ${index + 1} لا يتسع. قلل حجم الخط أو اختصره.`);
    const x = row.align === 'center' ? left + width / 2 : row.align === 'right' ? left + width : left;
    const height = Math.ceil(font * 1.35);
    if (y + height > canvas.height - padding) throw new Error('المحتوى أطول من الملصق. زد الطول أو عطّل صفًا أو قلل الخط والمسافات.');
    ctx.fillText(row.text, Math.round(x), y); y += height + gap;
  }
  if (template.code.enabled) {
    count++;
    const codeHeight = dot(template.code.heightMm);
    let symbol;
    if (template.code.type === 'barcode') {
      symbol = document.createElement('canvas');
      JsBarcode(symbol, template.code.value, { format: 'CODE128', width: 2, height: codeHeight, displayValue: false,
        margin: 0, marginLeft: 20, marginRight: 20, marginTop: 0, marginBottom: 0, background: '#fff', lineColor: '#000' });
      if (symbol.width > width) throw new Error('الباركود لا يتسع دون تشويه الخطوط. اختصر القيمة أو اختر QR.');
    } else {
      const qr = QRCode.create(template.code.value, { errorCorrectionLevel: 'M' });
      const modules = qr.modules.size; const scale = Math.floor(Math.min(codeHeight, width) / (modules + 8));
      if (scale < 2) throw new Error('قيمة QR طويلة لهذا الحجم. زد ارتفاع الرمز أو اختصر القيمة.');
      symbol = document.createElement('canvas'); symbol.width = symbol.height = (modules + 8) * scale;
      const qrContext = symbol.getContext('2d'); qrContext.fillStyle = '#fff'; qrContext.fillRect(0, 0, symbol.width, symbol.height); qrContext.fillStyle = '#000';
      for (let row = 0; row < modules; row++) for (let column = 0; column < modules; column++) if (qr.modules.data[row * modules + column]) qrContext.fillRect((column + 4) * scale, (row + 4) * scale, scale, scale);
    }
    const textHeight = template.code.showText ? Math.ceil(template.code.fontPt * dpi / 72 * 1.4) : 0;
    if (y + symbol.height + textHeight > canvas.height - padding) throw new Error('الرمز لا يتسع في طول الملصق. زد الطول أو قلل ارتفاع الرمز.');
    ctx.imageSmoothingEnabled = false; ctx.drawImage(symbol, Math.round(left + (width - symbol.width) / 2), y); y += symbol.height;
    if (textHeight) {
      ctx.font = `${Math.round(template.code.fontPt * dpi / 72)}px Tahoma, Arial, sans-serif`;
      ctx.direction = 'ltr'; ctx.textAlign = 'center';
      if (ctx.measureText(template.code.value).width > width) throw new Error('قيمة الرمز النصية لا تتسع. عطّل إظهار القيمة أسفل الرمز أو قلل حجم خطها.');
      ctx.fillText(template.code.value, Math.round(left + width / 2), y);
    }
  }
  if (!count) throw new Error('فعّل صفًا واحدًا على الأقل.');
  const raster = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < raster.data.length; i += 4) {
    const level = raster.data[i] < 160 ? 0 : 255; raster.data[i] = raster.data[i + 1] = raster.data[i + 2] = level; raster.data[i + 3] = 255;
  }
  ctx.putImageData(raster, 0, 0);
  return { canvas, template, printableWidthMm: head * 25.4 / dpi, contentHeightDots: y };
}

export function labelPdf(rendered) {
  const width = rendered.printableWidthMm; const height = rendered.template.heightMm;
  const doc = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'mm', format: [width, height], compress: true });
  doc.addImage(rendered.canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
  return doc.output('datauristring').split(',')[1];
}
