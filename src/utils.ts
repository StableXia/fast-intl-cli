import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import randomstring from 'randomstring';
import { getValFromConfiguration } from './config';
import babelRegister from './babelRegister';

/**
 * 判断是文件夹
 * @param filePath
 */
export function isDirectory(filePath: string) {
  if (fs.existsSync(filePath)) {
    return fs.statSync(filePath).isDirectory();
  }
}

/**
 * 判断是否是文件
 * @param filePath
 */
export function isFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    return fs.statSync(filePath).isFile();
  }
}

/**
 * 深度优先遍历对象中的所有 string 属性，即文案
 */
export function traverse(
  obj: { [key: string]: any },
  cb: (message: string, path: string) => void,
) {
  function traverseInner(
    obj: { [key: string]: string },
    cb: (message: string, path: string) => void,
    path: string[],
  ) {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (typeof val === 'string') {
        cb(val, [...path, key].join('.'));
      } else if (typeof val === 'object' && val !== null) {
        traverseInner(val, cb, [...path, key]);
      }
    });
  }

  traverseInner(obj, cb, []);
}

function checkI18NExpression(filePath: string, text: string) {
  const code = readFile(filePath);
  const exc = new RegExp(`I18N.get\\(['"]${text}['"][\\),]`);

  return exc.test(code as string);
}

export function readFile(fileName: string) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf-8');
  }
}

export function checkI18NExpressionUsed(files: string[], text: string) {
  return !files.every((file) => {
    if (checkI18NExpression(file, text)) {
      return false;
    }

    return true;
  });
}

export function getLangMessages(
  lang: string,
  filter = (message: string, key: string) => true,
) {
  const config = getValFromConfiguration();
  const srcLang = path.resolve(config.langDir, lang);

  let files = [];
  if (config.mode === 'single') {
    files = [`${srcLang}.${config.langExt}`];
  } else {
    files = fs
      .readdirSync(srcLang)
      .filter(
        (file) =>
          file.endsWith(`.${config.langExt}`) &&
          file !== `index.${config.langExt}`,
      )
      .map((file) => path.resolve(srcLang, file));
  }

  babelRegister.setOnlyMap({
    key: 'langPaths',
    value: files,
  });

  const allMessages = files.map((file) => {
    const messages = compatESModuleRequire(require(file));
    const fileNameWithoutExt = path.basename(file).split('.')[0];
    const flattenedMessages: { [key: string]: string } = {};

    traverse(messages, (message, path) => {
      const key =
        config.mode === 'single' ? path : `${fileNameWithoutExt}.${path}`;
      if (filter(message, key)) {
        flattenedMessages[key] = message;
      }
    });

    return flattenedMessages;
  });

  return Object.assign({}, ...allMessages);
}

/**
 * 移除注释
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true });
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  return printer.printFile(sourceFile);
}

function prefixZero(num: number) {
  return num >= 10 ? num : `0${num}`;
}

export function getDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${year}${prefixZero(month)}${prefixZero(day)}${prefixZero(
    hour,
  )}${prefixZero(minute)}${prefixZero(second)}`;
}

/**
 * 获取文件内容并转成json
 */
export function getFileToJson<T = any>(filePath: string): T {
  let temp: any = {};

  try {
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });

    let obj = fileContent.match(
      /export\s*default\s*({[\s\S]+);?$/,
    )?.[1] as string;
    obj = obj.replace(/\s*;\s*$/, '');

    temp = eval('(' + obj + ')');
  } catch (err) {
    console.error(err);
  }

  return temp;
}

export function winPath(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

export function compatESModuleRequire<
  T extends { __esModule: boolean; default: any }
>(m: T): T extends { __esModule: true; default: infer U } ? U : T {
  return m.__esModule ? m.default : m;
}

export function generateUuidKey() {
  return randomstring.generate({
    length: 8,
    charset: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
  });
}
