// CLI 配置文件名
export const FTINTL_CONFIG_FILENAME = '.ftintlrc';
// 中文文件名
export const DEFAULT_ZHHANS = 'zh-hans';
// 资源文件目录
export const DEFAULT_LANG_DIR = './.fastIntl/';

// CLI 配置文件
export const DEFAULT_CLI_CONFIG_FILE = {
  // 多语言目录
  langDir: DEFAULT_LANG_DIR,
  // 中文路径
  ZHHans: `${DEFAULT_LANG_DIR}${DEFAULT_ZHHANS}.json`,
  // 可选语言
  langs: [DEFAULT_ZHHANS],
  // 忽略的文件
  // @ts-ignore
  ignoreFile: (basename) => {
    return /\.(json|md|png|jpg|jpeg|svg)$/.test(basename);
  },
  // 忽略的文件夹
  // @ts-ignore
  ignoreDir: (basename) => {
    return /\.(node_modules|__tests__)$/.test(basename);
  },
};
