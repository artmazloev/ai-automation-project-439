import path from 'node:path';
import asTable from 'as-table';
import { formatFilesSummary } from './files.js';
import { formatContactsTotals, listUnmappedColumns } from './contacts.js';
import { REPORT_JSON_INDENT, STATUSES } from './config.js';

const sum = (numbers) => numbers.reduce((total, number) => total + number, 0);

// Отчёт описывает папку целиком, поэтому собирается из обеих половин разбора.
const collectReportData = ({ dir, files, contacts }) => {
  const relative = (filePath) => path.relative(dir, filePath);
  const byStatus = (status) => files.files
    .filter((file) => file.status === status)
    .map((file) => relative(file.path));
  const groups = files.groups.map(({ primary, copies }) => ({
    files: [primary, ...copies]
      .map((file) => ({ path: relative(file.path), size: file.size }))
      .toSorted((a, b) => (a.path < b.path ? -1 : Number(a.path > b.path))),
    extraSize: sum(copies.map((copy) => copy.size)),
  }));
  return {
    folder: dir,
    files: {
      ...files.stats,
      manualReview: byStatus(STATUSES.manual),
      toDelete: byStatus(STATUSES.foreign),
      duplicates: {
        copies: files.stats.copies,
        groups: files.stats.groups,
        extraSize: sum(groups.map((group) => group.extraSize)),
        list: groups,
      },
    },
    contacts: {
      ...contacts.stats,
      sources: contacts.exports.map(({ file, records }) => ({
        source: relative(file.path),
        records: records.length,
      })),
      unmappedColumns: listUnmappedColumns(contacts.exports),
      rejectedValues: contacts.rejectedValues,
      withoutPhoneAndEmail: contacts.withoutKey
        .map((record) => ({ name: record.имя, source: record.источник })),
    },
  };
};

const trimLines = (text) => text.split('\n').map((line) => line.trimEnd()).join('\n');

const table = (rows) => trimLines(asTable(rows));

const fileList = (paths) => paths.map((filePath) => `  ${filePath}`);

export const buildTextReport = (analysis) => {
  const data = collectReportData(analysis);
  const { duplicates } = data.files;
  const lines = [
    `Отчёт по папке ${data.folder}`,
    '',
    '== Документы ==',
    '',
    ...formatFilesSummary(analysis.files),
    '',
    `Требуют ручного разбора (${data.files.manualReview.length})`,
    '',
    'Программа эти файлы не прочитала, содержимое придётся посмотреть человеку.',
    '',
    ...fileList(data.files.manualReview),
    '',
    `Можно удалить (${data.files.toDelete.length})`,
    '',
    'Посторонние файлы: это не документы компании, программа их пропустила.',
    '',
    ...fileList(data.files.toDelete),
    '',
    '== Копии ==',
    '',
    `Копий: ${duplicates.copies} в ${duplicates.groups} группах, освободится места: ${duplicates.extraSize} байт`,
    '',
    'Какую копию из группы оставить, решает человек. Лишний размер — сумма размеров группы без одной копии.',
    ...duplicates.list.flatMap((group, index) => [
      '',
      `Группа ${index + 1}, лишний размер: ${group.extraSize} байт`,
      ...group.files.map((file) => `  ${file.path} (${file.size} байт)`),
    ]),
    '',
    '== Контакты ==',
    '',
    ...formatContactsTotals(analysis.contacts),
    '',
    table(data.contacts.sources.map(({ source, records }) => ({ Источник: source, Записей: records }))),
  ];

  if (data.contacts.unmappedColumns.length > 0) {
    lines.push(
      '',
      `Колонки без соответствия (${data.contacts.unmappedColumns.length})`,
      '',
      table(data.contacts.unmappedColumns.map(({ column, source }) => ({ Колонка: column, Источник: source }))),
    );
  }
  if (data.contacts.rejectedValues.length > 0) {
    lines.push(
      '',
      `Отбракованные значения (${data.contacts.rejectedValues.length})`,
      '',
      'Эти значения не прошли нормализацию и в таблицу не попали.',
      '',
      table(data.contacts.rejectedValues.map(({ field, value, source }) => ({
        Поле: field, Значение: value, Источник: source,
      }))),
    );
  }
  if (data.contacts.withoutPhoneAndEmail.length > 0) {
    lines.push(
      '',
      `Записи без телефона и почты (${data.contacts.withoutPhoneAndEmail.length})`,
      '',
      'Опознать человека не по чему, записи в таблицу не попали.',
      '',
      table(data.contacts.withoutPhoneAndEmail.map(({ name, source }) => ({ Имя: name, Источник: source }))),
    );
  }
  return `${lines.join('\n')}\n`;
};

export const buildJsonReport = (analysis) => `${JSON.stringify(collectReportData(analysis), null, REPORT_JSON_INDENT)}\n`;
