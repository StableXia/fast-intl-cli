import fs from 'fs';
import path from 'path';
import { FTINTL_CONFIG_FILENAME, ROOT_DIR } from './constants';
import { IFastIntlConfig } from './types';
import assert from './assert';
import { getFileToJson } from './utils';

export function getFastIntlConfig() {
  let configPath = path.resolve(ROOT_DIR, `${FTINTL_CONFIG_FILENAME}.js`);

  // 先找js
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve(ROOT_DIR, `${FTINTL_CONFIG_FILENAME}.ts`);
    //再找ts
    if (!fs.existsSync(configPath)) {
      return null;
    }
  }

  return configPath;
}

export function createFastIntlConfigFile(filePath: string, text: string) {
  fs.writeFileSync(filePath, text);
}

export function getValFromConfiguration(): IFastIntlConfig;
export function getValFromConfiguration(
  key: string,
): IFastIntlConfig[keyof IFastIntlConfig];
export function getValFromConfiguration(
  key?: string,
): IFastIntlConfig | IFastIntlConfig[keyof IFastIntlConfig] {
  const configPath = getFastIntlConfig() as string;

  assert(!!configPath, 'ftintl 配置文件不存在');

  const config = getFileToJson(configPath);

  if (typeof key === 'string') {
    return config[key];
  }

  return config;
}
