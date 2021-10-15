"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLangs = exports.initFastIntl = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const view_1 = require("./view");
const config_1 = require("./config");
function initFastIntl(options) {
    const { fileType } = options;
    const config = constants_1.DEFAULT_FAST_INTL_CONFIG_FILE[fileType];
    config_1.createFastIntlConfigFile(path_1.default.resolve(constants_1.ROOT_DIR, `${constants_1.FTINTL_CONFIG_FILENAME}.${fileType}`), view_1.prettierFile(`export default ${config}`, {
        parser: 'babel',
        trailingComma: 'all',
        singleQuote: true,
    }));
}
exports.initFastIntl = initFastIntl;
// TODO: 待实现
function initLangs() { }
exports.initLangs = initLangs;
