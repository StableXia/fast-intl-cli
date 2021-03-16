import ts from "typescript";
import fs from "fs";
import path from "path";
import { readFile } from "./utils";
import { log } from "./view";
import { getLangMessages } from "./exports";
import { findI18NExpressionInFile } from "./ast";
import { readFileSync, patternToFunction } from "./readDir";
import { getCLIConfigJson } from "./config";

function findI18NExpression(filePath: string) {
  const code = readFile(filePath) || "";
  const expressions = findI18NExpressionInFile(code);

  return expressions;
}

function checkI18NExpressionInMessages(
  messages: { [key: string]: string },
  node: ts.Node
) {
  return !Object.keys(messages).every(
    (key) => !new RegExp(`I18N.get\\(['"]${key}['"][\\),]`).test(node.getText())
  );
}

function findUndefI18NExpression(
  I18NExpression: {
    [file: string]: ts.Node[];
  },
  messages: { [key: string]: string }
) {
  const undefI18NExpression: { [file: string]: ts.Node[] } = {};

  Object.keys(I18NExpression).forEach((key) => {
    const temp: ts.Node[] = [];

    I18NExpression[key].forEach((node) => {
      if (!checkI18NExpressionInMessages(messages, node)) {
        temp.push(node);
      }
    });

    if (temp.length > 0) {
      undefI18NExpression[key] = temp;
    }
  });

  return undefI18NExpression;
}

function logUndefI18NExpression(undefI18NExpression: {
  [lang: string]: {
    count: number;
    undefI18NExpression: { [file: string]: ts.Node[] };
  };
}) {
  let total = Object.values(undefI18NExpression).reduce(
    (prev, next) => prev + next.count,
    0
  );

  if (total === 0) {
    log.primary(log.chalk.green("未找到未定义但使用的 I18N 声明"));
    return;
  }

  Object.keys(undefI18NExpression).forEach((key) => {
    const item = undefI18NExpression[key];

    if (item.count > 0) {
      log.primary();
      log.primary(
        log.chalk.bgRed.white(
          `在【${key}】中找到【${item.count}】处未定义但使用的 I18N 声明如下：`
        )
      );
      log.primary();

      Object.keys(item.undefI18NExpression).forEach((key, i) => {
        item.undefI18NExpression[key].forEach((node) => {
          const {
            line,
            character,
          } = node
            .getSourceFile()
            .getLineAndCharacterOfPosition(node.getStart());
          log.primary(
            log.chalk.red(`未定义：[${node.getText()}]`),
            log.chalk.blue(`${key}:${line + 1}:${character}`)
          );
        });
      });
    }
  });
}

/**
 * 校验文件中使用了国际化语法，但是未在语言文件中定义的文案
 */
export function checkUndefinedMessages(filePath: string, lang?: string) {
  if (!fs.existsSync(filePath)) {
    log.primary(log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
    return;
  }

  const config = getCLIConfigJson();
  const allI18NExpression: { [file: string]: ts.Node[] } = {};
  const allUndefI18NExpression: {
    [lang: string]: {
      count: number;
      undefI18NExpression: { [file: string]: ts.Node[] };
    };
  } = {};
  const langs = lang ? [lang] : config.langs;

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

  files.forEach((file) => {
    const I18NExpression = findI18NExpression(file);
    if (I18NExpression.length > 0) {
      allI18NExpression[file] = I18NExpression;
    }
  });

  langs.forEach((lang) => {
    const messages = getLangMessages(lang);

    const undefI18NExpression = findUndefI18NExpression(
      allI18NExpression,
      messages
    );

    allUndefI18NExpression[lang] = {
      undefI18NExpression,
      count: Object.values(undefI18NExpression).reduce(
        (prev, next) => prev + next.length,
        0
      ),
    };
  });

  logUndefI18NExpression(allUndefI18NExpression);
}
