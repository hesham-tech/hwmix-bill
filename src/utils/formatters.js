/**
 * Date Formatter Utilities
 */

/**
 * Format date to Arabic locale
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
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
