import {
  EXTENSION_TYPES, SIGNATURES, STATUSES, SYSTEM_FILES, TYPES,
} from './config.js';

const findSignature = (head) => SIGNATURES
  .find(({ bytes }) => head.length >= bytes.length
    && bytes.every((byte, index) => head[index] === byte));

const isText = (head) => {
  if (head.includes(0x00)) {
    return false;
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(head, { stream: true });
    return true;
  } catch {
    return false;
  }
};

const sniffTextType = (head) => {
  const text = new TextDecoder().decode(head).trimStart();
  return text.startsWith('[') || text.startsWith('{') ? 'table' : 'text';
};

const detectTypeKey = (ext, head) => {
  if (findSignature(head)) {
    return 'unparsable';
  }
  if (!isText(head)) {
    return 'unparsable';
  }
  const byExtension = Object.hasOwn(EXTENSION_TYPES, ext) ? EXTENSION_TYPES[ext] : null;
  if (byExtension === 'table' || byExtension === 'text') {
    return byExtension;
  }
  return sniffTextType(head);
};

const isForeign = (file, head) => {
  if (file.size === 0) {
    return true;
  }
  if (SYSTEM_FILES.includes(file.name.toLowerCase()) || file.name.startsWith('.')) {
    return true;
  }
  if (file.ext === '') {
    const signature = findSignature(head);
    return signature !== undefined ? !signature.document : !isText(head);
  }
  return !Object.hasOwn(EXTENSION_TYPES, file.ext);
};

export const detectType = (file, head) => TYPES[detectTypeKey(file.ext, head)];

export const detectStatus = (file, head, type) => {
  if (isForeign(file, head)) {
    return STATUSES.foreign;
  }
  return type === TYPES.unparsable ? STATUSES.manual : STATUSES.document;
};
