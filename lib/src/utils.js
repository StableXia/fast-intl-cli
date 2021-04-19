"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = exports.removeFileComment = exports.getLangMessages = exports.getLangPath = exports.checkI18NExpressionUsed = exports.readFile = exports.traverse = exports.getFileToJson = exports.isFile = exports.isDirectory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const config_1 = require("./config");
/**
 * 判断是文件夹
 * @param filePath
 */
function isDirectory(filePath) {
    if (fs_1.default.existsSync(filePath)) {
        return fs_1.default.statSync(filePath).isDirectory();
    }
}
exports.isDirectory = isDirectory;
/**
 * 判断是否是文件
 * @param filePath
 */
function isFile(filePath) {
    if (fs_1.default.existsSync(filePath)) {
        return fs_1.default.statSync(filePath).isFile();
    }
}
exports.isFile = isFile;
/**
 * 获取文件内容并转成json
 */
function getFileToJson(filePath) {
    var _a;
    let temp = {};
    try {
        const fileContent = fs_1.default.readFileSync(filePath, { encoding: "utf8" });
        let obj = (_a = fileContent.match(/export\s*default\s*({[\s\S]+);?$/)) === null || _a === void 0 ? void 0 : _a[1];
        obj = obj.replace(/\s*;\s*$/, "");
        temp = eval("(" + obj + ")");
    }
    catch (err) {
        console.error(err);
    }
    return temp;
}
exports.getFileToJson = getFileToJson;
/**
 * 深度优先遍历对象中的所有 string 属性，即文案
 */
function traverse(obj, cb) {
    function traverseInner(obj, cb, path) {
        Object.keys(obj).forEach((key) => {
            const val = obj[key];
            if (typeof val === "string") {
                cb(val, [...path, key].join("."));
            }
            else if (typeof val === "object" && val !== null) {
                traverseInner(val, cb, [...path, key]);
            }
        });
    }
    traverseInner(obj, cb, []);
}
exports.traverse = traverse;
function checkI18NExpression(filePath, text) {
    const code = readFile(filePath);
    const exc = new RegExp(`I18N.get\\(['"]${text}['"][\\),]`);
    return exc.test(code);
}
function readFile(fileName) {
    if (fs_1.default.existsSync(fileName)) {
        return fs_1.default.readFileSync(fileName, "utf-8");
    }
}
exports.readFile = readFile;
function checkI18NExpressionUsed(files, text) {
    return !files.every((file) => {
        if (checkI18NExpression(file, text)) {
            return false;
        }
        return true;
    });
}
exports.checkI18NExpressionUsed = checkI18NExpressionUsed;
function getLangPath(lang) {
    const config = config_1.getCLIConfigJson();
    return path_1.default.resolve(config.langDir, `${lang}.json`);
}
exports.getLangPath = getLangPath;
function getLangMessages(lang, filter = (message, key) => true) {
    const langPath = getLangPath(lang);
    const messages = require(langPath);
    const flattenedMessages = {};
    traverse(messages, (message, path) => {
        const key = path;
        if (filter(message, key)) {
            flattenedMessages[key] = message;
        }
    });
    return flattenedMessages;
}
exports.getLangMessages = getLangMessages;
/**
 * 移除注释
 */
function removeFileComment(code, fileName) {
    const printer = typescript_1.default.createPrinter({ removeComments: true });
    const sourceFile = typescript_1.default.createSourceFile("", code, typescript_1.default.ScriptTarget.ES2015, true, fileName.endsWith(".tsx") ? typescript_1.default.ScriptKind.TSX : typescript_1.default.ScriptKind.TS);
    return printer.printFile(sourceFile);
}
exports.removeFileComment = removeFileComment;
function prefixZero(num) {
    return num >= 10 ? num : `0${num}`;
}
function getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${year}${prefixZero(month)}${prefixZero(day)}${prefixZero(hour)}${prefixZero(minute)}${prefixZero(second)}`;
}
exports.getDate = getDate;
