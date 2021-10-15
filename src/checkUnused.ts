import fs from 'fs';
import path from 'path';
import { getValFromConfiguration } from './config';
import { readFileSync, patternToFunction } from './readDir';
import { traverse, checkI18NExpressionUsed, getLangMessages } from './utils';
import { log } from './view';

function logUnusedMessages(unUnsedMessages: { [key: string]: string[] }) {
  let total = Object.values(unUnsedMessages).reduce(
    (prev, next) => prev + next.length,
    0,
  );

  if (total === 0) {
    log.primary(log.chalk.green('未找到未使用的文案'));
    return;
  }

  Object.keys(unUnsedMessages).forEach((key) => {
    const unUsedKeys = unUnsedMessages[key];
    if (unUsedKeys.length > 0) {
      log.primary();
      log.primary(
        log.chalk.bgRed.white(
          `在【${key}】中找到【${unUsedKeys.length}】处未使用的文案如下：`,
        ),
      );
      log.primary();
      log.primary(log.chalk.blue(`[\n ${unUsedKeys.join(' \n ')}\n]`));
    }
  });
}

function findUnusedMessages(
  filePath: string,
  messages: { [key: string]: any },
) {
  const unUnsedKeys: string[] = [];
  const config = getValFromConfiguration();
  const files = readFileSync(filePath, (file, stats) => {
    const basename = path.basename(file);

    if (stats.isFile()) {
      const check = patternToFunction(config.ignoreFile, () => false);
      return !check(basename, stats);
    }

    if (stats.isDirectory()) {
      const check = patternToFunction(config.ignoreDir, () => false);
      return !check(basename, stats);
    }

    return false;
  });

  traverse(messages, (text, fullKey) => {
    const hasKey = checkI18NExpressionUsed(files, fullKey);

    if (!hasKey) {
      unUnsedKeys.push(`I18N.get("${fullKey}")`);
    }
  });

  return unUnsedKeys;
}

export function checkUnusedMessages(filePath: string, lang: string) {
  if (!fs.existsSync(filePath)) {
    log.primary(log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
    return;
  }

  const unUnsedMessages: { [key: string]: string[] } = {};
  const config = getValFromConfiguration();
  const langs = lang ? [lang] : config.langs;

  langs.forEach((lang) => {
    const allMessages = getLangMessages(lang);
    const unUnsedKeys = findUnusedMessages(filePath, allMessages);
    unUnsedMessages[lang] = unUnsedKeys;
  });

  logUnusedMessages(unUnsedMessages);
}
