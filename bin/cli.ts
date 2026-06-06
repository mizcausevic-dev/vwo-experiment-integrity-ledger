#!/usr/bin/env node
import { loadLedger, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: vwo-experiment-integrity-ledger <input.json> [--format markdown|json]");
  process.exit(1);
}

const ledger = await loadLedger(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(ledger, null, 2) : renderMarkdown(ledger));
