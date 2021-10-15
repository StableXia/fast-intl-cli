import path from 'path';
import {
  FTINTL_CONFIG_FILENAME,
  DEFAULT_FAST_INTL_CONFIG_FILE,
  ROOT_DIR,
} from './constants';
import { prettierFile } from './view';
import { createFastIntlConfigFile } from './config';

interface IInitOptions {
  fileType: 'ts' | 'js';
}

export function initFastIntl(options: IInitOptions) {
  const { fileType } = options;
  const config = DEFAULT_FAST_INTL_CONFIG_FILE[fileType];

  createFastIntlConfigFile(
    path.resolve(ROOT_DIR, `${FTINTL_CONFIG_FILENAME}.${fileType}`),
    prettierFile(`export default ${config}`, {
      parser: 'babel',
      trailingComma: 'all',
      singleQuote: true,
    }),
  );
}

// TODO: 待实现
export function initLangs() {}
