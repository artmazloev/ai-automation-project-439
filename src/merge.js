const keysOf = (record) => [
  record.телефон === '' ? null : `телефон:${record.телефон}`,
  record.почта === '' ? null : `почта:${record.почта}`,
].filter((key) => key !== null);

// Склейка записей об одном человеке. Ключ записи — телефон, без него — почта;
// запись с телефоном и почтой связывает оба ключа, поэтому в результате
// нет двух строк ни с одинаковым телефоном, ни с одинаковой почтой.
const mergeContacts = (records) => {
  const parent = new Map();
  const find = (key) => {
    const root = parent.get(key);
    if (root === key) {
      return key;
    }
    const top = find(root);
    parent.set(key, top);
    return top;
  };
  records.flatMap(keysOf).forEach((key) => parent.set(key, key));
  records.forEach((record) => {
    const [first, ...rest] = keysOf(record);
    rest.forEach((key) => parent.set(find(key), find(first)));
  });

  const contacts = new Map();
  records.forEach((record) => {
    const [key] = keysOf(record);
    const root = find(key);
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
