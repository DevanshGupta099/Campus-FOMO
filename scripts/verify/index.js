#!/usr/bin/env node
import { execSync } from "node:child_process";

const steps = [
  {
    name: "AI Log Append-Only Check",
    command: "node scripts/check-ai-log.mjs",
  },
  {
    name: "Backend Typecheck",
    command: "pnpm --filter campus-fomo-backend typecheck",
  },
  {
    name: "Frontend Typecheck",
    command: "pnpm --filter campus-fomo-frontend typecheck",
  },
  {
    name: "Backend Unit & Contract Tests",
    command: "pnpm --filter campus-fomo-backend test:unit",
  },
  {
    name: "Frontend Unit Tests",
    command: "pnpm --filter campus-fomo-frontend test:unit",
  },
  {
    name: "OpenAPI Specification Generation",
    command: "pnpm --filter campus-fomo-backend generate:openapi",
  },
  { name: "Backend Build", command: "pnpm --filter campus-fomo-backend build" },
  {
    name: "Frontend Build",
    command: "pnpm --filter campus-fomo-frontend build",
  },
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

console.log("\n=== All verification checks passed! Repository is green. ===");
