import fs from "fs";
import path from "path";

type IPattern =
  | ((file: string, stats: fs.Stats) => boolean)
  | RegExp
  | undefined
  | null;

function fullPath(dir: string, files: string[]) {
  return files.map((file) => path.join(dir, file));
}

export function patternToFunction(
  pattern: IPattern,
  defaultPattern: () => boolean = () => true
) {
  if (typeof pattern === "function") {
    return pattern;
  }

  if (Object.prototype.toString.apply(pattern) === "[object RegExp]") {
    return (file: string) => ((pattern as unknown) as RegExp).test(file);
  }

  return defaultPattern;
}

/**
 * 遍历目录下所有文件和目录
 */
function eachFileAndDirSync(
  dir: string,
  pattern: IPattern,
  cb: (file: string, stats: fs.Stats) => void
) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const check = patternToFunction(pattern);
  const stats = fs.statSync(dir);

  if (stats.isFile()) {
    if (check(dir, stats)) {
      cb(dir, stats);
    }
    return;
  }

  if (stats.isDirectory()) {
    if (check(dir, stats)) {
      cb(dir, stats);

      const files = fullPath(dir, fs.readdirSync(dir));
      files.forEach((file) => {
        eachFileAndDirSync(file, pattern, cb);
      });
    }
  }
}

export function eachFileSync(
  dir: string,
  pattern: IPattern,
  cb: (file: string, stats: fs.Stats) => void
) {
  eachFileAndDirSync(dir, pattern, (file, stats) => {
    if (stats.isFile()) {
      cb(file, stats);
    }
  });
}

export function readFileSync(dir: string, pattern?: IPattern) {
  const list: string[] = [];

  eachFileSync(dir, pattern, (file) => {
    list.push(file);
  });

  return list;
}
