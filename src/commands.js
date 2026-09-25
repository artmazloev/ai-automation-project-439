import { analyzeFiles, buildRegistry, formatFilesSummary } from './files.js';
import { analyzeContacts, buildContactsTable, formatContactsSummary } from './contacts.js';
import { buildJsonReport, buildTextReport } from './report.js';
import writeOutput from './output.js';
import { OUTPUT_FILES } from './config.js';

// Обе половины считаются один раз: числа идут и в терминал, и в оба отчёта.
const analyze = (dir) => {
  const files = analyzeFiles(dir);
  const contacts = analyzeContacts(dir, files);
  return { dir, files, contacts };
};

const writeReports = (analysis, outDir) => [
  `Отчёт: ${writeOutput(outDir, OUTPUT_FILES.reportText, buildTextReport(analysis))}`,
  `Отчёт для программ: ${writeOutput(outDir, OUTPUT_FILES.reportJson, buildJsonReport(analysis))}`,
];

export const runFiles = (dir, outDir) => {
  const analysis = analyze(dir);
  const registryPath = writeOutput(outDir, OUTPUT_FILES.registry, buildRegistry(analysis.files.files));
  return [
    ...formatFilesSummary(analysis.files),
    `Реестр: ${registryPath}`,
    ...writeReports(analysis, outDir),
  ];
};

export const runContacts = (dir, outDir) => {
  const analysis = analyze(dir);
  const tablePath = writeOutput(outDir, OUTPUT_FILES.contacts, buildContactsTable(analysis.contacts.contacts));
  return [
    ...formatContactsSummary(analysis.contacts),
    `Таблица: ${tablePath}`,
    ...writeReports(analysis, outDir),
  ];
};
