import fs from 'node:fs';
import { createHash } from 'node:crypto';
import listFiles from './walk.js';
import { detectStatus, detectType } from './detect.js';
import { findDuplicateGroups } from './duplicates.js';
import {
  HASH_ALGORITHM, SIGNATURE_LENGTH, STATUSES, TYPES,
} from './config.js';

const countBy = (items, key, value) => items.filter((item) => item[key] === value).length;

const inspectFile = (file) => {
  const content = fs.readFileSync(file.path);
  const head = content.subarray(0, SIGNATURE_LENGTH);
  const type = detectType(file, head);
  const status = detectStatus(file, head, type);
  const hash = createHash(HASH_ALGORITHM).update(content).digest('hex');
  return { ...file, type, status, hash };
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

export const formatFilesSummary = ({ stats }) => [
  `Файлов найдено: ${stats.total}`,
  `Табличных документов: ${stats.table}, текстовых: ${stats.text}, непарсимых: ${stats.unparsable}`,
  `Документов: ${stats.document}, требуют ручного разбора: ${stats.manual}, посторонних: ${stats.foreign}`,
  `Копий найдено: ${stats.copies} в ${stats.groups} группах`,
];

const runFiles = (dir) => formatFilesSummary(analyzeFiles(dir));

export default runFiles;
