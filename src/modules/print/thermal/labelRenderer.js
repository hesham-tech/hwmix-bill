import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { validateLabelOptions, labelGeometry } from './labelData';

// Verified from TiMini v0.9's exported toprint_hprt_esc_zl1 profile.
export const PRINT_WIDTH_DOTS = 384;
export const PRINT_DPI = 203;
export const PRINT_WIDTH_MM = PRINT_WIDTH_DOTS * 25.4 / PRINT_DPI;

function fitText(context, text, width) {
  if (context.measureText(text).width <= width) return text;
  let shortened = text;
  while (shortened && context.measureText(shortened + '…').width > width) shortened = shortened.slice(0, -1);
  return shortened + '…';
}

function wrapName(context, text, width, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  while (words.length) {
    if (lines.length === maxLines - 1) {
      lines.push(fitText(context, words.join(' '), width)); break;
    }
    let line = words.shift();
    while (words.length && context.measureText(`${line} ${words[0]}`).width <= width) line += ` ${words.shift()}`;
    lines.push(fitText(context, line, width));
  }
  return lines;
}

export async function renderLabel(label, settings, companyName = '') {
  validateLabelOptions(settings);
  const geometry = labelGeometry(settings);
  const center = Math.floor(geometry.widthDots / 2);
  const textWidth = geometry.widthDots - 32;
  const heightMm = Number(settings.heightMm);
  const compact = heightMm === 20;
  // Wait for the actual Arabic font before measuring/drawing the raster.
  if (document.fonts) await document.fonts.load('700 30px Tahoma');
  const canvas = document.createElement('canvas');
  canvas.width = geometry.widthDots;
  canvas.height = Math.round(heightMm * geometry.dpi / 25.4);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('المتصفح لا يدعم رسم الملصق.');
  context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000'; context.textAlign = 'center'; context.textBaseline = 'top';
  context.direction = 'rtl';
  const barcodeCanvas = document.createElement('canvas');
  try {
    JsBarcode(barcodeCanvas, label.barcode, {
      format: 'CODE128', width: 2, height: compact ? 48 : (heightMm === 30 ? 60 : 80), displayValue: false,
      margin: 0, marginLeft: 20, marginRight: 20, marginTop: 0, marginBottom: 0,
      background: '#fff', lineColor: '#000',
    });
  } catch { throw new Error(`الباركود «${label.barcode}» غير صالح للطباعة.`); }
  if (barcodeCanvas.width > canvas.width - 16) {
    throw new Error(`الباركود «${label.barcode}» أطول من عرض هذه الطابعة بدقة مقروءة. استخدم كود صنف أقصر أو طابعة أعرض.`);
  }
  if (Math.round(barcodeCanvas.width * 1.5) <= canvas.width - 16) {
    JsBarcode(barcodeCanvas, label.barcode, {
      format: 'CODE128', width: 3, height: compact ? 48 : (heightMm === 30 ? 60 : 80), displayValue: false,
      margin: 0, marginLeft: 30, marginRight: 30, marginTop: 0, marginBottom: 0,
      background: '#fff', lineColor: '#000',
    });
  }
  const nameFont = compact ? 18 : (heightMm === 30 ? 24 : 30);
  context.font = `700 ${nameFont}px Tahoma, Arial, sans-serif`;
  const lines = wrapName(context, label.productName, textWidth, compact ? 1 : 2);
  const hasSku = label.sku && label.sku !== label.barcode;
  const companyHeight = !compact && companyName ? 26 : 0;
  const nameHeight = lines.length * (nameFont + 2);
  const priceHeight = compact ? 28 : 34;
  const codeHeight = compact ? 22 : 28;
  const skuHeight = compact ? 18 : 24;
  const totalHeight = companyHeight + nameHeight + priceHeight + barcodeCanvas.height + codeHeight + (hasSku ? skuHeight : 0) + 12;
  let y = Math.max(5, Math.floor((canvas.height - totalHeight) / 2));
  if (companyHeight) {
    context.font = '700 20px Tahoma, Arial, sans-serif';
    context.fillText(fitText(context, companyName, textWidth), center, y); y += companyHeight;
  }
  context.font = `700 ${nameFont}px Tahoma, Arial, sans-serif`;
  for (const line of lines) { context.fillText(line, center, y); y += nameFont + 2; }
  context.font = `700 ${compact ? 20 : 26}px Tahoma, Arial, sans-serif`;
  const price = new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(label.price);
  context.fillText(fitText(context, `${price} ج.م`, textWidth), center, y + 2); y += priceHeight;
  context.imageSmoothingEnabled = false;
  // Keep integer bar widths and quiet zones: never stretch the barcode to fit.
  context.drawImage(barcodeCanvas, Math.floor((canvas.width - barcodeCanvas.width) / 2), y);
  y += barcodeCanvas.height + 4;
  context.direction = 'ltr'; context.font = `700 ${compact ? 15 : 22}px Tahoma, Arial, sans-serif`;
  context.fillText(label.barcode, center, y); y += codeHeight;
  if (hasSku) { context.font = `700 ${compact ? 13 : 18}px Tahoma, Arial, sans-serif`; context.fillText(fitText(context, label.sku, textWidth), center, y); }
  // Threshold Arabic antialiasing too; never dither barcode edges.
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = image.data[i] < 160 ? 0 : 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

export async function createLabelPdf(labels, settings, companyName) {
  const height = Number(settings.heightMm);
  const width = labelGeometry(settings).widthMm;
  const orientation = width > height ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'mm', format: [width, height], compress: true });
  // Reuse a raster for repeated copies of the same product.
  const cache = new Map();
  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    const key = JSON.stringify(label);
    if (!cache.has(key)) cache.set(key, (await renderLabel(label, settings, companyName)).toDataURL('image/png'));
    if (index) doc.addPage([width, height], orientation);
    doc.addImage(cache.get(key), 'PNG', 0, 0, width, height);
  }
  return doc.output('datauristring').split(',')[1];
}
