import { EMPTY_PLACEHOLDERS, PHONE } from './config.js';

const EMPTY = { value: '', rejected: false };
const REJECTED = { value: '', rejected: true };

const isEmpty = (value) => {
  const text = String(value ?? '').trim();
  return text === '' || EMPTY_PLACEHOLDERS.includes(text.toLowerCase());
};

// 8-921-555-14-95, +7 (921) 555-14-95, 9215551495 → 79215551495.
export const normalizePhone = (value) => {
  if (isEmpty(value)) {
    return EMPTY;
  }
  const digits = [...String(value)].filter((symbol) => PHONE.digits.includes(symbol)).join('');
  if (digits.length === PHONE.length - 1) {
    return { value: `${PHONE.countryCode}${digits}`, rejected: false };
  }
  const prefix = digits[0];
  if (digits.length === PHONE.length && [PHONE.countryCode, PHONE.trunkPrefix].includes(prefix)) {
    return { value: `${PHONE.countryCode}${digits.slice(1)}`, rejected: false };
  }
  return REJECTED;
};

export const normalizeEmail = (value) => {
  if (isEmpty(value)) {
    return EMPTY;
  }
  const email = String(value).trim().toLowerCase();
  const parts = email.split('@');
  const valid = parts.length === 2 && parts.every((part) => part !== '') && !email.includes(' ');
  return valid ? { value: email, rejected: false } : REJECTED;
};

const capitalize = (word) => word
  .split('-')
  .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
  .join('-');

export const normalizeName = (value) => {
  if (isEmpty(value)) {
    return EMPTY;
  }
  const words = String(value).split(' ').filter((word) => word.trim() !== '');
  return { value: words.map((word) => capitalize(word.trim())).join(' '), rejected: false };
};

export const normalizers = {
  имя: normalizeName,
  телефон: normalizePhone,
  почта: normalizeEmail,
};
