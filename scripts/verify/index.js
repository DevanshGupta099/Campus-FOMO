#!/usr/bin/env node
import { execSync } from "node:child_process";

const steps = [
  { name: "Lint", command: "pnpm lint" },
  { name: "Typecheck", command: "pnpm typecheck" },
  {
    name: "Dependency Cruiser (Architectural Boundaries)",
    command: "pnpm depcruise",
  },
  { name: "Unit Tests", command: "pnpm test:unit" },
  { name: "Contract Verification", command: "pnpm test:contract" },
  { name: "Build Packages and Applications", command: "pnpm build" },
];

console.log(
  "=== Campus FOMO: Starting Verification Pipeline (pnpm verify) ===\n",
);

for (const step of steps) {
  process.stdout.write(`[verify] Running ${step.name}... `);
  try {
    execSync(step.command, { stdio: "pipe" });
    console.log("✓ PASSED");
  } catch (err) {
    console.log("✗ FAILED");
    console.error(`\nError occurred while executing: ${step.command}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

console.log("\n=== All verification checks passed! Monorepo is green. ===");
