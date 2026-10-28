export const MONEY_FIELDS = ['variant.retail_price', 'variant.wholesale_price', 'variant.purchase_price', 'unit.price', 'invoice.unit_price'];
export const isMoneyField = key => MONEY_FIELDS.includes(key);
export function decimalRound(value, digits = 2) {
  const raw = String(value).trim(),
    match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(raw);
  if (!match || !Number.isInteger(digits) || digits < 0 || digits > 6) throw Error('قيمة السعر أو عدد المنازل العشرية غير صالح.');
  const exponent = Number(match[4] || 0);
  if (Math.abs(exponent) > 100) throw Error('قيمة السعر خارج النطاق.');
  const fraction = match[3] || '',
    shift = digits + exponent - fraction.length;
  let amount = BigInt(match[2] + fraction);
  if (shift >= 0) amount *= 10n ** BigInt(shift);
  else {
    const factor = 10n ** BigInt(-shift);
    amount = amount / factor + ((amount % factor) * 2n >= factor ? 1n : 0n);
  }
  let text = amount.toString().padStart(digits + 1, '0');
  if (digits) text = text.slice(0, -digits) + '.' + text.slice(-digits);
  return (match[1] === '-' && amount !== 0n ? '-' : '') + text;
}
export function formatPrice(value, settings = {}, values = {}) {
  if (value === null || value === undefined || value === '') throw Error('قيمة السعر مفقودة.');
  let text = decimalRound(value, settings.decimals ?? 2);
  if (settings.trimZeros && text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
  if (settings.groupThousands) {
    const parts = text.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    text = parts.join('.');
  }
  if (settings.showCurrency !== false) {
    const symbol = (settings.currencySymbol || values['company.currency'] || '').trim();
    if (!symbol) throw Error('عملة الشركة غير محددة؛ اختر رمز العملة أو عطّل إظهارها.');
    text = settings.currencyPosition === 'before' ? `${symbol} ${text}` : `${text} ${symbol}`;
  }
  return text;
}
export const defaultPriceFormat = () => ({
  decimals: 2,
  trimZeros: false,
  showCurrency: true,
  currencySymbol: '',
  currencyPosition: 'after',
  groupThousands: false,
});
export function priceField(element) {
  const refs = element.field ? [element.field] : [...(element.content || '').matchAll(/\{\{([\w.-]+)\}\}/g)].map(m => m[1]);
  return refs.find(isMoneyField);
}
