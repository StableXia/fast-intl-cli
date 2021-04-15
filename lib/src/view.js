"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettierFile = exports.log = exports.spining = void 0;
const ora_1 = __importDefault(require("ora"));
const prettier_1 = __importDefault(require("prettier"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * 进度条加载
 */
function spining(msg, callback) {
    const spinner = ora_1.default(`${msg}中...`);
    spinner.start();
    exports.log.primary();
    if (callback) {
        callback();
    }
    exports.log.primary();
    spinner.succeed(`${msg}成功`);
}
exports.spining = spining;
class Log {
    error(msg) {
        console.log(chalk_1.default.red(msg));
    }
    warn(msg) {
        console.log(chalk_1.default.yellow(msg));
    }
    primary(...msg) {
        console.log(...msg);
    }
    get chalk() {
        return chalk_1.default;
    }
}
exports.log = new Log();
/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
function prettierFile(fileContent, options) {
    try {
        return prettier_1.default.format(fileContent, options);
    }
    catch (e) {
        exports.log.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
        return fileContent;
    }
}
exports.prettierFile = prettierFile;
