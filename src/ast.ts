import ts from "typescript";

export function findI18NExpressionInFile(code: string) {
  const expressions: ts.Node[] = [];
  const ast = ts.createSourceFile(
    "",
    code || "",
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        expressions.push(node);
        break;
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(ast, visit);

  return expressions;
}
