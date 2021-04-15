#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const inquirer_1 = __importDefault(require("inquirer"));
const package_json_1 = __importDefault(require("../package.json"));
const init_1 = require("./init");
const exports_1 = require("./exports");
const checkUndefinedMessages_1 = require("./checkUndefinedMessages");
const checkChineseText_1 = require("./checkChineseText");
const view_1 = require("./view");
commander_1.default
    .version(package_json_1.default.version, "-v, --version")
    .name("ftintl")
    .usage("国际化工具");
commander_1.default
    .command("init")
    .option("-y", "使用默认配置")
    .description("初始化项目")
    .action((args) => __awaiter(void 0, void 0, void 0, function* () {
    if (args.y) {
        init_1.initCLI();
        init_1.initLangs();
        return;
    }
    const res = yield inquirer_1.default.prompt({
        type: "confirm",
        name: "confirm",
        default: false,
        message: "是否初始化CLI相关配置？",
    });
    if (res.confirm) {
        init_1.initCLI();
    }
}));
commander_1.default
    .command("untranslated")
    .option("--export <export>", "导出目录")
    .option("--lang <lang>", "要检查的语言")
    .description("导出未翻译的文案")
    .action((options) => {
    view_1.spining("导出未翻译的文案", () => {
        exports_1.exportUntranslatedMessages(options.export, options.lang);
    });
});
commander_1.default
    .command("unused")
    .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
    .option("--lang <lang>", "要检查的语言")
    .description("校验未使用文案")
    .action((options) => {
    view_1.spining("校验未使用文案", () => {
        exports_1.exportUnusedMessages(options.file, options.lang);
    });
});
commander_1.default
    .command("undefined")
    .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
    .option("--lang <lang>", "要检查的语言")
    .description("校验未定义的文案")
    .action((options) => {
    view_1.spining("校验未定义的文案", () => {
        checkUndefinedMessages_1.checkUndefinedMessages(options.file, options.lang);
    });
});
commander_1.default
    .command("zh")
    .requiredOption("--file <filePath>", "必须指定扫描的文件或文件夹")
    .description("检查中文文案")
    .action((options) => {
    view_1.spining("检查中文文案", () => {
        checkChineseText_1.checkChineseText(options.file);
    });
});
commander_1.default.parseAsync(process.argv);
