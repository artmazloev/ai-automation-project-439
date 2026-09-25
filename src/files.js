import fs from 'node:fs';
import listFiles from './walk.js';
import { detectStatus, detectType } from './detect.js';
import { SIGNATURE_LENGTH, STATUSES, TYPES } from './config.js';

const countBy = (items, key, value) => items.filter((item) => item[key] === value).length;

const inspectFile = (file) => {
  const content = fs.readFileSync(file.path);
  const head = content.subarray(0, SIGNATURE_LENGTH);
  const type = detectType(file, head);
  const status = detectStatus(file, head, type);
  return { ...file, type, status };
};

export const analyzeFiles = (dir) => {
  const files = listFiles(dir).map(inspectFile);
  const stats = {
    total: files.length,
    table: countBy(files, 'type', TYPES.table),
    text: countBy(files, 'type', TYPES.text),
    unparsable: countBy(files, 'type', TYPES.unparsable),
    document: countBy(files, 'status', STATUSES.document),
    manual: countBy(files, 'status', STATUSES.manual),
    foreign: countBy(files, 'status', STATUSES.foreign),
  };
  return { files, stats };
};

export const formatFilesSummary = ({ stats }) => [
  `Файлов найдено: ${stats.total}`,
  `Табличных документов: ${stats.table}, текстовых: ${stats.text}, непарсимых: ${stats.unparsable}`,
  `Документов: ${stats.document}, требуют ручного разбора: ${stats.manual}, посторонних: ${stats.foreign}`,
];

const runFiles = (dir) => formatFilesSummary(analyzeFiles(dir));

export default runFiles;
