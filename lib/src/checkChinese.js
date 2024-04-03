"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkChineseText = exports.findChineseText = void 0;
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compiler = __importStar(require("@angular/compiler"));
const compilerVue = __importStar(require("vue-template-compiler"));
const utils_1 = require("./utils");
const readDir_1 = require("./readDir");
const regexp_1 = require("./regexp");
const utils_2 = require("./utils");
const view_1 = require("./view");
const config_1 = require("./config");
const DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
function findTextInHtml(code) {
    const matches = [];
    const ast = compiler.parseTemplate(code, "ast.html", {
        preserveWhitespaces: false,
    });
    function visit(node) {
        const value = node.value;
        if (value && typeof value === "string" && value.match(DOUBLE_BYTE_REGEX)) {
            const valueSpan = node.valueSpan || node.sourceSpan;
            let { start: { offset: startOffset }, end: { offset: endOffset }, } = valueSpan;
            const nodeValue = code.slice(startOffset, endOffset);
            let isString = false;
            /** 处理带引号的情况 */
            if (nodeValue.charAt(0) === '"' || nodeValue.charAt(0) === "'") {
                isString = true;
            }
            const range = { start: startOffset, end: endOffset };
            matches.push({
                range,
                text: value,
                isString,
            });
        }
        else if (value &&
            typeof value === "object" &&
            value.source &&
            value.source.match(DOUBLE_BYTE_REGEX)) {
            /**
             * <span>{{expression}}中文</span> 这种情况的兼容
             */
            const chineseMatches = value.source.match(DOUBLE_BYTE_REGEX);
            chineseMatches.map((match) => {
                const valueSpan = node.valueSpan || node.sourceSpan;
                let { start: { offset: startOffset }, end: { offset: endOffset }, } = valueSpan;
                const nodeValue = code.slice(startOffset, endOffset);
                const start = nodeValue.indexOf(match);
                const end = start + match.length;
                const range = { start, end };
                matches.push({
                    range,
                    text: match[0],
                    isString: false,
                });
            });
        }
        if (node.children && node.children.length) {
            node.children.forEach(visit);
        }
        if (node.attributes && node.attributes.length) {
            node.attributes.forEach(visit);
        }
    }
    if (ast.nodes && ast.nodes.length) {
        ast.nodes.forEach(visit);
    }
    return matches;
}
function findVueText(ast) {
    let arr = [];
    const regex1 = /\`(.+?)\`/g;
    function emun(ast) {
        if (ast.expression) {
            let text = ast.expression.match(regex1);
            if (text && text[0].match(DOUBLE_BYTE_REGEX)) {
                text.forEach((itemText) => {
                    const varInStr = itemText.match(/(\$\{[^\}]+?\})/g);
                    if (varInStr)
                        itemText.match(DOUBLE_BYTE_REGEX) &&
                            arr.push({
                                text: " " + itemText,
                                range: { start: ast.start + 2, end: ast.end - 2 },
                                isString: true,
                            });
                    else
                        itemText.match(DOUBLE_BYTE_REGEX) &&
                            arr.push({
                                text: itemText,
                                range: { start: ast.start, end: ast.end },
                                isString: false,
                            });
                });
            }
            else {
                ast.tokens &&
                    ast.tokens.forEach((element) => {
                        if (typeof element === "string" &&
                            element.match(DOUBLE_BYTE_REGEX)) {
                            arr.push({
                                text: element,
                                range: {
                                    start: ast.start + ast.text.indexOf(element),
                                    end: ast.start + ast.text.indexOf(element) + element.length,
                                },
                                isString: false,
                            });
                        }
                    });
            }
        }
        else if (!ast.expression && ast.text) {
            ast.text.match(DOUBLE_BYTE_REGEX) &&
                arr.push({
                    text: ast.text,
                    range: { start: ast.start, end: ast.end },
                    isString: false,
                });
        }
        else {
            ast.children &&
                ast.children.forEach((item) => {
                    emun(item);
                });
        }
    }
    emun(ast);
    return arr;
}
function findTextInVueTs(code, startNum) {
    const matches = [];
    const ast = typescript_1.default.createSourceFile("", code, typescript_1.default.ScriptTarget.ES2015, true, typescript_1.default.ScriptKind.TS);
    function visit(node) {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.StringLiteral: {
                /** 判断 Ts 中的字符串含有中文 */
                const { text } = node;
                if (text.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    /** 加一，减一的原因是，去除引号 */
                    const range = { start: start + startNum, end: end + startNum };
                    matches.push({
                        node,
                        range,
                        text,
                        isString: true,
                    });
                }
                break;
            }
            case typescript_1.default.SyntaxKind.TemplateExpression: {
                const { pos, end } = node;
                let templateContent = code.slice(pos, end);
                templateContent = templateContent
                    .toString()
                    .replace(/\$\{[^\}]+\}/, "");
                if (templateContent.match(DOUBLE_BYTE_REGEX)) {
                    const start = node.getStart();
                    const end = node.getEnd();
                    /** 加一，减一的原因是，去除`号 */
                    const range = code.indexOf("${") !== -1
                        ? { start: start + startNum, end: end + startNum }
                        : { start: start + startNum + 1, end: end + startNum - 1 };
                    matches.push({
                        node,
                        range,
                        text: code.slice(start + 1, end - 1),
                        isString: true,
                    });
                }
                break;
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    typescript_1.default.forEachChild(ast, visit);
    return matches;
}
function findTextInVue(code) {
    const vueObejct = compilerVue.compile(code.toString(), {
        outputSourceRange: true,
    });
    let TextaArr = findVueText(vueObejct.ast);
    const sfc = compilerVue.parseComponent(code.toString());
    let vueTemp = findTextInVueTs(sfc.script.content, sfc.script.start);
    return vueTemp.concat(TextaArr);
}
function findTextInTs(code, fileName) {
    const matches = [];
    const ast = typescript_1.default.createSourceFile("", code, typescript_1.default.ScriptTarget.ES2015, true, typescript_1.default.ScriptKind.TSX);
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
                    .replace(/\$\{[^\}]+\}/, "");
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
                    .replace(/\$\{[^\}]+\}/, "");
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
function findChineseText(code, fileName) {
    if (fileName.endsWith(".html")) {
        return findTextInHtml(code);
    }
    else if (fileName.endsWith(".vue")) {
        return findTextInVue(code);
    }
    else {
        return findTextInTs(code, fileName);
    }
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
        const code = utils_1.readFile(file) || "";
        const matches = findChineseText(code, path_1.default.basename(file));
        allChineseText[file] = matches;
    });
    if (mode === "terminal") {
        logChineseText(allChineseText);
        return;
    }
    if (mode === "json") {
        exportChineseText(allChineseText, outputPath, filename, pure);
    }
}
exports.checkChineseText = checkChineseText;
function logChineseText(allChineseText) {
    let count = 0;
    Object.keys(allChineseText).forEach((key) => {
        allChineseText[key].forEach((item) => {
            const { node, text } = item;
            let line = 0;
            let character = 0;
            if (node) {
                const nodeInfo = node
                    .getSourceFile()
                    .getLineAndCharacterOfPosition(node.getStart());
                line = nodeInfo.line;
                character = nodeInfo.character;
            }
            view_1.log.primary(view_1.log.chalk.red(`中文文案：[${text}]`), view_1.log.chalk.blue(`${key}:${line + 1}:${character}`));
            count += 1;
        });
    });
    view_1.log.primary();
    view_1.log.primary(view_1.log.chalk.yellow(`匹配到中文文案共[${count}]处`));
}
function exportChineseText(allChineseText, exportDir, filename, pure) {
    const dir = exportDir || "./export-lang";
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
                let line = 0;
                let character = 0;
                if (node) {
                    const nodeInfo = node
                        .getSourceFile()
                        .getLineAndCharacterOfPosition(node.getStart());
                    line = nodeInfo.line;
                    character = nodeInfo.character;
                }
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
