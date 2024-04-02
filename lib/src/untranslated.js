"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUntranslatedMessages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const d3_dsv_1 = require("d3-dsv");
const config_1 = require("./config");
const utils_1 = require("./utils");
const regexp_1 = require("./regexp");
const view_1 = require("./view");
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
function checkUntranslatedMessages(exportDir, lang) {
    const config = config_1.getValFromConfiguration();
    const langs = lang ? [lang] : config.langs;
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
exports.checkUntranslatedMessages = checkUntranslatedMessages;
