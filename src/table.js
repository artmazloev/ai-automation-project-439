import fs from 'node:fs';
import { BOM } from './config.js';
import { parseCsv } from './csv.js';

const readJsonTable = (text) => {
  const data = JSON.parse(text);
  const records = (Array.isArray(data) ? data : [data])
    .filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const rows = records.map((record) => Object.fromEntries(columns
    .map((column) => [column, record[column] === undefined || record[column] === null ? '' : String(record[column])])));
  return { columns, rows };
};

const readCsvTable = (text) => {
  const [header = [], ...lines] = parseCsv(text);
  const columns = header.map((column) => column.trim());
  const rows = lines.map((cells) => Object.fromEntries(columns
    .map((column, index) => [column, cells[index] ?? ''])));
  return { columns, rows };
};

// Общее чтение табличного документа для обеих команд: { columns, rows }.
const readTable = (file) => {
  const raw = fs.readFileSync(file.path, 'utf-8');
  const text = raw.startsWith(BOM) ? raw.slice(BOM.length) : raw;
  const trimmed = text.trimStart();
  const isJson = file.ext === 'json' || trimmed.startsWith('[') || trimmed.startsWith('{');
  try {
    return isJson ? readJsonTable(text) : readCsvTable(text);
  } catch {
    return null;
  }
};

export default readTable;
