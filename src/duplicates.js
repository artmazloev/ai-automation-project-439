import path from 'node:path';
import { COPY_WORDS } from './config.js';

// «Счёт (1).csv», «Копия счёт.csv», «СЧЁТ.CSV» → «счёт.csv».
export const normalizeName = (name) => {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '');
  const words = base.split(' ').filter((word) => word !== '' && !COPY_WORDS.includes(word));
  return `${words.join(' ')}${ext}`;
};

const depth = (filePath) => filePath.split(path.sep).length;

// Правило основной копии: файл с «чистым» именем, затем ближе к корню, затем по пути.
const comparePrimary = (a, b) => {
  const aDirty = Number(a.name !== normalizeName(a.name));
  const bDirty = Number(b.name !== normalizeName(b.name));
  if (aDirty !== bDirty) {
    return aDirty - bDirty;
  }
  if (depth(a.path) !== depth(b.path)) {
    return depth(a.path) - depth(b.path);
  }
  return a.path < b.path ? -1 : Number(a.path > b.path);
};

const byPath = (a, b) => (a.path < b.path ? -1 : Number(a.path > b.path));

// Группы копий: файлы связаны, если совпал хеш или приведённое имя.
export const findDuplicateGroups = (files) => {
  const candidates = files.filter((file) => file.size > 0).toSorted(byPath);
  const parent = new Map(candidates.map((file) => [file.path, file.path]));
  const find = (key) => {
    const root = parent.get(key);
    if (root === key) {
      return key;
    }
    const top = find(root);
    parent.set(key, top);
    return top;
  };
  const union = (a, b) => {
    const [rootA, rootB] = [find(a), find(b)].toSorted();
    parent.set(rootB, rootA);
  };

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
