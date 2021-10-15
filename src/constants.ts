// CLI 配置文件名
export const FTINTL_CONFIG_FILENAME = '.ftintlrc';
// 中文文件名
export const DEFAULT_LANG = 'zh-hans';
// 资源文件目录
export const DEFAULT_LANG_DIR = './.fastIntl/';

// CLI 配置文件
export const DEFAULT_CLI_CONFIG_FILE = {
  js: `{
    langDir: '${DEFAULT_LANG_DIR}',
    defaultLang: '${DEFAULT_LANG_DIR}${DEFAULT_LANG}.json',
    langs: ['${DEFAULT_LANG}'],
    ignoreFile: (basename) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
  ts: `{
    langDir: '${DEFAULT_LANG_DIR}',
    defaultLang: '${DEFAULT_LANG_DIR}${DEFAULT_LANG}.json',
    langs: ['${DEFAULT_LANG}'],
    ignoreFile: (basename: string) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename: string) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
};
