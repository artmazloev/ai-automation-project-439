const QUOTE = '"';

export const detectDelimiter = (headerLine) => {
  const commas = [...headerLine].filter((symbol) => symbol === ',').length;
  const semicolons = [...headerLine].filter((symbol) => symbol === ';').length;
  return semicolons > commas ? ';' : ',';
};

// Разбор csv с учётом значений в кавычках.
export const parseCsv = (text) => {
  const lines = text.split(/\r?\n/);
  const delimiter = detectDelimiter(lines[0] ?? '');
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  const symbols = [...text];
  symbols.forEach((symbol, index) => {
    if (quoted) {
      if (symbol === QUOTE && symbols[index + 1] === QUOTE) {
        value += QUOTE;
        symbols[index + 1] = '';
      } else if (symbol === QUOTE) {
        quoted = false;
      } else {
        value += symbol;
      }
      return;
    }
    if (symbol === QUOTE && value === '') {
      quoted = true;
    } else if (symbol === delimiter) {
      row.push(value);
      value = '';
    } else if (symbol === '\n') {
      row.push(value.endsWith('\r') ? value.slice(0, -1) : value);
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += symbol;
    }
  });
  if (value !== '' || row.length > 0) {
    row.push(value.endsWith('\r') ? value.slice(0, -1) : value);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
};

const escapeValue = (value) => {
  const text = String(value ?? '');
  const needsQuotes = [',', ';', QUOTE, '\n', '\r'].some((symbol) => text.includes(symbol));
  return needsQuotes ? `${QUOTE}${text.replaceAll(QUOTE, QUOTE + QUOTE)}${QUOTE}` : text;
};

export const stringifyCsv = (header, rows) => [header, ...rows]
  .map((cells) => cells.map(escapeValue).join(','))
  .join('\n')
  .concat('\n');
