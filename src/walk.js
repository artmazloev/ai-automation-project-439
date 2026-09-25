import fs from 'node:fs';
import path from 'node:path';

const describeFile = (filePath) => ({
  path: filePath,
  name: path.basename(filePath),
  ext: path.extname(filePath).slice(1).toLowerCase(),
  size: fs.statSync(filePath).size,
});

// Единственное место, где программа обходит папку: им пользуются обе команды.
const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => describeFile(path.join(dir, entry.name)));

export default listFiles;
