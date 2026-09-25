export const byPath = (a, b) => (a.path < b.path ? -1 : Number(a.path > b.path));

export const sum = (numbers) => numbers.reduce((total, number) => total + number, 0);

export const createUnionFind = () => {
  const parent = new Map();
  const find = (key) => {
    if (!parent.has(key)) {
      parent.set(key, key);
    }
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
  return { find, union };
};
