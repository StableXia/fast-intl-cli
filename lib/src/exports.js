"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUnusedMessages = exports.exportUntranslatedMessages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const d3_dsv_1 = require("d3-dsv");
const config_1 = require("./config");
const readDir_1 = require("./readDir");
const utils_1 = require("./utils");
const regexp_1 = require("./regexp");
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
function findUntranslatedMessages(lang) {
    const allMessages = utils_1.getLangMessages(lang);
    const existingTranslations = utils_1.getLangMessages(lang, (message, key) => !regexp_1.CHINESE_CHAR_REGEXP.test(allMessages[key]) ||
        allMessages[key] !== message);
    const messagesToTranslate = Object.keys(allMessages)
        .filter((key) => !existingTranslations.hasOwnProperty(key))
        .map((key) => {
        let message = allMessages[key];
        message = JSON.stringify(message).slice(1, -1);
        return [key, message];
    });
    return messagesToTranslate;
}
/**
 * 导出未翻译文案
 */
function exportUntranslatedMessages(exportDir, lang) {
    const langs = lang
        ? [lang]
        : config_1.getValFromConfiguration('langs');
    langs.forEach((lang) => {
        const messagesToTranslate = findUntranslatedMessages(lang);
        if (messagesToTranslate.length === 0) {
            view_1.log.primary(view_1.log.chalk.green(`在[${lang}]中未找到未翻译的文案`));
            return;
        }
        view_1.log.primary();
        view_1.log.primary(view_1.log.chalk.bgRed.white(`在【${lang}】中找到【${messagesToTranslate.length}】处未翻译的文案：`));
        view_1.log.primary();
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const dir = path_1.default.resolve(exportDir);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        fs_1.default.writeFileSync(path_1.default.join(dir, lang), content);
        view_1.log.primary(view_1.log.chalk.green(`在[${lang}]中的未翻译文案导出成功`));
    });
}
exports.exportUntranslatedMessages = exportUntranslatedMessages;
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
/**
 * 导出未使用的文案
 */
function exportUnusedMessages(filePath, lang) {
    if (!fs_1.default.existsSync(filePath)) {
        view_1.log.primary(view_1.log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
        return;
    }
    const unUnsedMessages = {};
    const config = config_1.getValFromConfiguration();
    const langs = lang ? [lang] : config.langs;
    langs.forEach((lang) => {
        const langPath = utils_1.getLangPath(lang);
        const messages = require(langPath);
        const unUnsedKeys = findUnusedMessages(filePath, messages);
        unUnsedMessages[lang] = unUnsedKeys;
    });
    logUnusedMessages(unUnsedMessages);
}
exports.exportUnusedMessages = exportUnusedMessages;
