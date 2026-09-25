import fs from 'node:fs';
import { createHash } from 'node:crypto';
import listFiles from './walk.js';
import readTable from './table.js';
import writeOutput from './output.js';
import { stringifyCsv } from './csv.js';
import { detectStatus, detectType } from './detect.js';
import { findDuplicateGroups } from './duplicates.js';
import {
  HASH_ALGORITHM, LIST_SEPARATOR, OUTPUT_FILES, REGISTRY_COLUMNS, SIGNATURE_LENGTH, STATUSES, TYPES,
} from './config.js';

const countBy = (items, key, value) => items.filter((item) => item[key] === value).length;

const describeTable = (file) => {
  const table = file.type === TYPES.table ? readTable(file) : null;
  return table === null ? { rows: '', columns: [] } : { rows: table.rows.length, columns: table.columns };
};

const inspectFile = (file) => {
  const content = fs.readFileSync(file.path);
  const head = content.subarray(0, SIGNATURE_LENGTH);
  const type = detectType(file, head);
  const status = detectStatus(file, head, type);
  const hash = createHash(HASH_ALGORITHM).update(content).digest('hex');
  const inspected = { ...file, type, status, hash };
  return { ...inspected, ...describeTable(inspected) };
};

export const analyzeFiles = (dir) => {
  const inspected = listFiles(dir).map(inspectFile);
  const groups = findDuplicateGroups(inspected);
  const primaryOf = new Map(groups
    .flatMap(({ primary, copies }) => copies.map((copy) => [copy.path, primary.path])));
  const files = inspected
    .map((file) => ({ ...file, primary: primaryOf.get(file.path) ?? '' }));
  const stats = {
    total: files.length,
    table: countBy(files, 'type', TYPES.table),
    text: countBy(files, 'type', TYPES.text),
    unparsable: countBy(files, 'type', TYPES.unparsable),
    document: countBy(files, 'status', STATUSES.document),
    manual: countBy(files, 'status', STATUSES.manual),
    foreign: countBy(files, 'status', STATUSES.foreign),
    copies: primaryOf.size,
    groups: groups.length,
  };
  return { files, groups, stats };
};

const buildRegistry = (files) => stringifyCsv(REGISTRY_COLUMNS, files.map((file) => [
  file.path,
  file.name,
  file.type,
  file.size,
  file.hash,
  file.status,
  file.primary,
  file.rows,
  file.columns.join(LIST_SEPARATOR),
]));

export const formatFilesSummary = ({ stats }) => [
  `Файлов найдено: ${stats.total}`,
  `Табличных документов: ${stats.table}, текстовых: ${stats.text}, непарсимых: ${stats.unparsable}`,
  `Документов: ${stats.document}, требуют ручного разбора: ${stats.manual}, посторонних: ${stats.foreign}`,
  `Копий найдено: ${stats.copies} в ${stats.groups} группах`,
];

const runFiles = (dir, outDir) => {
  const result = analyzeFiles(dir);
  const registryPath = writeOutput(outDir, OUTPUT_FILES.registry, buildRegistry(result.files));
  return [...formatFilesSummary(result), `Реестр: ${registryPath}`];
};

export default runFiles;
