/**
 * Run DB migrations using node-postgres (pg) which supports DDL properly.
 * Usage: npx tsx --env-file=.env.local scripts/migrate.ts
 */

import pg from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";

const { Client } = pg;

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("DATABASE_URL is not set — add it to .env.local");
  process.exit(1);
}

function extractStatements(content: string): string[] {
  // Remove single-line comments, then split on semicolons
  const stripped = content
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("--");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n");

  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const client = new Client({ connectionString: rawUrl });
  await client.connect();

  const dir = path.join(process.cwd(), "migrations");
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const content = await readFile(path.join(dir, file), "utf8");
    const statements = extractStatements(content);

    for (const stmt of statements) {
      await client.query(stmt);
    }

    console.log(`  ✓ ${file} (${statements.length} statements)`);
  }

  await client.end();
  console.log("All migrations complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
