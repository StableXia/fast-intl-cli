import ts from "typescript";
import fs from "fs";
import path from "path";
import * as compiler from "@angular/compiler";
import * as compilerVue from "vue-template-compiler";

import { readFile, generateUuidKey } from "./utils";
import { readFileSync, patternToFunction } from "./readDir";
import { CHINESE_CHAR_REGEXP } from "./regexp";
import { removeFileComment, getDate } from "./utils";
import { log } from "./view";
import { getValFromConfiguration } from "./config";

const DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;

function findTextInHtml(code: string) {
  const matches: any[] = [];
  const ast = compiler.parseTemplate(code, "ast.html", {
    preserveWhitespaces: false,
  });

  function visit(node: any) {
    const value = node.value;
    if (value && typeof value === "string" && value.match(DOUBLE_BYTE_REGEX)) {
      const valueSpan = node.valueSpan || node.sourceSpan;
      let {
        start: { offset: startOffset },
        end: { offset: endOffset },
      } = valueSpan;
      const nodeValue = code.slice(startOffset, endOffset);
      let isString = false;
      /** 处理带引号的情况 */
      if (nodeValue.charAt(0) === '"' || nodeValue.charAt(0) === "'") {
        isString = true;
      }
      const range = { start: startOffset, end: endOffset };
      matches.push({
        range,
        text: value,
        isString,
      });
    } else if (
      value &&
      typeof value === "object" &&
      value.source &&
      value.source.match(DOUBLE_BYTE_REGEX)
    ) {
      /**
       * <span>{{expression}}中文</span> 这种情况的兼容
       */
      const chineseMatches = value.source.match(DOUBLE_BYTE_REGEX);
      chineseMatches.map((match: any) => {
        const valueSpan = node.valueSpan || node.sourceSpan;
        let {
          start: { offset: startOffset },
          end: { offset: endOffset },
        } = valueSpan;
        const nodeValue = code.slice(startOffset, endOffset);
        const start = nodeValue.indexOf(match);
        const end = start + match.length;
        const range = { start, end };
        matches.push({
          range,
          text: match[0],
          isString: false,
        });
      });
    }

    if (node.children && node.children.length) {
      node.children.forEach(visit);
    }
    if (node.attributes && node.attributes.length) {
      node.attributes.forEach(visit);
    }
  }

  if (ast.nodes && ast.nodes.length) {
    ast.nodes.forEach(visit);
  }
  return matches;
}

function findVueText(ast: any) {
  let arr: any[] = [];
  const regex1 = /\`(.+?)\`/g;
  function emun(ast: any) {
    if (ast.expression) {
      let text = ast.expression.match(regex1);
      if (text && text[0].match(DOUBLE_BYTE_REGEX)) {
        text.forEach((itemText: any) => {
          const varInStr = itemText.match(/(\$\{[^\}]+?\})/g);
          if (varInStr)
            itemText.match(DOUBLE_BYTE_REGEX) &&
              arr.push({
                text: " " + itemText,
                range: { start: ast.start + 2, end: ast.end - 2 },
                isString: true,
              });
          else
            itemText.match(DOUBLE_BYTE_REGEX) &&
              arr.push({
                text: itemText,
                range: { start: ast.start, end: ast.end },
                isString: false,
              });
        });
      } else {
        ast.tokens &&
          ast.tokens.forEach((element: any) => {
            if (
              typeof element === "string" &&
              element.match(DOUBLE_BYTE_REGEX)
            ) {
              arr.push({
                text: element,
                range: {
                  start: ast.start + ast.text.indexOf(element),
                  end: ast.start + ast.text.indexOf(element) + element.length,
                },
                isString: false,
              });
            }
          });
      }
    } else if (!ast.expression && ast.text) {
      ast.text.match(DOUBLE_BYTE_REGEX) &&
        arr.push({
          text: ast.text,
          range: { start: ast.start, end: ast.end },
          isString: false,
        });
    } else {
      ast.children &&
        ast.children.forEach((item: any) => {
          emun(item);
        });
    }
  }
  emun(ast);
  return arr;
}

function findTextInVueTs(code: string, startNum: number) {
  const matches: any[] = [];
  const ast = ts.createSourceFile(
    "",
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TS
  );

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        /** 判断 Ts 中的字符串含有中文 */
        const { text } = node as ts.StringLiteral;
        if (text.match(DOUBLE_BYTE_REGEX)) {
          const start = node.getStart();
          const end = node.getEnd();
          /** 加一，减一的原因是，去除引号 */

          const range = { start: start + startNum, end: end + startNum };
          matches.push({
            node,
            range,
            text,
            isString: true,
          });
        }
        break;
      }
      case ts.SyntaxKind.TemplateExpression: {
        const { pos, end } = node;
        let templateContent = code.slice(pos, end);
        templateContent = templateContent
          .toString()
          .replace(/\$\{[^\}]+\}/, "");
        if (templateContent.match(DOUBLE_BYTE_REGEX)) {
          const start = node.getStart();
          const end = node.getEnd();
          /** 加一，减一的原因是，去除`号 */
          const range =
            code.indexOf("${") !== -1
              ? { start: start + startNum, end: end + startNum }
              : { start: start + startNum + 1, end: end + startNum - 1 };
          matches.push({
            node,
            range,
            text: code.slice(start + 1, end - 1),
            isString: true,
          });
        }
        break;
      }
    }

    ts.forEachChild(node, visit);
  }
  ts.forEachChild(ast, visit);

  return matches;
}

function findTextInVue(code: string) {
  const vueObejct = compilerVue.compile(code.toString(), {
    outputSourceRange: true,
  });
  let TextaArr = findVueText(vueObejct.ast);
  const sfc = compilerVue.parseComponent(code.toString());
  let vueTemp = findTextInVueTs(
    sfc.script!.content as string,
    sfc.script!.start as number
  );
  return vueTemp.concat(TextaArr);
}

function findTextInTs(code: string, fileName: string) {
  const matches: any[] = [];
  const ast = ts.createSourceFile(
    "",
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX
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
          .replace(/\$\{[^\}]+\}/, "");
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
          .replace(/\$\{[^\}]+\}/, "");
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
  if (fileName.endsWith(".html")) {
    return findTextInHtml(code);
  } else if (fileName.endsWith(".vue")) {
    return findTextInVue(code);
  } else {
    return findTextInTs(code, fileName);
  }
}

export function checkChineseText(
  mode: "terminal" | "json",
  options: {
    filePath: string;
    outputPath?: string;
    filename?: string;
    pure?: boolean;
  }
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
    const code = readFile(file) || "";
    const matches = findChineseText(code, path.basename(file));

    allChineseText[file] = matches;
  });

  if (mode === "terminal") {
    logChineseText(allChineseText);
    return;
  }

  if (mode === "json") {
    exportChineseText(allChineseText, outputPath, filename, pure);
  }
}

function logChineseText(allChineseText: {
  [file: string]: Array<{
    node?: ts.Node;
    text: string;
    isString: boolean;
    range?: { start: number; end: number };
  }>;
}) {
  let count = 0;

  Object.keys(allChineseText).forEach((key) => {
    allChineseText[key].forEach((item) => {
      const { node, text } = item;
      let line: number = 0;
      let character: number = 0;

      if (node) {
        const nodeInfo = node
          .getSourceFile()
          .getLineAndCharacterOfPosition(node.getStart());
        line = nodeInfo.line;
        character = nodeInfo.character;
      }

      log.primary(
        log.chalk.red(`中文文案：[${text}]`),
        log.chalk.blue(`${key}:${line + 1}:${character}`)
      );

      count += 1;
    });
  });
  log.primary();
  log.primary(log.chalk.yellow(`匹配到中文文案共[${count}]处`));
}

function exportChineseText(
  allChineseText: {
    [file: string]: Array<{
      node?: ts.Node;
      text: string;
      isString: boolean;
      range?: { start: number; end: number };
    }>;
  },
  exportDir?: string,
  filename?: string,
  pure?: boolean
) {
  const dir = exportDir || "./export-lang";
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
        temp[generateUuidKey()] = item.text;
      });
    } else {
      temp[key] = [];

      allChineseText[key].forEach((item) => {
        count += 1;
        const { node, text } = item;
        let line: number = 0;
        let character: number = 0;

        if (node) {
          const nodeInfo = node
            .getSourceFile()
            .getLineAndCharacterOfPosition(node.getStart());
          line = nodeInfo.line;
          character = nodeInfo.character;
        }

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
