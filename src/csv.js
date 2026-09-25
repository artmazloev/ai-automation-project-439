const QUOTE = '"';

const countSymbol = (text, symbol) => [...text].filter((item) => item === symbol).length;

const detectDelimiter = (headerLine) => (countSymbol(headerLine, ';') > countSymbol(headerLine, ',') ? ';' : ',');

export const parseCsv = (text) => {
  const normalized = text.replaceAll('\r\n', '\n');
  const delimiter = detectDelimiter(normalized.split('\n')[0]);
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const symbol = normalized[i];
    if (quoted) {
      if (symbol === QUOTE && normalized[i + 1] === QUOTE) {
        value += QUOTE;
        i += 1;
      } else if (symbol === QUOTE) {
        quoted = false;
      } else {
        value += symbol;
      }
    } else if (symbol === QUOTE && value === '') {
      quoted = true;
    } else if (symbol === delimiter) {
      row.push(value);
      value = '';
    } else if (symbol === '\n') {
      rows.push([...row, value]);
      row = [];
      value = '';
    } else {
      value += symbol;
    }
  }
  rows.push([...row, value]);

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
};

const escapeValue = (value) => {
  const text = String(value ?? '');
  const needsQuotes = [',', QUOTE, '\n'].some((symbol) => text.includes(symbol));
  return needsQuotes ? `${QUOTE}${text.replaceAll(QUOTE, QUOTE + QUOTE)}${QUOTE}` : text;
};

export const stringifyCsv = (header, rows) => [header, ...rows]
  .map((cells) => cells.map(escapeValue).join(','))
  .join('\n')
  .concat('\n');
