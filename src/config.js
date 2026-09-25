export const DEFAULT_OUT_DIR = './out';

export const TYPES = {
  table: 'табличный документ',
  text: 'текстовый документ',
  unparsable: 'непарсимый',
};

export const STATUSES = {
  document: 'документ',
  manual: 'требует ручного разбора',
  foreign: 'постороннее',
};

export const EXTENSION_TYPES = {
  csv: 'table',
  json: 'table',
  txt: 'text',
  md: 'text',
  pdf: 'unparsable',
  jpg: 'unparsable',
  jpeg: 'unparsable',
  xlsx: 'unparsable',
};

// document: true - файл можно отдать человеку на ручной разбор
export const SIGNATURES = [
  { format: 'pdf', bytes: [0x25, 0x50, 0x44, 0x46], document: true },
  { format: 'jpeg', bytes: [0xff, 0xd8, 0xff], document: true },
  { format: 'xlsx', bytes: [0x50, 0x4b, 0x03, 0x04], document: true },
  { format: 'png', bytes: [0x89, 0x50, 0x4e, 0x47], document: false },
  { format: 'gif', bytes: [0x47, 0x49, 0x46, 0x38], document: false },
  { format: 'ole', bytes: [0xd0, 0xcf, 0x11, 0xe0], document: false },
  { format: 'ds_store', bytes: [0x00, 0x00, 0x00, 0x01, 0x42, 0x75, 0x64, 0x31], document: false },
];

export const SIGNATURE_LENGTH = 4096;

export const SYSTEM_FILES = ['.ds_store', 'thumbs.db', 'desktop.ini'];

export const COPY_WORDS = ['копия', 'copy', '-'];

export const HASH_ALGORITHM = 'sha256';

export const BOM = '\uFEFF';

export const OUTPUT_FILES = {
  registry: 'registry.csv',
  contacts: 'contacts.csv',
  reportText: 'report.txt',
  reportJson: 'report.json',
};

export const REGISTRY_COLUMNS = [
  'путь', 'имя', 'тип', 'размер', 'хеш', 'статус', 'основная копия', 'строк', 'колонки',
];

export const LIST_SEPARATOR = ', ';

export const COLUMN_MAP = {
  имя: ['имя', 'фио', 'name'],
  телефон: ['телефон', 'моб. телефон', 'phone'],
  почта: ['почта', 'e-mail', 'email', 'mail'],
};

export const CONTACT_KEY_FIELDS = ['телефон', 'почта'];

export const EMPTY_PLACEHOLDERS = ['-', 'null', 'none', 'n/a'];

export const PHONE = {
  length: 11,
  countryCode: '7',
  trunkPrefix: '8',
  digits: '0123456789',
};

export const CONTACTS_COLUMNS = ['имя', 'телефон', 'почта', 'источники'];

export const SOURCES_SEPARATOR = '; ';

export const REPORT_JSON_INDENT = 2;
