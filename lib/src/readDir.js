"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileSync = exports.eachFileSync = exports.patternToFunction = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function fullPath(dir, files) {
    return files.map((file) => path_1.default.join(dir, file));
}
function patternToFunction(pattern, defaultPattern = () => true) {
    if (typeof pattern === "function") {
        return pattern;
    }
    if (Object.prototype.toString.apply(pattern) === "[object RegExp]") {
        return (file) => pattern.test(file);
    }
    return defaultPattern;
}
exports.patternToFunction = patternToFunction;
/**
 * 遍历目录下所有文件和目录
 */
function eachFileAndDirSync(dir, pattern, cb) {
    if (!fs_1.default.existsSync(dir)) {
        return;
    }
    const check = patternToFunction(pattern);
    const stats = fs_1.default.statSync(dir);
    if (stats.isFile()) {
        if (check(dir, stats)) {
            cb(dir, stats);
        }
        return;
    }
    if (stats.isDirectory()) {
        if (check(dir, stats)) {
            cb(dir, stats);
            const files = fullPath(dir, fs_1.default.readdirSync(dir));
            files.forEach((file) => {
                eachFileAndDirSync(file, pattern, cb);
            });
        }
    }
}
function eachFileSync(dir, pattern, cb) {
    eachFileAndDirSync(dir, pattern, (file, stats) => {
        if (stats.isFile()) {
            cb(file, stats);
        }
    });
}
exports.eachFileSync = eachFileSync;
function readFileSync(dir, pattern) {
    const list = [];
    eachFileSync(dir, pattern, (file) => {
        list.push(file);
    });
    return list;
}
exports.readFileSync = readFileSync;
