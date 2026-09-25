import { analyzeFiles } from './files.js';
import readTable from './table.js';
import { normalizers } from './normalize.js';
import mergeContacts from './merge.js';
import { stringifyCsv } from './csv.js';
import { byPath } from './utils.js';
import {
  COLUMN_MAP, CONTACT_KEY_FIELDS, CONTACTS_COLUMNS, SOURCES_SEPARATOR, STATUSES, TYPES,
} from './config.js';

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

export const analyzeContacts = (dir, filesResult = analyzeFiles(dir)) => {
  const exports = filesResult.files
    .filter((file) => file.type === TYPES.table && file.status === STATUSES.document)
    .toSorted(byPath)
    .map(readExport)
    .filter((item) => item !== null);
  const raw = exports.flatMap((item) => item.records);
  const normalized = raw.map(normalizeRecord);
  const rejectedValues = normalized.flatMap((item) => item.rejected);
  const records = normalized.map((item) => item.record);
  const hasKey = (record) => record.телефон !== '' || record.почта !== '';
  const withoutKey = records.filter((record) => !hasKey(record));
  const contacts = mergeContacts(records.filter(hasKey));
  const stats = {
    exports: exports.length,
    records: raw.length,
    unique: contacts.length,
    rejectedValues: rejectedValues.length,
    withoutKey: withoutKey.length,
  };
  return {
    exports, contacts, rejectedValues, withoutKey, stats,
  };
};

export const listUnmappedColumns = (exports) => exports
  .flatMap(({ file, unmapped }) => unmapped.map((column) => ({ column, source: file.name })));

export const formatContactsTotals = ({ stats }) => [
  `Выгрузок прочитано: ${stats.exports}, записей: ${stats.records}`,
  `Уникальных контактов: ${stats.unique}`,
  `Отбраковано значений: ${stats.rejectedValues}, записей без телефона и почты: ${stats.withoutKey}`,
];

export const formatContactsSummary = (result) => {
  const unmapped = listUnmappedColumns(result.exports)
    .map(({ column, source }) => `${column} (${source})`);
  return [
    ...result.exports.map(({ file, records }) => `${file.name}: записей ${records.length}`),
    ...formatContactsTotals(result),
    ...(unmapped.length > 0 ? [`Колонки без соответствия: ${unmapped.join(', ')}`] : []),
  ];
};

export const buildContactsTable = (contacts) => stringifyCsv(CONTACTS_COLUMNS, contacts
  .map((contact) => [contact.имя, contact.телефон, contact.почта, contact.источники.join(SOURCES_SEPARATOR)]));
