"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUnusedMessages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const readDir_1 = require("./readDir");
const utils_1 = require("./utils");
const view_1 = require("./view");
function logUnusedMessages(unUnsedMessages) {
    let total = Object.values(unUnsedMessages).reduce((prev, next) => prev + next.length, 0);
    if (total === 0) {
        view_1.log.primary(view_1.log.chalk.green('未找到未使用的文案'));
        return;
    }
    Object.keys(unUnsedMessages).forEach((key) => {
        const unUsedKeys = unUnsedMessages[key];
        if (unUsedKeys.length > 0) {
            view_1.log.primary();
            view_1.log.primary(view_1.log.chalk.bgRed.white(`在【${key}】中找到【${unUsedKeys.length}】处未使用的文案如下：`));
            view_1.log.primary();
            view_1.log.primary(view_1.log.chalk.blue(`[\n ${unUsedKeys.join(' \n ')}\n]`));
        }
    });
}
function findUnusedMessages(filePath, messages) {
    const unUnsedKeys = [];
    const config = config_1.getValFromConfiguration();
    const files = readDir_1.readFileSync(filePath, (file, stats) => {
        const basename = path_1.default.basename(file);
        if (stats.isFile()) {
            const check = readDir_1.patternToFunction(config.ignoreFile, () => false);
            return !check(basename, stats);
        }
        if (stats.isDirectory()) {
            const check = readDir_1.patternToFunction(config.ignoreDir, () => false);
            return !check(basename, stats);
        }
        return false;
    });
    utils_1.traverse(messages, (text, fullKey) => {
        const hasKey = utils_1.checkI18NExpressionUsed(files, fullKey);
        if (!hasKey) {
            unUnsedKeys.push(`I18N.get("${fullKey}")`);
        }
    });
    return unUnsedKeys;
}
function checkUnusedMessages(filePath, lang) {
    if (!fs_1.default.existsSync(filePath)) {
        view_1.log.primary(view_1.log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
        return;
    }
    const unUnsedMessages = {};
    const config = config_1.getValFromConfiguration();
    const langs = lang ? [lang] : config.langs;
    langs.forEach((lang) => {
        const allMessages = utils_1.getLangMessages(lang);
        const unUnsedKeys = findUnusedMessages(filePath, allMessages);
        unUnsedMessages[lang] = unUnsedKeys;
    });
    logUnusedMessages(unUnsedMessages);
}
exports.checkUnusedMessages = checkUnusedMessages;
