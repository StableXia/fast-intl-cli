import fs from "fs";
import path from "path";
import ts from "typescript";
import { isFile, isDirectory, readFile } from "./utils";
import { log } from "./view";

function findI18NExpression(filePath: string) {
  const expressions: ts.Node[] = [];
  const code = readFile(filePath) || "";
  const ast = ts.createSourceFile(
    "",
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        // console.log(node.getText());
        expressions.push(node);
        break;
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(ast, visit);

  return expressions;
}

/**
 * 校验文件中使用了国际化语法，但是未在语言文件中定义的文案
 */
export function checkUndefinedMessages(filePath: string) {
  const I18NExpression: { [key: string]: ts.Node[] } = {};

  function recursiveFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    if (isFile(filePath)) {
      I18NExpression[filePath] = findI18NExpression(filePath);
      return;
    }

    if (isDirectory(filePath)) {
      const files = fs.readdirSync(filePath).filter((file) => {
        return (
          !file.startsWith(".") &&
          !["node_modules", "build", "dist"].includes(file)
        );
      });

      files.forEach(function (file) {
        const temp = path.resolve(filePath, file);

        if (isFile(temp)) {
          I18NExpression[temp] = findI18NExpression(temp);
          return;
        }

        if (isDirectory(temp)) {
          recursiveFile(temp);
        }
      });
    }
  }

  recursiveFile(filePath);

  log.primary(log.chalk.red("找到未定义但使用的 I18N 声明如下："));
  let undefI18N = 0;
  Object.keys(I18NExpression).forEach((key, i) => {
    I18NExpression[key].forEach((node) => {
      const {
        line,
        character,
      } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());

      log.primary(
        log.chalk.red(`未定义：[${node.getText()}]`),
        log.chalk.blue(`${key}:${line + 1}:${character}`)
      );
    });
  });
}
