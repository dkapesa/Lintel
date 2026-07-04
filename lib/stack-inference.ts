function changedPaths(diff: string) {
  const paths = [
    ...diff.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm),
    ...diff.matchAll(/^\+\+\+ b\/(.+)$/gm),
  ].flatMap((match) => {
    if (match.length >= 3) return [match[2]];
    return match[1] ? [match[1]] : [];
  });

  return [...new Set(paths.map((path) => path.trim()).filter(Boolean))];
}

export function inferStack(diff: string): string | null {
  const paths = changedPaths(diff);
  const text = diff.toLowerCase();
  const hasTypeScript = paths.some((path) => /\.(?:ts|tsx)$/i.test(path));
  const hasTsxOrJsx = paths.some((path) => /\.(?:tsx|jsx)$/i.test(path));
  const hasPython = paths.some((path) => /\.py$/i.test(path));
  const pathMatches = (pattern: RegExp) => paths.some((path) => pattern.test(path));
  const docsOnly = paths.length > 0 && paths.every((path) => (
    /\.(?:md|mdx|rst|txt)$/i.test(path)
    || /(^|\/)(?:docs?|documentation)(\/|$)/i.test(path)
  ));

  if (docsOnly) return "Markdown / Documentation";

  const hasDatabaseMigration = paths.some((path) => (
    /\.sql$/i.test(path)
    || /\.prisma$/i.test(path)
    || /(^|\/)(?:migrations?|database\/migrations?|db\/migrations?)(\/|$)/i.test(path)
    || /(^|\/)(?:database|db)\/schemas?(?:\/|\.|$)/i.test(path)
    || /(^|\/)schema\.(?:sql|prisma)$/i.test(path)
  )) || (/\bcreate table\b|\balter table\b|\bdrop table\b/.test(text) && /\bschema\b|\bmigration\b/.test(text));
  if (hasDatabaseMigration) return "SQL / Database migration";

  const hasNextSignal = pathMatches(/(^|\/)(?:next\.config\.[^/]+|packages\/next)(\/|$)/i)
    || /\bnext\.js\b|from ["']next(?:\/|["'])|require\(["']next(?:\/|["'])|next\/(?:navigation|router|headers|server|image|link)\b/.test(text)
    || (hasTypeScript && pathMatches(/(^|\/)(?:app|pages)\/(?:.*\/)?(?:page|layout|route)\.(?:ts|tsx)$/i));
  if (hasTypeScript && hasNextSignal) return "TypeScript / Next.js";

  const hasReactSignal = /from ["']react["']|require\(["']react["']\)|\buse(?:state|effect|memo|callback|context)\s*\(|\breact\.fc\b/.test(text);
  if (hasTsxOrJsx && hasReactSignal) return "TypeScript / React";

  const hasFastApiSignal = /\bfastapi\b|\bapirouter\b|from fastapi import|@(?:app|router)\.(?:get|post|put|patch|delete)\s*\(/.test(text)
    || pathMatches(/(^|\/)(?:api|routes?|endpoints?)\/.+\.py$/i);
  if (hasPython && hasFastApiSignal) return "Python / FastAPI";

  const hasNodeSignal = pathMatches(/(^|\/)(?:server|services?|workers?|jobs?|clients?|api)\/.+\.ts$/i)
    || pathMatches(/(^|\/)[^/]*(?:service|worker|job)[._-]?[^/]*\.ts$/i)
    || /from ["'](?:node:|express|fastify)|require\(["'](?:node:|express|fastify)|\bprocess\.env\b/.test(text);
  if (hasTypeScript && hasNodeSignal) return "TypeScript / Node.js";

  return null;
}
