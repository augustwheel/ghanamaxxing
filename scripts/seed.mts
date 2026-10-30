/**
 * Seed launches from a CSV or JSON file.
 *
 *   npm run seed -- data/my-launches.csv            # preview only
 *   npm run seed -- data/my-launches.csv --commit   # write to the database
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { parseLaunchFile, prepareSeedLaunches, type RowProblem } from "../src/lib/import/launch-input.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const [file] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const commit = process.argv.includes("--commit");
if (!file) {
  console.error("Usage: npm run seed -- <file.csv|file.json> [--commit]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).");
  process.exit(1);
}

// Tables live in the ghanamaxxing schema (see src/lib/supabase/env.ts).
const supabase = createClient(url, key, { db: { schema: "ghanamaxxing" }, auth: { persistSession: false } });

const printProblems = (title: string, items: RowProblem[]) => {
  if (!items.length) return;
  console.log(`\n${title} (${items.length})`);
  for (const p of items) console.log(`  row ${p.row}${p.name ? ` ${p.name}` : ""}: ${p.messages.join("; ")}`);
};

const raw = parseLaunchFile(readFileSync(file, "utf8"), basename(file));
const { data: existing, error: fetchError } = await supabase.from("launches").select("slug, url");
if (fetchError) throw fetchError;

const { rows, errors, skipped } = prepareSeedLaunches(raw, {
  slugs: existing.map((e) => e.slug),
  urls: existing.map((e) => e.url),
});

printProblems("Errors", errors);
printProblems("Skipped", skipped);
console.log(`\nReady: ${rows.length}`);
for (const r of rows) console.log(`  ${r.slug.padEnd(28)} ${r.type.padEnd(9)} ${r.city ?? "-"}${r.lat == null ? " (no coordinates)" : ""}`);

if (errors.length) {
  console.log("\nFix the errors above, then run again. Nothing was saved.");
  process.exit(1);
}
if (!commit) {
  console.log("\nPreview only. Add --commit to save.");
  process.exit(0);
}
if (rows.length) {
  const { error } = await supabase.from("launches").insert(rows);
  if (error) throw error;
}
console.log(`\nImported ${rows.length} launches.`);
