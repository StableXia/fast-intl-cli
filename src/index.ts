#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import packageJson from '../package.json';
import { initFastIntl, initLangs } from './init';
import { checkUntranslatedMessages } from './checkUntranslated';
import { checkUnusedMessages } from './checkUnused';
import { checkUndefinedMessages } from './checkUndefined';
import { checkChineseText } from './checkChinese';
import { spining, log } from './view';
import { getFastIntlConfig } from './config';
import babelRegister from './babelRegister';

const configPath = getFastIntlConfig();

babelRegister.setOnlyMap({
  key: 'config',
  value: configPath ? [configPath] : [],
});

commander
  .version(packageJson.version, '-v, --version')
  .name('ftintl')
  .usage('国际化工具');

commander
  .command('init')
  .description('初始化多语言配置')
  .action(async () => {
    if (configPath) {
      log.error('初始化失败，ftintl相关配置已存在');
      return;
    }

    const { fileType } = await inquirer.prompt({
      type: 'list',
      name: 'fileType',
      choices: ['ts', 'js'],
      default: 'ts',
      message: '请选择使用的语言',
    });

    initFastIntl({ fileType });
    initLangs();
  });

/**
 * 校验资源文件中未翻译的文案
 */
commander
  .command('untranslated [mode]')
  .option('--output-path <outputPath>', '输出目录', 'ftintl-untranslated-lang')
  .option('--lang [lang]', '要检查的语言')
  .description('校验资源文件中未翻译的文案')
  .action((mode = 'terminal', options) => {
    spining('校验资源文件中未翻译的文案', () => {
      checkUntranslatedMessages(mode, {
        outputPath: options.outputPath,
        lang: options.lang,
      });
    });
  });

/**
 * 校验资源文件中未使用文案
 */
commander
  .command('unused')
  .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
  .option('--lang [lang]', '要检查的语言')
  .description('校验资源文件中未使用文案')
  .action((options) => {
    spining('校验资源文件中未使用文案', () => {
      checkUnusedMessages(options.file, options.lang);
    });
  });

/**
 * 校验已使用但未在资源文件定义的文案
 */
commander
  .command('undefined')
  .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
  .option('--lang [lang]', '要检查的语言')
  .description('校验已使用但未在资源文件定义的文案')
  .action((options) => {
    spining('校验已使用但未在资源文件定义的文案', () => {
      checkUndefinedMessages(options.file, options.lang);
    });
  });

/**
 * 检查文件中的中文文案
 */
commander
  .command('zh [mode]')
  .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
  .option('--output-path [outputPath]', '输出目录', 'ftintl-zh-lang')
  .description('检查文件中的中文文案')
  .action((mode = 'terminal', options) => {
    spining('检查文件中的中文文案', () => {
      checkChineseText(mode, {
        filePath: options.file,
        outputPath: options.outputPath,
      });
    });
  });

commander.parseAsync(process.argv);
