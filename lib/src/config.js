"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCLIConfigFile = exports.getCLIConfigJson = exports.getCLIConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function getCLIConfig() {
    let CLIConfig = path_1.default.resolve(process.cwd(), `${constants_1.FTINTL_CONFIG_FILENAME}.js`);
    // 先找js
    if (!fs_1.default.existsSync(CLIConfig)) {
        CLIConfig = path_1.default.resolve(process.cwd(), `${constants_1.FTINTL_CONFIG_FILENAME}.ts`);
        //再找ts
        if (!fs_1.default.existsSync(CLIConfig)) {
            return null;
        }
    }
    return CLIConfig;
}
exports.getCLIConfig = getCLIConfig;
function getCLIConfigJson() {
    const configPath = getCLIConfig();
    if (typeof configPath !== "string") {
        return {};
    }
    const config = utils_1.getFileToJson(configPath);
    return config;
}
exports.getCLIConfigJson = getCLIConfigJson;
function createCLIConfigFile(filePath, text) {
    fs_1.default.writeFileSync(filePath, text);
}
exports.createCLIConfigFile = createCLIConfigFile;
