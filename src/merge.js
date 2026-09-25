import { createUnionFind } from './utils.js';

const keysOf = (record) => [
  record.телефон === '' ? null : `телефон:${record.телефон}`,
  record.почта === '' ? null : `почта:${record.почта}`,
].filter((key) => key !== null);

// телефон и почта одной записи связываются, чтобы в таблице не было повторов ни по одному из них
const mergeContacts = (records) => {
  const { find, union } = createUnionFind();
  records.forEach((record) => {
    const [first, ...rest] = keysOf(record);
    find(first);
    rest.forEach((key) => union(first, key));
  });

  const contacts = new Map();
  records.forEach((record) => {
    const root = find(keysOf(record)[0]);
    const known = contacts.get(root);
    if (known === undefined) {
      contacts.set(root, {
        имя: record.имя,
        телефон: record.телефон,
        почта: record.почта,
        источники: [record.источник],
      });
      return;
    }
    known.имя = known.имя || record.имя;
    known.телефон = known.телефон || record.телефон;
    known.почта = known.почта || record.почта;
    if (!known.источники.includes(record.источник)) {
      known.источники.push(record.источник);
    }
  });
  return [...contacts.values()];
};

export default mergeContacts;
