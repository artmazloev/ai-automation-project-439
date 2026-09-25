import fs from 'node:fs';
import path from 'node:path';

const writeOutput = (outDir, fileName, content) => {
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
};

export default writeOutput;
