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
const checkUntranslated_1 = require("./checkUntranslated");
const checkUnused_1 = require("./checkUnused");
const checkUndefined_1 = require("./checkUndefined");
const checkChinese_1 = require("./checkChinese");
const view_1 = require("./view");
const config_1 = require("./config");
const babelRegister_1 = __importDefault(require("./babelRegister"));
const configPath = config_1.getFastIntlConfig();
babelRegister_1.default.setOnlyMap({
    key: 'config',
    value: configPath ? [configPath] : [],
});
commander_1.default
    .version(package_json_1.default.version, '-v, --version')
    .name('ftintl')
    .usage('国际化工具');
commander_1.default
    .command('init')
    .description('初始化多语言配置')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    if (configPath) {
        view_1.log.error('初始化失败，ftintl相关配置已存在');
        return;
    }
    const { fileType } = yield inquirer_1.default.prompt({
        type: 'list',
        name: 'fileType',
        choices: ['ts', 'js'],
        default: 'ts',
        message: '请选择使用的语言',
    });
    init_1.initFastIntl({ fileType });
    init_1.initLangs();
}));
/**
 * 校验资源文件中未翻译的文案
 */
commander_1.default
    .command('untranslated [mode]')
    .option('--output-path <outputPath>', '输出目录', 'ftintl-untranslated-lang')
    .option('--lang [lang]', '要检查的语言')
    .description('校验资源文件中未翻译的文案')
    .action((mode = 'terminal', options) => {
    view_1.spining('校验资源文件中未翻译的文案', () => {
        checkUntranslated_1.checkUntranslatedMessages(mode, {
            outputPath: options.outputPath,
            lang: options.lang,
        });
    });
});
/**
 * 校验资源文件中未使用文案
 */
commander_1.default
    .command('unused')
    .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
    .option('--lang [lang]', '要检查的语言')
    .description('校验资源文件中未使用文案')
    .action((options) => {
    view_1.spining('校验资源文件中未使用文案', () => {
        checkUnused_1.checkUnusedMessages(options.file, options.lang);
    });
});
/**
 * 校验已使用但未在资源文件定义的文案
 */
commander_1.default
    .command('undefined')
    .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
    .option('--lang [lang]', '要检查的语言')
    .description('校验已使用但未在资源文件定义的文案')
    .action((options) => {
    view_1.spining('校验已使用但未在资源文件定义的文案', () => {
        checkUndefined_1.checkUndefinedMessages(options.file, options.lang);
    });
});
/**
 * 检查文件中的中文文案
 */
commander_1.default
    .command('zh [mode]')
    .requiredOption('--file <filePath>', '必须指定扫描的文件或文件夹')
    .option('--output-path [outputPath]', '输出目录', 'ftintl-zh-lang')
    .description('检查文件中的中文文案')
    .action((mode = 'terminal', options) => {
    view_1.spining('检查文件中的中文文案', () => {
        checkChinese_1.checkChineseText(mode, {
            filePath: options.file,
            outputPath: options.outputPath,
        });
    });
});
commander_1.default.parseAsync(process.argv);
