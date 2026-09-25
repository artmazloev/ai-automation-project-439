import listFiles from './walk.js';

export const analyzeFiles = (dir) => {
  const files = listFiles(dir);
  return { files, stats: { total: files.length } };
};

export const formatFilesSummary = ({ stats }) => [
  `Файлов найдено: ${stats.total}`,
];

const runFiles = (dir) => formatFilesSummary(analyzeFiles(dir));

export default runFiles;
