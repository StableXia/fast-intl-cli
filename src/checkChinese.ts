import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { readFile, generateUuidKey } from './utils';
import { readFileSync, patternToFunction } from './readDir';
import { CHINESE_CHAR_REGEXP } from './regexp';
import { removeFileComment, getDate } from './utils';
import { log } from './view';
import { getValFromConfiguration } from './config';

export function findTextInTs(code: string, fileName: string) {
  const matches: any[] = [];
  const ast = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  );

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        const { text } = node as ts.StringLiteral;

        if (text.match(CHINESE_CHAR_REGEXP)) {
          matches.push({
            node,
            text,
            isString: true,
          });
        }

        break;
      }

      case ts.SyntaxKind.JsxElement: {
        const { children } = node as ts.JsxElement;

        children.forEach((child) => {
          if (child.kind === ts.SyntaxKind.JsxText) {
            const text = child.getText();
            /** 修复注释含有中文的情况，Angular 文件错误的 Ast 情况 */
            const noCommentText = removeFileComment(text, fileName);

            if (noCommentText.match(CHINESE_CHAR_REGEXP)) {
              matches.push({
                node,
                text: text.trim(),
                isString: false,
              });
            }
          }
        });

        break;
      }

      case ts.SyntaxKind.TemplateExpression: {
        const { pos, end } = node;
        let templateContent = code.slice(pos, end);
        templateContent = templateContent
          .toString()
          .replace(/\$\{[^\}]+\}/, '');
        if (templateContent.match(CHINESE_CHAR_REGEXP)) {
          const start = node.getStart();
          const end = node.getEnd();
          matches.push({
            node,
            text: code.slice(start + 1, end - 1),
            isString: true,
          });
        }
        break;
      }

      case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
        const { pos, end } = node;
        let templateContent = code.slice(pos, end);
        templateContent = templateContent
          .toString()
          .replace(/\$\{[^\}]+\}/, '');
        if (templateContent.match(CHINESE_CHAR_REGEXP)) {
          const start = node.getStart();
          const end = node.getEnd();
          matches.push({
            node,
            text: code.slice(start + 1, end - 1),
            isString: true,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(ast, visit);

  return matches;
}

export function findChineseText(code: string, fileName: string) {
  return findTextInTs(code, fileName);
}

export function checkChineseText(
  mode: 'terminal' | 'json',
  options: {
    filePath: string;
    outputPath?: string;
    filename?: string;
    pure?: boolean;
  },
) {
  const { filePath, outputPath, filename, pure } = options;

  if (!fs.existsSync(filePath)) {
    log.primary(log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
    return;
  }

  const allChineseText: {
    [file: string]: Array<{ node: ts.Node; text: string; isString: boolean }>;
  } = {};
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

  files.forEach((file) => {
    const code = readFile(file) || '';
    const matches = findChineseText(code, path.basename(file));

    allChineseText[file] = matches;
  });

  if (mode === 'terminal') {
    logChineseText(allChineseText);
    return;
  }

  if (mode === 'json') {
    exportChineseText(allChineseText, outputPath, filename, pure);
  }
}

function logChineseText(allChineseText: {
  [file: string]: Array<{ node: ts.Node; text: string; isString: boolean }>;
}) {
  let count = 0;

  Object.keys(allChineseText).forEach((key) => {
    allChineseText[key].forEach((item) => {
      const { node, text } = item;
      const {
        line,
        character,
      } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());

      log.primary(
        log.chalk.red(`中文文案：[${text}]`),
        log.chalk.blue(`${key}:${line + 1}:${character}`),
      );

      count += 1;
    });
  });
  log.primary();
  log.primary(log.chalk.yellow(`匹配到中文文案共[${count}]处`));
}

function exportChineseText(
  allChineseText: {
    [file: string]: Array<{ node: ts.Node; text: string; isString: boolean }>;
  },
  exportDir?: string,
  filename?: string,
  pure?: boolean,
) {
  const dir = exportDir || './export-lang';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const exportFilename = filename ? `${filename}.json` : `zh-${getDate()}.json`;
  const exportPath = path.resolve(dir, exportFilename);

  if (fs.existsSync(exportPath)) {
    log.primary();
    log.primary(log.chalk.red(`该文件已存在：`), log.chalk.blue(exportPath));
    log.primary();
    process.exit(0);
  }

  let count = 0;
  const temp: any = {};

  Object.keys(allChineseText).forEach((key) => {
    if (allChineseText[key].length === 0) {
      return;
    }

    if (pure) {
      allChineseText[key].forEach((item) => {
        count += 1;
        temp[generateUuidKey()] = item.text
      });
    } else {
      temp[key] = [];

      allChineseText[key].forEach((item) => {
        count += 1;
        const { node, text } = item;
        const {
          line,
          character,
        } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());

        temp[key].push({
          text,
          key: generateUuidKey(),
          position: `${line + 1}:${character}`,
        });
      });
    }
  });

  fs.writeFileSync(exportPath, JSON.stringify(temp, null, 2));

  log.primary();
  log.primary(log.chalk.yellow(`匹配到中文文案共[${count}]处`));
  log.primary();
  log.primary(log.chalk.green(`文案已导入：`), log.chalk.blue(exportPath));
}
