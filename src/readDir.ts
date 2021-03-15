import fs from "fs";
import path from "path";
import { isFile, isDirectory } from "./utils";

export function readdirSync(filePath: string) {
  const fileArr: string[] = [];

  function loopDir(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }

    if (isFile(dir)) {
      fileArr.push(dir);
    } else if (isDirectory(dir)) {
      const files = fs.readdirSync(dir);

      files.forEach(function (file) {
        const temp = path.resolve(dir, file);

        if (isFile(temp)) {
          fileArr.push(temp);
        } else if (isDirectory(temp)) {
          loopDir(temp);
        }
      });
    }
  }

  loopDir(filePath);

  return fileArr;
}
