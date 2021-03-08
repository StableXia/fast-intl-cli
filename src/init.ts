import fs from "fs";
import path from "path";
import { FAST_INTL_CONFIG_FILE, FAST_INTL_CONFIG } from "./constants";

export function canInitiate() {
  return !fs.existsSync(path.resolve(process.cwd(), FAST_INTL_CONFIG_FILE));
}

function createConfigFile() {
  const config = JSON.stringify(FAST_INTL_CONFIG, null, 2);

  fs.writeFile(
    path.resolve(process.cwd(), FAST_INTL_CONFIG_FILE),
    `module.exports = ${config}`,
    (err: any) => {
      if (err) {
        console.log(err);
      }
    }
  );
}

export function initProject() {
  createConfigFile();
}
