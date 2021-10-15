"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLangs = exports.initCLI = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const view_1 = require("./view");
const config_1 = require("./config");
function initCLI(options) {
    const { fileType } = options;
    const config = constants_1.DEFAULT_CLI_CONFIG_FILE[fileType];
    config_1.createCLIConfigFile(path_1.default.resolve(process.cwd(), `${constants_1.FTINTL_CONFIG_FILENAME}.${fileType}`), view_1.prettierFile(`export default ${config}`, {
        parser: 'babel',
        trailingComma: 'all',
        singleQuote: true,
    }));
}
exports.initCLI = initCLI;
function initLangs() { }
exports.initLangs = initLangs;
