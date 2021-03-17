"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CLI_CONFIG_FILE = exports.DEFAULT_LANG_DIR = exports.DEFAULT_ZHHANS = exports.FTINTL_CONFIG_FILENAME = void 0;
// CLI 配置文件名
exports.FTINTL_CONFIG_FILENAME = ".ftintlrc";
// 中文文件名
exports.DEFAULT_ZHHANS = "zh-hans";
// 资源文件目录
exports.DEFAULT_LANG_DIR = "./.fastIntl/";
// CLI 配置文件
exports.DEFAULT_CLI_CONFIG_FILE = {
    // 多语言目录
    langDir: exports.DEFAULT_LANG_DIR,
    // 中文路径
    ZHHans: `${exports.DEFAULT_LANG_DIR}${exports.DEFAULT_ZHHANS}.json`,
    // 可选语言
    langs: [exports.DEFAULT_ZHHANS],
    // 忽略的文件
    ignoreFile: () => false,
    // 忽略的文件夹
    ignoreDir: () => false,
};
