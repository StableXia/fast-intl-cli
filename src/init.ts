import path from 'path';
import { FTINTL_CONFIG_FILENAME, DEFAULT_CLI_CONFIG_FILE } from './constants';
import { prettierFile } from './view';
import { createCLIConfigFile } from './config';

interface IInitOptions {
  fileType: 'ts' | 'js';
}

export function initCLI(options: IInitOptions) {
  const { fileType } = options;
  const config = DEFAULT_CLI_CONFIG_FILE[fileType];

  createCLIConfigFile(
    path.resolve(process.cwd(), `${FTINTL_CONFIG_FILENAME}.${fileType}`),
    prettierFile(`export default ${config}`, {
      parser: 'babel',
      trailingComma: 'all',
      singleQuote: true,
    }),
  );
}

export function initLangs() {}
