/**
 * Unified API Error Parser & Arabic Translator
 * HWNix ERP System Standard
 */

export function parseApiError(error, defaultFallback = 'حدث خطأ غير متوقع أثناء معالجة الطلب.') {
  if (!error) return defaultFallback;

  // Handle string errors
  if (typeof error === 'string') return error;

  // Handle Response Data from Axios/API
  const response = error.response || error;
  const status = response?.status;
  const data = response?.data;

  // 1. Validation Errors (422 Unprocessable Entity)
  if (status === 422 && data?.errors && typeof data.errors === 'object') {
    const errorMessages = [];
    Object.values(data.errors).forEach(errArray => {
      if (Array.isArray(errArray)) {
        errorMessages.push(...errArray);
      } else if (typeof errArray === 'string') {
        errorMessages.push(errArray);
      }
    });
    if (errorMessages.length > 0) {
      return errorMessages.join(' | ');
    }
  }

  // 2. Direct server message if available in Arabic
  if (data?.message && typeof data.message === 'string') {
    // If message is in English or generic server exception, map common ones
    const mapped = mapServerMessageToArabic(data.message);
    if (mapped) return mapped;
    return data.message;
  }

  // 3. Status Code Fallbacks
  if (status) {
    switch (status) {
      case 400:
        return 'طلب غير صالح، يرجى التأكد من البيانات المدخلة.';
      case 401:
        return 'انتهت الجلسة أو يلزم تسجيل الدخول مجدداً.';
      case 403:
        return 'عذراً، ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.';
      case 404:
        return 'العنصر المطلوب غير موجود أو تم حذفه.';
      case 405:
        return 'طريقة الطلب غير مسموح بها.';
      case 408:
        return 'انتهت مهلة الانتظار، يرجى إعادة المحاولة.';
      case 409:
        return 'تنسيق البيانات متعارض مع سجلات أخرى موجودة بالسيرفر.';
      case 419:
        return 'انتهت صلاحية الصفحة، يرجى تحديث الصفحة وتكرار العملية.';
      case 422:
        return 'البيانات المدخلة غير صالحة، يرجى مراجعة الحقول.';
      case 429:
        return 'تم إرسال طلبات كثيرة جداً بوقت قصير، يرجى الانتظار ثم المحاولة.';
      case 500:
        return 'حدث خطأ داخلي في الخادم، جاري معالجته من قبل الفريق الفني.';
      case 502:
      case 503:
      case 504:
        return 'الخدمة غير متوفرة حالياً أو السيرفر تحت الصيانة، حاول لاحقاً.';
      default:
        break;
    }
  }

  // 4. Network / Connectivity Errors
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'تعذّر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت لديكم.';
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'استغرق الطلب وقتاً أطول من المتوقع، يرجى المحاولة لاحقاً.';
  }

  return error.message || defaultFallback;
}

function mapServerMessageToArabic(msg) {
  const normalized = msg.toLowerCase().trim();

  if (normalized.includes('unauthenticated')) return 'يرجى تسجيل الدخول لمتابعة العمل.';
  if (normalized.includes('unauthorized') || normalized.includes('this action is unauthorized')) {
    return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
  }
  if (normalized.includes('token expired')) return 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول.';
  if (normalized.includes('route not found') || normalized.includes('not found')) return 'المورد المطلوب غير موجود.';
  if (normalized.includes('csrf token mismatch')) return 'انتهت جلسة النموذج، يرجى تحديث الصفحة.';
  if (normalized.includes('too many requests')) return 'طلبات كثيرة متتالية، يرجى الانتظار قليلاً.';

  return null;
}
