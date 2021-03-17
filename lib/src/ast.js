"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findI18NExpressionInFile = void 0;
const typescript_1 = __importDefault(require("typescript"));
function findI18NExpressionInFile(code) {
    const expressions = [];
    const ast = typescript_1.default.createSourceFile("", code || "", typescript_1.default.ScriptTarget.ES2015, true, typescript_1.default.ScriptKind.TSX);
    function visit(node) {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.CallExpression: {
                expressions.push(node);
                break;
            }
        }
        typescript_1.default.forEachChild(node, visit);
    }
    typescript_1.default.forEachChild(ast, visit);
    return expressions;
}
exports.findI18NExpressionInFile = findI18NExpressionInFile;
