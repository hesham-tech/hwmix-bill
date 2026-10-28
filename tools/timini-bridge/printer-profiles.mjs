const address = value => /^[a-f0-9]{2}(?::[a-f0-9]{2}){5}$/i.test(value || '');
export const printerId = printer => address(printer.bluetooth) ? `bt-${printer.bluetooth.replaceAll(':', '').toLowerCase()}` : 'legacy-default';
const fields = ['bluetooth', 'bluetoothName', 'modelKey', 'geometry', 'paperOptions', 'printerConfigPath', 'configured'];
export function printerProfiles(config) {
  if (Array.isArray(config.printers) && config.printers.length) return config.printers;
  if (!config.configured) return [];
  return [{ id: printerId(config), ...Object.fromEntries(fields.map(key => [key, config[key]])) }];
}
export function printerForJob(config, id = config.activePrinterId || printerId(config)) {
  const profile = printerProfiles(config).find(printer => printer.id === id);
  if (!profile) throw new Error('اختر طابعة محفوظة من قائمة الطابعات أو أضف الطابعة أولًا.');
  return { ...config, ...profile };
}
export function activatePrinter(config, id) {
  return { ...printerForJob(config, id), activePrinterId: id };
}
export function rememberPrinter(config, prepared) {
  const id = printerId(prepared);
  const profile = { id, ...Object.fromEntries(fields.map(key => [key, prepared[key]])) };
  const printers = printerProfiles(config).filter(printer => printer.id !== id && printer.id !== 'legacy-default');
  if (printers.length >= 20) throw new Error('الحد الأقصى 20 طابعة محفوظة.');
  return { ...config, ...prepared, printers: [...printers, profile], activePrinterId: id };
}
