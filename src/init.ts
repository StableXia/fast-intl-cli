import path from "path";
import { FTINTL_CONFIG_FILENAME, DEFAULT_CLI_CONFIG_FILE } from "./constants";
import { spining, log, prettierFile } from "./view";
import { getCLIConfig, createCLIConfigFile } from "./config";

export function initCLI() {
  const CLIConfig = getCLIConfig();

  if (!CLIConfig) {
    spining("项目初始化", () => {
      const config = JSON.stringify(DEFAULT_CLI_CONFIG_FILE, null, 2);

      createCLIConfigFile(
        path.resolve(process.cwd(), `${FTINTL_CONFIG_FILENAME}.js`),
        prettierFile(`export default ${config}`, {
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

export function initLangs() {}
