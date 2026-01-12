/**
 * Validation Rules for Forms
 */

/**
 * Required field
 */
export const required = v => !!v || 'هذا الحقل مطلوب';

/**
 * Email validation
 */
export const email = v => {
  if (!v) return true;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(v) || 'البريد الإلكتروني غير صحيح';
};

/**
 * Phone number validation (Egyptian)
 */
export const phone = v => {
  if (!v) return true;
  const pattern = /^01[0125][0-9]{8}$/;
  return pattern.test(v) || 'رقم الهاتف غير صحيح';
};

/**
 * Min length
 */
export const minLength = length => {
  return v => {
    if (!v) return true;
    return v.length >= length || `الحد الأدنى ${length} حروف`;
  };
};

/**
 * Max length
 */
export const maxLength = length => {
  return v => {
    if (!v) return true;
    return v.length <= length || `الحد الأقصى ${length} حروف`;
  };
};

/**
 * Min value
 */
export const minValue = min => {
  return v => {
    if (v === null || v === undefined || v === '') return true;
    return Number(v) >= min || `القيمة يجب أن تكون ${min} أو أكثر`;
  };
};

/**
 * Max value
 */
export const maxValue = max => {
  return v => {
    if (v === null || v === undefined || v === '') return true;
    return Number(v) <= max || `القيمة يجب أن تكون ${max} أو أقل`;
  };
};

/**
 * Number validation
 */
export const number = v => {
  if (!v) return true;
  return !isNaN(Number(v)) || 'يجب أن تكون قيمة رقمية';
};

/**
 * Positive number
 */
export const positiveNumber = v => {
  if (!v) return true;
  return Number(v) > 0 || 'يجب أن تكون قيمة موجبة';
};

/**
 * URL validation
 */
export const url = v => {
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch {
    return 'الرابط غير صحيح';
  }
};

/**
 * Password strength
 */
export const strongPassword = v => {
  if (!v) return true;
  return v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
};

/**
 * Match another field (for password confirmation)
 */
export const matchField = (otherValue, fieldName = 'الحقل الآخر') => {
  return v => v === otherValue || `يجب أن يطابق ${fieldName}`;
};

/**
 * File size validation (in MB)
 */
export const maxFileSize = maxSizeMB => {
  return file => {
    if (!file) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes || `حجم الملف يجب أن يكون أقل من ${maxSizeMB} ميجا`;
  };
};

/**
 * File type validation
 */
export const fileType = allowedTypes => {
  return file => {
    if (!file) return true;
    return allowedTypes.includes(file.type) || `نوع الملف غير مسموح`;
  };
};
