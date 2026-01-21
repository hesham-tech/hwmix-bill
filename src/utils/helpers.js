/**
 * Helper Utilities
 */

/**
 * Debounce function
 */
export const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (fn, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove null/empty values from object
 */
export const removeEmpty = obj => {
  return Object.entries(obj)
    .filter(([_, v]) => v != null && v !== '')
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sleep/delay
 */
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get initials from name
 */
export const getInitials = name => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Check if object is empty
 */
export const isEmpty = obj => {
  return Object.keys(obj).length === 0;
};

/**
 * Pick keys from object
 */
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit keys from object
 */
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Download file from blob
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Get query params from URL
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
};
/**
 * Highlight search text within a string
 * @param {string} text - The full text to search within
 * @param {string} search - The search term to highlight
 * @returns {string} - HTML string with <mark> tags
 */
export const highlightText = (text, search) => {
  if (!search || !text) return text;

  const str = text.toString();
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');

  // Use a very light yellow highlight that doesn't obscure the text
  return str.replace(regex, '<mark style="background-color: #fff9c4; color: inherit; font-weight: bold; border-radius: 2px;">$1</mark>');
};

/**
 * Calculate contrast color (black or white) based on background hex
 */
export const getContrastColor = hexColor => {
  if (!hexColor) return 'inherit';

  // Remove hash if present
  let hex = hexColor.replace('#', '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  if (hex.length !== 6) return 'inherit';

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? 'black' : 'white';
};
