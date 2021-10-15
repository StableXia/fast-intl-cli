import fs from 'fs';
import path from 'path';
import { tsvFormatRows } from 'd3-dsv';
import { getValFromConfiguration } from './config';
import { getLangMessages } from './utils';
import { CHINESE_CHAR_REGEXP } from './regexp';
import { log } from './view';

function findUntranslatedMessages(lang: string) {
  const allMessages = getLangMessages(lang);
  const existingTranslations = getLangMessages(
    lang,
    (message, key) =>
      !CHINESE_CHAR_REGEXP.test(allMessages[key]) ||
      allMessages[key] !== message,
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

export function checkUntranslatedMessages(
  mode: 'terminal' | 'json',
  options: { outputPath: string; lang?: string },
) {
  const config = getValFromConfiguration();
  const langs = options.lang ? [options.lang] : config.langs;

  langs.forEach((lang) => {
    const messagesToTranslate = findUntranslatedMessages(lang);

    if (mode === 'terminal') {
      logUntranslatedMessages(messagesToTranslate, lang);
      return;
    }

    if (mode === 'json') {
      exportUntranslatedMessages(messagesToTranslate, lang, options.outputPath);
    }
  });
}

export function logUntranslatedMessages(messages: any, lang: string) {
  if (messages.length === 0) {
    log.primary(log.chalk.green(`在[${lang}]中未找到未翻译的文案`));
  } else {
    log.primary(
      log.chalk.bgRed.white(
        `在【${lang}】中找到【${messages.length}】处未翻译的文案：`,
      ),
    );
  }
}

export function exportUntranslatedMessages(
  messages: any,
  lang: string,
  outputPath: string,
) {
  const content = tsvFormatRows(messages);
  const dir = path.resolve(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(path.join(dir, lang), content);
  log.primary(log.chalk.green(`在[${lang}]中的未翻译文案导出成功`));
}
