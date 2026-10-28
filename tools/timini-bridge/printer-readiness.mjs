import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { parseDevices, runCli } from './desktop-config.mjs';

const exec = promisify(execFile);
export class PrinterValidationError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const fail = (code, message) => { throw new PrinterValidationError(code, message); };
const RADIO_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  $null = [Windows.Devices.Radios.Radio,Windows.System.Devices,ContentType=WindowsRuntime]
  $operation = [Windows.Devices.Radios.Radio]::GetRadiosAsync()
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetGenericArguments().Count -eq 1 } | Select-Object -First 1
  $task = $method.MakeGenericMethod([System.Collections.Generic.IReadOnlyList[Windows.Devices.Radios.Radio]]).Invoke($null, @($operation))
  if (!$task.Wait(8000)) { throw 'Radio enumeration timeout' }
  $radios = @($task.Result | Where-Object { $_.Kind.ToString() -eq 'Bluetooth' } | ForEach-Object { $_.State.ToString() })
  @{ states = $radios; available = $true } | ConvertTo-Json -Compress
} catch { @{ states = @(); available = $false } | ConvertTo-Json -Compress }
`;
export async function readBluetoothRadios() {
  if (process.platform !== 'win32') return { available: false, states: [] };
  try {
    const { stdout } = await exec(join(process.env.WINDIR || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
      ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(RADIO_SCRIPT, 'utf16le').toString('base64')],
      { windowsHide: true, timeout: 12_000, maxBuffer: 100_000 });
    const result = JSON.parse(stdout.replace(/^\uFEFF/, '').trim());
    return { available: result.available === true, states: Array.isArray(result.states) ? result.states : [] };
  } catch { return { available: false, states: [] }; }
}
export async function discoverPrinters(cliPath, dependencies = {}) {
  const radio = await (dependencies.radios || readBluetoothRadios)();
  validateRadios(radio);
  try {
    const { stdout } = await (dependencies.scan || runCli)(cliPath, ['--scan'], 35_000);
    return { devices: parseDevices(stdout), radioKnown: radio.available };
  } catch (error) {
    if (error.killed || error.code === 'ETIMEDOUT') fail('DISCOVERY_TIMEOUT', 'انتهت مهلة البحث عن الطابعة دون إرسال أي بيانات طباعة. تأكد من Bluetooth وتشغيل الطابعة وقربها ثم أعد المحاولة.');
    throw friendlyPrinterError(error);
  }
}
function validateRadios(radio) {
  if (radio.available) {
    if (!radio.states.length) fail('BLUETOOTH_UNAVAILABLE', 'Bluetooth غير متاح في Windows. تأكد من وجود محول Bluetooth وتعريفه وتفعيله ثم أعد المحاولة.');
    if (!radio.states.includes('On')) {
      if (radio.states.includes('Disabled')) fail('BLUETOOTH_DISABLED', 'Bluetooth معطّل في Windows. فعّله من إعدادات الجهاز أو راجع مسؤول الجهاز ثم أعد المحاولة.');
      fail('BLUETOOTH_OFF', 'Bluetooth في Windows مغلق. افتح إعدادات Bluetooth وشغّله ثم أعد المحاولة.');
    }
  }
}
export function selectDiscoveredPrinter(target, devices) {
  const value = String(target || '').trim().toLocaleLowerCase();
  const matches = devices.filter(device => device.address.toLowerCase() === value || device.name.toLocaleLowerCase() === value);
  if (!matches.length) fail('PRINTER_NOT_FOUND', `لم تظهر الطابعة «${String(target).slice(0, 100)}» في البحث. شغّلها وقرّبها من اللابتوب وافصل اتصال الهاتف أو TiMini عنها. من «الطابعة والربط» ابحث واختر الجهاز الفعلي؛ الاسم المكتوب يدويًا يجب أن يطابق اسم Bluetooth المعلن، وليس اسمًا وصفيًا.`);
  if (matches.length > 1) fail('PRINTER_AMBIGUOUS', 'يوجد أكثر من جهاز بنفس الاسم. اختر عنوان Bluetooth الخاص بطابعتك من قائمة البحث.');
  return { bluetooth: matches[0].address, bluetoothName: matches[0].name };
}
export async function checkPrinterReadiness(config, dependencies = {}) {
  // Saved identities use their hardware address. Discovery is not a liveness test:
  // some devices stop advertising while paired; the print transport opens the connection.
  if (/^[a-f0-9]{2}(?::[a-f0-9]{2}){5}$/i.test(config.bluetooth || '')) {
    const radio = await (dependencies.radios || readBluetoothRadios)(); validateRadios(radio);
    return { bluetooth: config.bluetooth.toUpperCase(), bluetoothName: config.bluetoothName || config.bluetooth, radioKnown: radio.available };
  }
  return resolvePrinterSelection(config, dependencies);
}
export async function resolvePrinterSelection(config, dependencies = {}) {
  const { devices, radioKnown } = await discoverPrinters(config.cliPath, dependencies);
  return { ...selectDiscoveredPrinter(config.bluetooth, devices), radioKnown };
}
export function friendlyPrinterError(error, config = {}, partial = false) {
  if (error instanceof PrinterValidationError) return error;
  const raw = String(error?.message || error).replace(/\\u([a-f0-9]{4})/gi, (_, value) => String.fromCharCode(parseInt(value, 16)));
  let code = 'PRINT_FAILED'; let message;
  if (/No device matches|device.*not found|not discovered|not detected/i.test(raw)) {
    code = 'PRINTER_NOT_FOUND'; message = 'لم يتم العثور على الطابعة المحددة. شغّلها، وتأكد من Bluetooth، ثم ابحث عنها واختر عنوانها من «الطابعة والربط».';
  } else if (/Bluetooth.*(off|disabled)|radio.*(off|disabled)|adapter.*(off|disabled)/i.test(raw)) {
    code = 'BLUETOOTH_OFF'; message = 'Bluetooth غير مفعّل في Windows. شغّله ثم أعد المحاولة.';
  } else if (/busy|in use|access.*denied|sharing violation/i.test(raw)) {
    code = 'PRINTER_BUSY'; message = 'تعذر فتح اتصال الطابعة. افصل اتصال تطبيق الهاتف وبرامج الطباعة الأخرى عنها ثم أعد المحاولة.';
  } else if (/connect|disconnect|socket|unreachable|timed? ?out|timeout|10060|10061|10064|10065|WinError/i.test(raw)) {
    code = 'CONNECTION_FAILED'; message = 'تعذر الاتصال بالطابعة أو انقطع اتصالها. تأكد من تشغيلها وقربها وتفعيل Bluetooth، وافصل الهاتف أو أي برنامج آخر عنها.';
  } else if (error?.code === 'ENOENT') {
    code = 'DRIVER_MISSING'; message = 'أحد ملفات محرك الطباعة غير موجود. أعد تثبيت أداة HWNiX.';
  } else message = 'تعذر إكمال الطباعة. تحقق من الطابعة والورق والبطارية واختيار الموديل الصحيح. تفاصيل التشخيص محفوظة في سجل الطباعة.';
  if (partial) message += ' قد يكون جزء من الطلب طُبع بالفعل؛ افحص الملصقات قبل إعادة الإرسال. لن يعيد البرنامج الطباعة تلقائيًا.';
  return new PrinterValidationError(code, message);
}
