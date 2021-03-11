import fs from "fs";
import path from "path";
import { FTINTL_CONFIG_FILENAME } from "./constants";
import { getFileToJson } from "./utils";
import { ICLIConfig } from "./types";

export function getCLIConfig() {
  let CLIConfig = path.resolve(process.cwd(), `${FTINTL_CONFIG_FILENAME}.js`);

  // 先找js
  if (!fs.existsSync(CLIConfig)) {
    CLIConfig = path.resolve(process.cwd(), `${FTINTL_CONFIG_FILENAME}.ts`);
    //再找ts
    if (!fs.existsSync(CLIConfig)) {
      return null;
    }
  }

  return CLIConfig;
}

export function getCLIConfigJson(): ICLIConfig {
  const configPath = getCLIConfig();

  if (typeof configPath !== "string") {
    return {} as ICLIConfig;
  }

  const config = getFileToJson(configPath);

  return config as ICLIConfig;
}

export function createCLIConfigFile(filePath: string, text: string) {
  fs.writeFileSync(filePath, text);
}
