const slugify = require('slugify');

/**
 * Generate a clean URL slug from a Vietnamese string
 */
const createSlug = (text) => {
  if (!text) return '';
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true
  });
};

/**
 * Validate that a URL is safe for redirect/external links
 * Prevents javascript: and data: injection attacks
 */
const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Format currency VND
 */
const formatVND = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

module.exports = {
  createSlug,
  isSafeUrl,
  formatVND
};
