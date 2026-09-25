import { analyzeFiles } from './files.js';
import readTable from './table.js';
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

const byPath = (a, b) => (a.path < b.path ? -1 : Number(a.path > b.path));

export const analyzeContacts = (dir) => {
  const exports = analyzeFiles(dir).files
    .filter((file) => file.type === TYPES.table && file.status === STATUSES.document)
    .toSorted(byPath)
    .map(readExport)
    .filter((item) => item !== null);
  const records = exports.flatMap((item) => item.records);
  const stats = {
    exports: exports.length,
    records: records.length,
  };
  return { exports, records, stats };
};

export const formatContactsSummary = ({ exports, stats }) => {
  const unmapped = exports
    .flatMap(({ file, unmapped: columns }) => columns.map((column) => `${column} (${file.name})`));
  return [
    ...exports.map(({ file, records }) => `${file.name}: записей ${records.length}`),
    `Выгрузок прочитано: ${stats.exports}, записей: ${stats.records}`,
    ...(unmapped.length > 0 ? [`Колонки без соответствия: ${unmapped.join(', ')}`] : []),
  ];
};

const runContacts = (dir) => formatContactsSummary(analyzeContacts(dir));

export default runContacts;
