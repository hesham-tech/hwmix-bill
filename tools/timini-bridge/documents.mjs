import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, basename, isAbsolute } from 'node:path';
import { runTiMini } from './server.mjs';

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const TYPES = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp' };
export function identifyDocument(bytes) {
  if (bytes.subarray(0, 5).toString() === '%PDF-') return 'pdf';
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (/^GIF8[79]a/.test(bytes.subarray(0, 6).toString())) return 'gif';
  if (bytes.subarray(0, 2).toString() === 'BM') return 'bmp';
  throw new Error('الملف ليس PDF أو صورة PNG/JPEG/GIF/BMP مدعومة.');
}
export function documentFromBytes(name, bytes, source = 'files') {
  if (!bytes.length || bytes.length > MAX_DOCUMENT_BYTES) throw new Error('حجم الملف يجب ألا يتجاوز 20 ميجابايت.');
  const type = identifyDocument(bytes);
  return { id: randomUUID(), name: basename(String(name).replaceAll('\\', '/')).slice(0, 180), type, mime: TYPES[type], bytes, source, createdAt: Date.now() };
}
export function decodeUpload(files) {
  if (!Array.isArray(files) || !files.length || files.length > 10) throw new Error('اختر من ملف إلى 10 ملفات في الطلب الواحد.');
  let total = 0;
  return files.map(file => {
    if (typeof file.data !== 'string' || file.data.length > MAX_DOCUMENT_BYTES * 1.4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(file.data)) throw new Error('بيانات الملف غير صالحة.');
    const bytes = Buffer.from(file.data, 'base64'); total += bytes.length;
    if (total > MAX_TOTAL_BYTES) throw new Error('إجمالي الملفات يجب ألا يتجاوز 40 ميجابايت.');
    return documentFromBytes(file.name, bytes);
  });
}
export async function readLocalDocuments(paths) {
  if (!Array.isArray(paths) || !paths.length || paths.length > 10) throw new Error('يمكن فتح 10 ملفات كحد أقصى.');
  const documents = []; let total = 0;
  for (const path of paths) {
    if (typeof path !== 'string' || !isAbsolute(path) || path.startsWith('\\\\') || !TYPES[extname(path).slice(1).toLowerCase()]) throw new Error('اختر ملفات PDF أو صورًا من جهازك.');
    const info = await stat(path);
    if (!info.isFile() || info.size > MAX_DOCUMENT_BYTES || (total += info.size) > MAX_TOTAL_BYTES) throw new Error('حجم الملفات يتجاوز الحد المسموح.');
    documents.push(documentFromBytes(basename(path), await readFile(path)));
  }
  return documents;
}
export function printOptions(input, config) {
  if (!config.configured) throw new Error('اضبط الطابعة أولًا من تبويب الطابعة والربط.');
  const paper = String(input.paper || config.paperOptions?.[0]?.value || 'tag_384r');
  if (!config.paperOptions?.some(option => option.value === paper)) throw new Error('نوع الورق غير مدعوم بواسطة الطابعة.');
  const copies = Number(input.copies ?? 1); const darkness = Number(input.darkness ?? 3);
  if (!Number.isInteger(copies) || copies < 1 || copies > 20 || !Number.isInteger(darkness) || darkness < 1 || darkness > 5) throw new Error('عدد النسخ من 1 إلى 20 ودرجة السواد من 1 إلى 5.');
  const imageMode = input.imageMode || 'threshold';
  if (!['threshold', 'atkinson', 'floyd_steinberg'].includes(imageMode)) throw new Error('وضع الصورة غير صالح.');
  const pdfPages = String(input.pdfPages || '').trim();
  if (pdfPages && (pdfPages.length > 200 || !/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(pdfPages))) throw new Error('اكتب الصفحات مثل 1 أو 1,3-5.');
  if (pdfPages) for (const part of pdfPages.split(',')) {
    const [start, end = start] = part.split('-').map(Number);
    if (start < 1 || end < start || end > 10000) throw new Error('نطاق الصفحات غير صالح.');
  }
  return { paper, copies, darkness, imageMode, pdfPages, trimMargins: input.trimMargins === true };
}
export async function printDocuments(config, job, documents) {
  let completed = 0;
  for (const document of documents) for (let copy = 0; copy < job.copies; copy++) {
    job.progress = `${completed + 1} / ${job.count} — ${document.name}`;
    await runTiMini(config, { ...job, fileType: document.type, count: 1, pdfPages: document.type === 'pdf' ? job.pdfPages : '' }, document.bytes);
    completed++;
  }
}
export function createDocumentStore() {
  const documents = new Map();
  function prune() { for (const [id, document] of documents) if (Date.now() - document.createdAt > 30 * 60_000) documents.delete(id); }
  function add(items) {
    prune();
    const total = [...documents.values(), ...items].reduce((sum, item) => sum + item.bytes.length, 0);
    if (documents.size + items.length > 30 || total > 80 * 1024 * 1024) throw new Error('قائمة الملفات ممتلئة. احذف ملفات سابقة قبل إضافة المزيد.');
    for (const item of items) documents.set(item.id, item);
    return items.map(metadata);
  }
  const metadata = document => ({ id: document.id, name: document.name, type: document.type, mime: document.mime, size: document.bytes.length, source: document.source });
  return { add, get: id => { prune(); return documents.get(id); }, remove: id => documents.delete(id), list: () => { prune(); return [...documents.values()].map(metadata); } };
}
