const ts = require('typescript');

/** Resolve inline/StyleSheet/conditional style branches; do not merge alternatives.
 * This catches the known native Image defaults hazard. Dynamic style contracts
 * still need component geometry tests and installed-device review.
 */
function unsafeNativeImageFrames(source, filename = 'component.tsx') {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = new Map();
  const imageNames = new Set();
  const visit = node => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === 'react-native') {
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
        if ((item.propertyName || item.name).text === 'Image') imageNames.add(item.name.text);
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const name = node.name.text;
      declarations.set(name, declarations.has(name) ? null : node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  const merge = (left, right) => left.flatMap(a => right.map(b => ({ ...a, ...b })));
  function styles(node, seen = new Set()) {
    if (!node || seen.has(node)) return [{}];
    const next = new Set(seen).add(node);
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return styles(node.expression, next);
    if (ts.isConditionalExpression(node)) return [...styles(node.whenTrue, next), ...styles(node.whenFalse, next)];
    if (ts.isArrayLiteralExpression(node)) return node.elements.reduce((all, item) => merge(all, styles(item, next)), [{}]);
    if (ts.isIdentifier(node)) return styles(declarations.get(node.text), next);
    if (ts.isPropertyAccessExpression(node)) {
      if (node.expression.getText(file) === 'StyleSheet' && /^absoluteFill(Object)?$/.test(node.name.text)) return [{ absoluteFill: true }];
      let object = ts.isIdentifier(node.expression) ? declarations.get(node.expression.text) : undefined;
      if (object && ts.isCallExpression(object) && object.expression.getText(file) === 'StyleSheet.create') object = object.arguments[0];
      if (object && ts.isObjectLiteralExpression(object)) {
        const property = object.properties.find(p => p.name?.getText(file) === node.name.text);
        return styles(property?.initializer, next);
      }
    }
    if (ts.isObjectLiteralExpression(node)) return node.properties.reduce((all, property) => {
      if (ts.isSpreadAssignment(property)) return merge(all, styles(property.expression, next));
      if (property.name) return all.map(value => ({ ...value, [property.name.getText(file).replace(/^['"]|['"]$/g, '')]: true }));
      return all;
    }, [{}]);
    return [{}];
  }
  const issues = [];
  const inspect = node => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(file);
      if (imageNames.has(tag) || tag === 'Animated.Image') {
        const attribute = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === 'style');
        const expression = attribute?.initializer && ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : undefined;
        for (const style of styles(expression)) {
          if ((style.aspectRatio && !style.height) || (style.absoluteFill && (!style.width || !style.height))) {
            issues.push({ filename, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
              reason: style.aspectRatio && !style.height ? 'Image aspectRatio retains the intrinsic source height' : 'Image absoluteFill retains intrinsic dimensions without width/height overrides' });
            break;
          }
        }
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(file);
  return issues;
}
module.exports = { unsafeNativeImageFrames };
