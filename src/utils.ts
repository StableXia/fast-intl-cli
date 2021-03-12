import fs from "fs";
import path from "path";

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
 * 获取文件内容并转成json
 */
export function getFileToJson(filePath: string) {
  let temp: { [key: string]: any } = {};

  try {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

    let obj = fileContent.match(
      /export\s*default\s*({[\s\S]+);?$/
    )?.[1] as string;
    obj = obj.replace(/\s*;\s*$/, "");

    temp = eval("(" + obj + ")");
  } catch (err) {
    console.error(err);
  }

  return temp;
}

/**
 * 深度优先遍历对象中的所有 string 属性，即文案
 */
export function traverse(
  obj: { [key: string]: string },
  cb: (message: string, path: string) => void
) {
  function traverseInner(
    obj: { [key: string]: string },
    cb: (message: string, path: string) => void,
    path: string[]
  ) {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (typeof val === "string") {
        cb(val, [...path, key].join("."));
      } else if (typeof val === "object" && val !== null) {
        traverseInner(val, cb, [...path, key]);
      }
    });
  }

  traverseInner(obj, cb, []);
}

/**
 * 检查文件
 */
function check(filePath: string, text: string, callback: () => void) {
  const data = readFile(filePath);
  const exc = new RegExp(`I18N.get\\(['"]${text}['"][\\),]`);
  if (exc.test(data as string)) {
    callback();
  }
}

/**
 * 读取文件
 * @param fileName
 */
export function readFile(fileName: string) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, "utf-8");
  }
}

/**
 * 递归查找文件
 */
export function recursiveReadFile(fileName: string, text: string) {
  let hasText = false;
  if (!fs.existsSync(fileName)) {
    return false;
  }

  if (isFile(fileName) && !hasText) {
    check(fileName, text, () => {
      hasText = true;
    });
  }

  if (isDirectory(fileName)) {
    const files = fs.readdirSync(fileName).filter((file) => {
      return (
        !file.startsWith(".") &&
        !["node_modules", "build", "dist"].includes(file)
      );
    });

    files.forEach(function (val, key) {
      const temp = path.join(fileName, val);
      if (isDirectory(temp) && !hasText) {
        hasText = recursiveReadFile(temp, text);
      }
      if (isFile(temp) && !hasText) {
        check(temp, text, () => {
          hasText = true;
        });
      }
    });
  }

  return hasText;
}
