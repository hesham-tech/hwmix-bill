import { clone, elementBounds } from './templateSchema';
export async function resolveFlexLayout(design, values, measure) {
  const result = clone(design),
    issues = [];
  const rows = result.elements.filter(e => e.type === 'row');
  for (const row of rows) {
    const cfg = { paddingMm: 1, gapMm: 1, rowGapMm: 1, direction: 'rtl', mode: 'auto', align: 'center', wrap: false, ...row.layout };
    for (const key of ['paddingMm', 'gapMm', 'rowGapMm']) cfg[key] = Number(cfg[key]);
    if (
      !['auto', 'equal', 'ratio'].includes(cfg.mode) ||
      !['rtl', 'ltr'].includes(cfg.direction) ||
      !['start', 'center', 'end'].includes(cfg.align) ||
      ['paddingMm', 'gapMm', 'rowGapMm'].some(k => !Number.isFinite(cfg[k]) || cfg[k] < 0)
    ) {
      issues.push({ elementId: row.id, message: 'إعدادات الصف غير صالحة؛ راجع المسافات والاتجاه والتوزيع.' });
      continue;
    }
    const children = result.elements.filter(e => e.parentId === row.id && e.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const inner = row.width - 2 * cfg.paddingMm,
      availableHeight = row.height - 2 * cfg.paddingMm;
    if (row.visible === false) {
      children.forEach(e => (e.visible = false));
      continue;
    }
    if (inner <= 0 || availableHeight <= 0) {
      issues.push({ elementId: row.id, message: 'هوامش الصف لا تترك مساحة للمحتوى.' });
      continue;
    }
    let measured = [];
    for (const e of children) {
      try {
        const natural = await measure(e, values);
        measured.push({ e, width: Math.max(0.1, natural.width), height: e.height });
      } catch (error) {
        issues.push({ elementId: e.id, message: error.message });
      }
    }
    const lines = [[]];
    let used = 0;
    for (const item of measured) {
      const w = Math.min(inner, item.width);
      if (cfg.wrap && lines.at(-1).length && used + cfg.gapMm + w > inner) {
        lines.push([]);
        used = 0;
      }
      lines.at(-1).push(item);
      used += w + (lines.at(-1).length > 1 ? cfg.gapMm : 0);
    }
    let top = Number(row.y) + cfg.paddingMm;
    for (const line of lines) {
      if (!line.length) continue;
      const height = Math.max(...line.map(i => Number(i.height))),
        space = inner - cfg.gapMm * (line.length - 1);
      if (space <= 0) {
        issues.push({ elementId: row.id, message: 'المسافات بين عناصر الصف أكبر من عرضه.' });
        continue;
      }
      const total = line.reduce((s, i) => s + (cfg.mode === 'ratio' ? Number(i.e.flexWeight || 1) : cfg.mode === 'equal' ? 1 : i.width), 0);
      let cursor = cfg.direction === 'rtl' ? Number(row.x) + row.width - cfg.paddingMm : Number(row.x) + cfg.paddingMm;
      for (const item of line) {
        const weight = cfg.mode === 'ratio' ? Number(item.e.flexWeight || 1) : cfg.mode === 'equal' ? 1 : item.width;
        const width = cfg.mode === 'auto' && total <= space ? item.width : (space * weight) / total;
        const e = item.e;
        e.width = width;
        e.x = cfg.direction === 'rtl' ? cursor - width : cursor;
        e.y = top + (cfg.align === 'end' ? height - e.height : cfg.align === 'center' ? (height - e.height) / 2 : 0);
        e.rotation = 0;
        e.strictFit = true;
        cursor += (cfg.direction === 'rtl' ? -1 : 1) * (width + cfg.gapMm);
        if (top + height > Number(row.y) + row.height - cfg.paddingMm + 0.01)
          issues.push({ elementId: e.id, message: 'محتوى الصف يتجاوز ارتفاعه المتاح؛ وسّع الصف أو قلّل المحتوى.' });
      }
      top += height + cfg.rowGapMm;
    }
  }
  return { design: result, issues };
}
export function overlapIssues(design) {
  if (design.schemaVersion !== 2) return [];
  const elements = design.elements.filter(e => e.visible !== false && ['text', 'barcode', 'qr', 'image'].includes(e.type)),
    issues = [];
  for (let i = 0; i < elements.length; i++)
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i],
        b = elements[j],
        x = elementBounds(a),
        y = elementBounds(b);
      if (Math.min(x.right, y.right) - Math.max(x.left, y.left) <= 0.05 || Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) <= 0.05) continue;
      const signature = JSON.stringify([a, b].map(e => ({ ...e, strictFit: undefined })));
      const key = [a.id, b.id].sort().join('|');
      if (design.overlapApprovals?.some(p => p.key === key && p.signature === signature)) continue;
      issues.push({
        elementId: a.id,
        elementIds: [a.id, b.id],
        key,
        signature,
        message: 'عنصرا محتوى متداخلان؛ ضعهما داخل صف أو اعتمد التداخل المقصود.',
      });
    }
  return issues;
}
