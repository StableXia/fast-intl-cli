"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CLI_CONFIG_FILE = exports.DEFAULT_LANG_DIR = exports.DEFAULT_LANG = exports.FTINTL_CONFIG_FILENAME = void 0;
// CLI 配置文件名
exports.FTINTL_CONFIG_FILENAME = '.ftintlrc';
// 中文文件名
exports.DEFAULT_LANG = 'zh-hans';
// 资源文件目录
exports.DEFAULT_LANG_DIR = './.fastIntl/';
// CLI 配置文件
exports.DEFAULT_CLI_CONFIG_FILE = {
    js: `{
    langDir: '${exports.DEFAULT_LANG_DIR}',
    defaultLang: '${exports.DEFAULT_LANG_DIR}${exports.DEFAULT_LANG}.json',
    langs: ['${exports.DEFAULT_LANG}'],
    ignoreFile: (basename) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
    ts: `{
    langDir: '${exports.DEFAULT_LANG_DIR}',
    defaultLang: '${exports.DEFAULT_LANG_DIR}${exports.DEFAULT_LANG}.json',
    langs: ['${exports.DEFAULT_LANG}'],
    ignoreFile: (basename: string) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename: string) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
};
