// CLI 配置文件名
export const FTINTL_CONFIG_FILENAME = '.ftintlrc';
// 中文文件名
export const DEFAULT_LANG = 'zh-hans';
// 资源文件目录
export const DEFAULT_LANG_DIR = './.fastIntl/';

export const ROOT_DIR = process.cwd();

// CLI 配置文件
export const DEFAULT_FAST_INTL_CONFIG_FILE = {
  js: `{
    langDir: '${DEFAULT_LANG_DIR}',
    defaultLang: '${DEFAULT_LANG}',
    langs: ['${DEFAULT_LANG}'],
    importI18N: "import I18N from 'src/utils/I18N';",
    ignoreFile: (basename) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
  ts: `{
    langDir: '${DEFAULT_LANG_DIR}',
    defaultLang: '${DEFAULT_LANG}',
    langs: ['${DEFAULT_LANG}'],
    importI18N: "import I18N from 'src/utils/I18N';",
    ignoreFile: (basename: string) => {
      return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
    },
    ignoreDir: (basename: string) => {
      return /\.(node_modules|__tests__)$/.test(basename);
    },
  };`,
};
