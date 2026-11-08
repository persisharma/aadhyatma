// Review provenance belongs in content data/docs, never public UI or share payloads.
const ts = require('../mobile/node_modules/typescript');
const fs = require('node:fs');
const path = require('node:path');

const reviewFields = new Set(['sourceNote', 'sourceNoteHi', 'sourceNoteEn', 'referenceUrls', 'sanskritReferences', 'independentSourceFamilies', 'edition', 'retrievedAt', 'approvalScope']);
const sourceLabel = /^(?:sources(?:\s*(?:&|and)\s*(?:context|reading context|references))?|story sources|takeaway\s*&\s*source|स्रोत(?: और (?:सन्दर्भ|संदर्भ|पाठ का परिचय))?|कथा की सीख और स्रोत)\s*[+−-]?$/i;
const internalCopy = /(?:\bPRD-\d+|source[- ]verified|स्रोत[- ](?:सत्यापित|प्रमाणित)|Microsoft Word -)/i;

function inspectPublicSource(code, filename = 'screen.tsx') {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  const fail = (node, reason) => findings.push(`${filename}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${reason}`);
  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node)) {
      const value = node.text.trim();
      if (sourceLabel.test(value) || internalCopy.test(value)) fail(node, 'research/verification copy in public module');
      if (/SourceCredits/.test(value)) fail(node, 'bibliography component import');
    }
    if (ts.isPropertyAccessExpression(node)) {
      if (reviewFields.has(node.name.text)) fail(node, `review-only field ${node.name.text}`);
      if (node.getText(source) === 'temple.sources') fail(node, 'publisher bibliography');
    }
    if (ts.isElementAccessExpression(node) && node.expression.getText(source) === 'sanatanSources') fail(node, 'research registry in public module');
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

function publicModules(root) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '__tests__') continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.[jt]sx?$/.test(file) && !/\.test\./.test(file)) files.push(file);
    }
  }
  for (const dir of ['mobile/src/screens', 'mobile/src/components', 'mobile/src/ask/intents']) walk(path.join(root, dir));
  for (const name of fs.readdirSync(path.join(root, 'mobile/src/utils'))) {
    if (/^(?:share|kidsStoryShare).*\.[jt]sx?$/.test(name)) files.push(path.join(root, 'mobile/src/utils', name));
  }
  return files;
}

module.exports = { inspectPublicSource, publicModules };
