import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useUserStore } from '@/stores/user';

dayjs.locale('ar');

let userStore = null;
const getUserStore = () => {
  if (!userStore) {
    try {
      userStore = useUserStore();
    } catch (e) {
      // Pinia not active yet
    }
  }
  return userStore;
};

/**
 * Date Formatter Utilities
 */

/**
 * Format date to Arabic locale / custom settings
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';

  const d = dayjs(date);
  if (!d.isValid()) return '-';

  if (typeof options === 'string') {
    return d.format(options);
  }

  let formatPattern = 'dddd D / M / YYYY';
  let separator = '/';

  const store = getUserStore();
  if (store?.currentCompany?.settings?.date_format) {
    formatPattern = store.currentCompany.settings.date_format;
  }
  
  const savedSeparator = store?.currentCompany?.settings?.date_separator;
  if (savedSeparator !== undefined && savedSeparator !== null && savedSeparator !== '') {
    separator = savedSeparator;
  }

  formatPattern = formatPattern.replace(/[-/]/g, separator);

  return d.format(formatPattern);
};

/**
 * Format date to short format
 */
export const formatDateShort = date => {
  return formatDate(date);
};

/**
 * Format datetime
 */
export const formatDateTime = date => {
  if (!date) return '-';

  const datePart = formatDate(date);
  const timePart = formatTime(date);

  return `${datePart} | ${timePart}`;
};

/**
 * Format time
 */
export const formatTime = date => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'EGP') => {
  if (amount === null || amount === undefined) return '-';

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(amount);

  const symbol = currency === 'EGP' ? 'ج' : currency;

  return `\u200E${formattedAmount} ${symbol}`;
};

/**
 * Format number
 */
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '-';

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);

  return `\u200E${formattedNumber}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';

  return `${formatNumber(value, decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Parse date from string
 */
export const parseDate = dateString => {
  if (!dateString) return null;
  return new Date(dateString);
};

/**
 * Get relative time (e.g., "منذ ساعتين")
 */
export const getRelativeTime = date => {
  if (!date) return '-';

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;

  return formatDate(date);
};
/**
 * Interpret balance as Asset (+) or Liability (-)
 * returns { absValue, isAsset, isLiability }
 */
export const getBalanceMetadata = amount => {
  const numAmount = parseFloat(amount || 0);
  const absValue = Math.abs(numAmount);
  // Treat very small values as zero to avoid "-0" type displays
  const isZero = absValue < 0.01;
  
  return {
    absValue: isZero ? 0 : absValue,
    isAsset: !isZero && numAmount > 0,
    isLiability: !isZero && numAmount < 0,
    isZero: isZero,
    raw: numAmount,
  };
};
