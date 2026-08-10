const fs = require("node:fs");
const path = require("node:path");

const compilerPath = process.env.R6C_TYPESCRIPT_LIB;
if (!compilerPath) {
  throw new Error("Set R6C_TYPESCRIPT_LIB to an existing offline TypeScript compiler library.");
}
const ts = require(compilerPath);

const validationRoot = path.resolve(__dirname, "..");
function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return entry.isFile() && entry.name.endsWith(".ts") ? [target] : [];
  });
}

const program = ts.createProgram({
  rootNames: sourceFiles(validationRoot),
  options: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["lib.esnext.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
  },
});

const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
  const host = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n",
  };
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  process.exitCode = 1;
} else {
  console.log(`R6C TypeScript validation: ${program.getSourceFiles().filter((file) => !file.isDeclarationFile).length} source files passed with TypeScript ${ts.version}`);
}
