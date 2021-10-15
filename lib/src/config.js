"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValFromConfiguration = exports.createFastIntlConfigFile = exports.getFastIntlConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const assert_1 = __importDefault(require("./assert"));
const utils_1 = require("./utils");
function getFastIntlConfig() {
    let configPath = path_1.default.resolve(constants_1.ROOT_DIR, `${constants_1.FTINTL_CONFIG_FILENAME}.js`);
    // 先找js
    if (!fs_1.default.existsSync(configPath)) {
        configPath = path_1.default.resolve(constants_1.ROOT_DIR, `${constants_1.FTINTL_CONFIG_FILENAME}.ts`);
        //再找ts
        if (!fs_1.default.existsSync(configPath)) {
            return null;
        }
    }
    return configPath;
}
exports.getFastIntlConfig = getFastIntlConfig;
function createFastIntlConfigFile(filePath, text) {
    fs_1.default.writeFileSync(filePath, text);
}
exports.createFastIntlConfigFile = createFastIntlConfigFile;
function getValFromConfiguration(key) {
    const configPath = getFastIntlConfig();
    assert_1.default(!!configPath, 'ftintl 配置文件不存在');
    const config = utils_1.getFileToJson(configPath);
    if (typeof key === 'string') {
        return config[key];
    }
    return config;
}
exports.getValFromConfiguration = getValFromConfiguration;
