import fs from "fs";
import { tsvFormatRows } from "d3-dsv";
import { getCLIConfigJson } from "./config";
import { readFileSync, patternToFunction } from "./readDir";
import {
  traverse,
  checkI18NExpressionUsed,
  getLangMessages,
  getLangPath,
} from "./utils";
import { CHINESE_CHAR_REGEXP } from "./regexp";
import { log } from "./view";
import path from "path";

function logUnusedMessages(unUnsedMessages: { [key: string]: string[] }) {
  let total = Object.values(unUnsedMessages).reduce(
    (prev, next) => prev + next.length,
    0
  );

  if (total === 0) {
    log.primary(log.chalk.green("未找到未使用的文案"));
    return;
  }

  Object.keys(unUnsedMessages).forEach((key) => {
    const unUsedKeys = unUnsedMessages[key];
    if (unUsedKeys.length > 0) {
      log.primary();
      log.primary(
        log.chalk.bgRed.white(
          `在【${key}】中找到【${unUsedKeys.length}】处未使用的文案如下：`
        )
      );
      log.primary();
      log.primary(log.chalk.blue(`[\n ${unUsedKeys.join(" \n ")}\n]`));
    }
  });
}

function findUntranslatedMessages(lang: string) {
  const allMessages = getLangMessages(lang);
  const existingTranslations = getLangMessages(
    lang,
    (message, key) =>
      !CHINESE_CHAR_REGEXP.test(allMessages[key]) ||
      allMessages[key] !== message
  );

  const messagesToTranslate = Object.keys(allMessages)
    .filter((key) => !existingTranslations.hasOwnProperty(key))
    .map((key) => {
      let message = allMessages[key];
      message = JSON.stringify(message).slice(1, -1);
      return [key, message];
    });

  return messagesToTranslate;
}

/**
 * 导出未翻译文案
 */
export function exportUntranslatedMessages(exportDir?: string, lang?: string) {
  const config = getCLIConfigJson();
  const langs = lang ? [lang] : config.langs;

  langs.forEach((lang) => {
    const messagesToTranslate = findUntranslatedMessages(lang);

    if (messagesToTranslate.length === 0) {
      log.primary(log.chalk.green(`在[${lang}]中未找到未翻译的文案`));
      return;
    }

    log.primary();
    log.primary(
      log.chalk.bgRed.white(
        `在【${lang}】中找到【${messagesToTranslate.length}】处未翻译的文案：`
      )
    );
    log.primary();
    const content = tsvFormatRows(messagesToTranslate);
    const dir = exportDir || "./export-lang";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(path.join(dir, lang), content);
    log.primary(log.chalk.green(`在[${lang}]中的未翻译文案导出成功`));
  });
}

function findUnusedMessages(
  filePath: string,
  messages: { [key: string]: any }
) {
  const unUnsedKeys: string[] = [];
  const config = getCLIConfigJson();
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

/**
 * 导出未使用的文案
 */
export function exportUnusedMessages(filePath: string, lang: string) {
  if (!fs.existsSync(filePath)) {
    log.primary(log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
    return;
  }

  const unUnsedMessages: { [key: string]: string[] } = {};
  const config = getCLIConfigJson();
  const langs = lang ? [lang] : config.langs;

  langs.forEach((lang) => {
    const langPath = getLangPath(lang);
    const messages = require(langPath);
    const unUnsedKeys = findUnusedMessages(filePath, messages);
    unUnsedMessages[lang] = unUnsedKeys;
  });

  logUnusedMessages(unUnsedMessages);
}
