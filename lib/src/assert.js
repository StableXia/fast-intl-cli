"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Assert extends Error {
    constructor(message) {
        super(message);
        this.name = 'AssertError';
    }
}
function assert(actual, message) {
    if (!actual) {
        throw new Assert(message);
    }
}
exports.default = assert;
