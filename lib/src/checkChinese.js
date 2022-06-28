"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChineseText = exports.findChineseText = exports.findTextInTs = void 0;
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const readDir_1 = require("./readDir");
const regexp_1 = require("./regexp");
const utils_2 = require("./utils");
const view_1 = require("./view");
const config_1 = require("./config");
function findTextInTs(code, fileName) {
    const matches = [];
    const ast = typescript_1.default.createSourceFile('', code, typescript_1.default.ScriptTarget.ES2015, true, typescript_1.default.ScriptKind.TSX);
    function visit(node) {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.StringLiteral: {
                const { text } = node;
                if (text.match(regexp_1.CHINESE_CHAR_REGEXP)) {
                    matches.push({
                        node,
                        text,
                        isString: true,
                    });
                }
                break;
            }
            case typescript_1.default.SyntaxKind.JsxElement: {
                const { children } = node;
                children.forEach((child) => {
                    if (child.kind === typescript_1.default.SyntaxKind.JsxText) {
                        const text = child.getText();
                        /** 修复注释含有中文的情况，Angular 文件错误的 Ast 情况 */
                        const noCommentText = utils_2.removeFileComment(text, fileName);
                        if (noCommentText.match(regexp_1.CHINESE_CHAR_REGEXP)) {
                            matches.push({
                                node,
                                text: text.trim(),
                                isString: false,
                            });
                        }
                    }
                });
                break;
            }
            case typescript_1.default.SyntaxKind.TemplateExpression: {
                const { pos, end } = node;
                let templateContent = code.slice(pos, end);
                templateContent = templateContent
                    .toString()
                    .replace(/\$\{[^\}]+\}/, '');
                if (templateContent.match(regexp_1.CHINESE_CHAR_REGEXP)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    matches.push({
                        node,
                        text: code.slice(start + 1, end - 1),
                        isString: true,
                    });
                }
                break;
            }
            case typescript_1.default.SyntaxKind.NoSubstitutionTemplateLiteral: {
                const { pos, end } = node;
                let templateContent = code.slice(pos, end);
                templateContent = templateContent
                    .toString()
                    .replace(/\$\{[^\}]+\}/, '');
                if (templateContent.match(regexp_1.CHINESE_CHAR_REGEXP)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    matches.push({
                        node,
                        text: code.slice(start + 1, end - 1),
                        isString: true,
                    });
                }
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    typescript_1.default.forEachChild(ast, visit);
    return matches;
}
exports.findTextInTs = findTextInTs;
function findChineseText(code, fileName) {
    return findTextInTs(code, fileName);
}
exports.findChineseText = findChineseText;
function checkChineseText(mode, options) {
    const { filePath, outputPath, filename, pure } = options;
    if (!fs_1.default.existsSync(filePath)) {
        view_1.log.primary(view_1.log.chalk.red(`指定文件或目录不存在：【${filePath}】`));
        return;
    }
    const allChineseText = {};
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
    files.forEach((file) => {
        const code = utils_1.readFile(file) || '';
        const matches = findChineseText(code, path_1.default.basename(file));
        allChineseText[file] = matches;
    });
    if (mode === 'terminal') {
        logChineseText(allChineseText);
        return;
    }
    if (mode === 'json') {
        exportChineseText(allChineseText, outputPath, filename, pure);
    }
}
exports.checkChineseText = checkChineseText;
function logChineseText(allChineseText) {
    let count = 0;
    Object.keys(allChineseText).forEach((key) => {
        allChineseText[key].forEach((item) => {
            const { node, text } = item;
            const { line, character, } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
            view_1.log.primary(view_1.log.chalk.red(`中文文案：[${text}]`), view_1.log.chalk.blue(`${key}:${line + 1}:${character}`));
            count += 1;
        });
    });
    view_1.log.primary();
    view_1.log.primary(view_1.log.chalk.yellow(`匹配到中文文案共[${count}]处`));
}
function exportChineseText(allChineseText, exportDir, filename, pure) {
    const dir = exportDir || './export-lang';
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    const exportFilename = filename ? `${filename}.json` : `zh-${utils_2.getDate()}.json`;
    const exportPath = path_1.default.resolve(dir, exportFilename);
    if (fs_1.default.existsSync(exportPath)) {
        view_1.log.primary();
        view_1.log.primary(view_1.log.chalk.red(`该文件已存在：`), view_1.log.chalk.blue(exportPath));
        view_1.log.primary();
        process.exit(0);
    }
    let count = 0;
    const temp = {};
    Object.keys(allChineseText).forEach((key) => {
        if (allChineseText[key].length === 0) {
            return;
        }
        if (pure) {
            allChineseText[key].forEach((item) => {
                count += 1;
                temp[utils_1.generateUuidKey()] = item.text;
            });
        }
        else {
            temp[key] = [];
            allChineseText[key].forEach((item) => {
                count += 1;
                const { node, text } = item;
                const { line, character, } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
                temp[key].push({
                    text,
                    key: utils_1.generateUuidKey(),
                    position: `${line + 1}:${character}`,
                });
            });
        }
    });
    fs_1.default.writeFileSync(exportPath, JSON.stringify(temp, null, 2));
    view_1.log.primary();
    view_1.log.primary(view_1.log.chalk.yellow(`匹配到中文文案共[${count}]处`));
    view_1.log.primary();
    view_1.log.primary(view_1.log.chalk.green(`文案已导入：`), view_1.log.chalk.blue(exportPath));
}
