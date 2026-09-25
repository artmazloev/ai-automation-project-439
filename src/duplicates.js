import path from 'node:path';
import { COPY_WORDS } from './config.js';
import { byPath, createUnionFind } from './utils.js';

// "Счёт (1).csv", "Копия счёт.csv", "СЧЁТ.CSV" -> "счёт.csv"
export const normalizeName = (name) => {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '');
  const words = base.split(' ').filter((word) => word !== '' && !COPY_WORDS.includes(word));
  return `${words.join(' ')}${ext}`;
};

const depth = (filePath) => filePath.split(path.sep).length;

// основной считаем копию с чистым именем, потом ту, что ближе к корню
const comparePrimary = (a, b) => {
  const aDirty = Number(a.name !== normalizeName(a.name));
  const bDirty = Number(b.name !== normalizeName(b.name));
  if (aDirty !== bDirty) {
    return aDirty - bDirty;
  }
  if (depth(a.path) !== depth(b.path)) {
    return depth(a.path) - depth(b.path);
  }
  return byPath(a, b);
};

export const findDuplicateGroups = (files) => {
  const candidates = files.filter((file) => file.size > 0).toSorted(byPath);
  const { find, union } = createUnionFind();
  const seen = new Map();

  candidates.forEach((file) => {
    [`hash:${file.hash}`, `name:${normalizeName(file.name)}`].forEach((key) => {
      if (seen.has(key)) {
        union(seen.get(key), file.path);
      } else {
        seen.set(key, file.path);
      }
    });
  });

  const components = Map.groupBy(candidates, (file) => find(file.path));
  return [...components.values()]
    .filter((members) => members.length > 1)
    .map((members) => {
      const [primary, ...copies] = members.toSorted(comparePrimary);
      return { primary, copies };
    })
    .toSorted((a, b) => byPath(a.primary, b.primary));
};
