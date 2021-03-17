"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLangMessages = exports.getLangPath = exports.recursiveCheckI18NExpression = exports.readFile = exports.traverse = exports.getFileToJson = exports.isFile = exports.isDirectory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
function checkI18NExpression(filePath, text, callback) {
    const code = readFile(filePath);
    const exc = new RegExp(`I18N.get\\(['"]${text}['"][\\),]`);
    if (exc.test(code)) {
        callback();
    }
}
function readFile(fileName) {
    if (fs_1.default.existsSync(fileName)) {
        return fs_1.default.readFileSync(fileName, "utf-8");
    }
}
exports.readFile = readFile;
function recursiveCheckI18NExpression(fileName, text) {
    let hasText = false;
    if (!fs_1.default.existsSync(fileName)) {
        return false;
    }
    if (isFile(fileName) && !hasText) {
        checkI18NExpression(fileName, text, () => {
            hasText = true;
        });
    }
    if (isDirectory(fileName)) {
        const files = fs_1.default.readdirSync(fileName).filter((file) => {
            return (!file.startsWith(".") &&
                !["node_modules", "build", "dist"].includes(file));
        });
        files.forEach(function (val, key) {
            const temp = path_1.default.join(fileName, val);
            if (isDirectory(temp) && !hasText) {
                hasText = recursiveCheckI18NExpression(temp, text);
            }
            if (isFile(temp) && !hasText) {
                checkI18NExpression(temp, text, () => {
                    hasText = true;
                });
            }
        });
    }
    return hasText;
}
exports.recursiveCheckI18NExpression = recursiveCheckI18NExpression;
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
