#!/usr/bin/env node
import { Command } from 'commander';
import { runFiles, runContacts } from '../src/index.js';
import { DEFAULT_OUT_DIR } from '../src/config.js';

const program = new Command();

const print = (lines) => console.log(lines.join('\n'));

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
  .action((dir, options) => print(runFiles(dir, options.out)));

program
  .command('contacts')
  .description('собрать чистую таблицу контактов')
  .argument('<папка>', 'папка с файлами компании')
  .option('-o, --out <папка>', 'папка для результата', DEFAULT_OUT_DIR)
  .action((dir, options) => print(runContacts(dir, options.out)));

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
