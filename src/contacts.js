import { analyzeFiles } from './files.js';
import readTable from './table.js';
import { normalizers } from './normalize.js';
import { COLUMN_MAP, CONTACT_KEY_FIELDS, STATUSES, TYPES } from './config.js';

const normalizeColumn = (column) => column.trim().toLowerCase();

const findField = (column) => Object.keys(COLUMN_MAP)
  .find((field) => COLUMN_MAP[field].includes(normalizeColumn(column)));

const readExport = (file) => {
  const table = readTable(file);
  if (table === null) {
    return null;
  }
  const fieldOf = new Map(table.columns.map((column) => [column, findField(column)]));
  const fields = [...fieldOf.values()];
  if (!CONTACT_KEY_FIELDS.some((field) => fields.includes(field))) {
    return null;
  }
  const records = table.rows.map((row) => {
    const record = Object.fromEntries(Object.keys(COLUMN_MAP).map((field) => [field, '']));
    table.columns
      .filter((column) => fieldOf.get(column) !== undefined)
      .forEach((column) => {
        const field = fieldOf.get(column);
        record[field] = record[field] || row[column];
      });
    return { ...record, источник: file.name };
  });
  const unmapped = table.columns.filter((column) => fieldOf.get(column) === undefined);
  return { file, records, unmapped };
};

// Нормализует запись и запоминает значения, которые нормализацию не прошли.
const normalizeRecord = (record) => {
  const rejected = [];
  const normalized = { ...record };
  Object.keys(normalizers).forEach((field) => {
    const { value, rejected: isRejected } = normalizers[field](record[field]);
    normalized[field] = value;
    if (isRejected) {
      rejected.push({ field, value: record[field].trim(), source: record.источник });
    }
  });
  return { record: normalized, rejected };
};

const byPath = (a, b) => (a.path < b.path ? -1 : Number(a.path > b.path));

export const analyzeContacts = (dir) => {
  const exports = analyzeFiles(dir).files
    .filter((file) => file.type === TYPES.table && file.status === STATUSES.document)
    .toSorted(byPath)
    .map(readExport)
    .filter((item) => item !== null);
  const raw = exports.flatMap((item) => item.records);
  const normalized = raw.map(normalizeRecord);
  const rejectedValues = normalized.flatMap((item) => item.rejected);
  const records = normalized.map((item) => item.record);
  const withoutKey = records.filter((record) => record.телефон === '' && record.почта === '');
  const stats = {
    exports: exports.length,
    records: raw.length,
    rejectedValues: rejectedValues.length,
    withoutKey: withoutKey.length,
  };
  return {
    exports, records, rejectedValues, withoutKey, stats,
  };
};

export const formatContactsSummary = ({ exports, stats }) => {
  const unmapped = exports
    .flatMap(({ file, unmapped: columns }) => columns.map((column) => `${column} (${file.name})`));
  return [
    ...exports.map(({ file, records }) => `${file.name}: записей ${records.length}`),
    `Выгрузок прочитано: ${stats.exports}, записей: ${stats.records}`,
    ...(unmapped.length > 0 ? [`Колонки без соответствия: ${unmapped.join(', ')}`] : []),
    `Отбраковано значений: ${stats.rejectedValues}, записей без телефона и почты: ${stats.withoutKey}`,
  ];
};

const runContacts = (dir) => formatContactsSummary(analyzeContacts(dir));

export default runContacts;
