import fs from "fs";
import path from "path";
import { FTINTL_CONFIG_FILENAME, DEFAULT_CLI_CONFIG_FILE } from "./constants";
import { spining, log, prettierFile } from "./view";

function createCLIConfigFile(filePath: string, text: string) {
  fs.writeFileSync(filePath, text);
}

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

export function initCLI() {
  const CLIConfig = getCLIConfig();

  if (!CLIConfig) {
    spining("项目初始化", () => {
      const config = JSON.stringify(DEFAULT_CLI_CONFIG_FILE, null, 2);

      createCLIConfigFile(
        path.resolve(process.cwd(), `${FTINTL_CONFIG_FILENAME}.js`),
        prettierFile(`module.exports = ${config}`, {
          parser: "babel",
          trailingComma: "all",
          singleQuote: true,
        })
      );
    });

    return;
  }

  log.error("初始化失败，ftintl相关吧配置已存在");
}

export function initProject() {
  initCLI();
}
