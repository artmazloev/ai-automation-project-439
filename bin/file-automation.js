#!/usr/bin/env node
import { Command } from 'commander';
import { runFiles, runContacts } from '../src/index.js';
import { DEFAULT_OUT_DIR } from '../src/config.js';

const program = new Command();

const run = (command) => (dir, options) => {
  try {
    console.log(command(dir, options.out).join('\n'));
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
};

program
  .name('file-automation')
  .description('Автоматизация разбора файлов компании')
  .version('1.0.0')
  .showHelpAfterError();

program
  .command('files')
  .description('собрать реестр документов папки')
  .argument('<папка>', 'папка с файлами компании')
  .option('-o, --out <папка>', 'папка для результата', DEFAULT_OUT_DIR)
  .action(run(runFiles));

program
  .command('contacts')
  .description('собрать чистую таблицу контактов')
  .argument('<папка>', 'папка с файлами компании')
  .option('-o, --out <папка>', 'папка для результата', DEFAULT_OUT_DIR)
  .action(run(runContacts));

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
