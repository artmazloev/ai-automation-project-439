import fs from 'node:fs';
import path from 'node:path';

const describeFile = (filePath) => ({
  path: filePath,
  name: path.basename(filePath),
  ext: path.extname(filePath).slice(1).toLowerCase(),
  size: fs.statSync(filePath).size,
});

// Единственное место, где программа обходит папку: им пользуются обе команды.
// Встретив вложенную папку, функция зовёт себя для неё — глубина не ограничена.
const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }
    return entry.isFile() ? [describeFile(entryPath)] : [];
  });

export default listFiles;
