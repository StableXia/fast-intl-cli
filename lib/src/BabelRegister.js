"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const utils_1 = require("./utils");
class BabelRegister {
    constructor() {
        this.only = {};
    }
    setOnlyMap({ key, value }) {
        this.only[key] = value;
        this.register();
    }
    register() {
        const only = Object.keys(this.only)
            .reduce((memo, key) => {
            return memo.concat(this.only[key]);
        }, [])
            .map(utils_1.winPath)
            .map((path) => (fs_1.existsSync(path) ? fs_1.realpathSync(path) : path));
        require('@babel/register')({
            presets: [
                require.resolve('@babel/preset-env'),
                require.resolve('@babel/preset-typescript'),
            ],
            ignore: [/node_modules/],
            only,
            extensions: ['.jsx', '.js', '.ts', '.tsx'],
            babelrc: false,
            cache: false,
        });
    }
}
exports.default = new BabelRegister();
