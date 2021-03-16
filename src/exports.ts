import fs from "fs";
import { tsvFormatRows } from "d3-dsv";
import { getCLIConfigJson } from "./config";
import {
  traverse,
  recursiveReadFile,
  getLangMessages,
  getLangPath,
} from "./utils";
import { CHINESE_CHAR_REGEXP } from "./regexp";

/**
 * 导出未翻译文案
 */
export function exportUntranslatedMessages() {
  const config = getCLIConfigJson();

  const langs = config.langs;

  langs.forEach((lang) => {
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

    if (messagesToTranslate.length === 0) {
      console.log("未找到未翻译的文案");
      return;
    }

    const content = tsvFormatRows(messagesToTranslate);
    const sourceFile = `./export-${lang}`;
    fs.writeFileSync(sourceFile, content);
    console.log(`导出 ${messagesToTranslate.length} 文案`);
  });
}

/**
 * 导出未使用的文案
 */
export function exportUnusedMessages(filePath: string) {
  const langPath = getLangPath("zh-hans");
  const messages = require(langPath);
  const unUnsedKeys: string[] = [];

  traverse(messages, (text, path) => {
    const hasKey = recursiveReadFile("./src", path);

    if (!hasKey) {
      unUnsedKeys.push(`I18N.get("${path}")`);
    }
  });

  console.log(unUnsedKeys);
}
