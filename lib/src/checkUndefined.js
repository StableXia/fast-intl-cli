"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUndefinedMessages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const view_1 = require("./view");
const ast_1 = require("./ast");
const readDir_1 = require("./readDir");
const config_1 = require("./config");
function findI18NExpression(filePath) {
    const code = utils_1.readFile(filePath) || '';
    const expressions = ast_1.findI18NExpressionInFile(code);
    return expressions;
}
function checkI18NExpressionInMessages(messages, node) {
    return !Object.keys(messages).every((key) => !new RegExp(`I18N.get\\(['"]${key}['"][\\),]`).test(node.getText()));
}
function findUndefI18NExpression(I18NExpression, messages) {
    const undefI18NExpression = {};
    Object.keys(I18NExpression).forEach((key) => {
        const temp = [];
        I18NExpression[key].forEach((node) => {
            if (!checkI18NExpressionInMessages(messages, node)) {
                temp.push(node);
            }
        });
        if (temp.length > 0) {
            undefI18NExpression[key] = temp;
        }
    });
    return undefI18NExpression;
}
function logUndefI18NExpression(undefI18NExpression) {
    let total = Object.values(undefI18NExpression).reduce((prev, next) => prev + next.count, 0);
    if (total === 0) {
        view_1.log.primary(view_1.log.chalk.green('未找到未定义但使用的 I18N 声明'));
        return;
    }
    Object.keys(undefI18NExpression).forEach((key) => {
        const item = undefI18NExpression[key];
        if (item.count > 0) {
            view_1.log.primary();
            view_1.log.primary(view_1.log.chalk.bgRed.white(`在【${key}】中找到【${item.count}】处未定义但使用的 I18N 声明如下：`));
            view_1.log.primary();
            Object.keys(item.undefI18NExpression).forEach((key, i) => {
                item.undefI18NExpression[key].forEach((node) => {
                    const { line, character, } = node
                        .getSourceFile()
                        .getLineAndCharacterOfPosition(node.getStart());
                    view_1.log.primary(view_1.log.chalk.red(`未定义：[${node.getText()}]`), view_1.log.chalk.blue(`${key}:${line + 1}:${character}`));
                });
            });
        }
    });
}
/**
 * 校验文件中使用了国际化语法，但是未在语言文件中定义的文案
 */
function checkUndefinedMessages(filePath, lang) {
    if (!fs_1.default.existsSync(filePath)) {
        view_1.log.primary(view_1.log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
        return;
    }
    const config = config_1.getValFromConfiguration();
    const allI18NExpression = {};
    const allUndefI18NExpression = {};
    const langs = lang ? [lang] : config.langs;
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
    files.forEach((file) => {
        const I18NExpression = findI18NExpression(file);
        if (I18NExpression.length > 0) {
            allI18NExpression[file] = I18NExpression;
        }
    });
    langs.forEach((lang) => {
        const messages = utils_1.getLangMessages(lang);
        const undefI18NExpression = findUndefI18NExpression(allI18NExpression, messages);
        allUndefI18NExpression[lang] = {
            undefI18NExpression,
            count: Object.values(undefI18NExpression).reduce((prev, next) => prev + next.length, 0),
        };
    });
    logUndefI18NExpression(allUndefI18NExpression);
}
exports.checkUndefinedMessages = checkUndefinedMessages;
