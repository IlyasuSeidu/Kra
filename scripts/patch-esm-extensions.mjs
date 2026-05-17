import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node scripts/patch-esm-extensions.mjs <dist-directory>");
  process.exit(1);
}

const root = process.cwd();
const absoluteTargetDir = path.resolve(root, targetDir);

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      return walk(absolutePath);
    }

    return absolutePath.endsWith(".js") ? [absolutePath] : [];
  });
}

function shouldPatchSpecifier(specifier) {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) {
    return false;
  }

  return !/\.(js|json|node)$/u.test(specifier);
}

function resolvePatchedSpecifier(filePath, specifier) {
  if (!shouldPatchSpecifier(specifier)) {
    return specifier;
  }

  const importedPath = path.resolve(path.dirname(filePath), specifier);

  if (existsSync(`${importedPath}.js`)) {
    return `${specifier}.js`;
  }

  if (existsSync(path.join(importedPath, "index.js"))) {
    return `${specifier}/index.js`;
  }

  return specifier;
}

function patchSource(filePath, source) {
  return source
    .replace(/(\bfrom\s+["'])(\.\.?\/[^"']+)(["'])/gu, (match, prefix, specifier, suffix) => {
      return `${prefix}${resolvePatchedSpecifier(filePath, specifier)}${suffix}`;
    })
    .replace(
      /(\bimport\s*\(\s*["'])(\.\.?\/[^"']+)(["']\s*\))/gu,
      (match, prefix, specifier, suffix) => {
        return `${prefix}${resolvePatchedSpecifier(filePath, specifier)}${suffix}`;
      }
    );
}

let patchedCount = 0;

for (const filePath of walk(absoluteTargetDir)) {
  const source = readFileSync(filePath, "utf8");
  const patched = patchSource(filePath, source);

  if (patched !== source) {
    writeFileSync(filePath, patched);
    patchedCount += 1;
  }
}

console.log(`Patched ESM import specifiers in ${patchedCount} file(s) under ${targetDir}.`);
