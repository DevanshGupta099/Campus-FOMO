#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return '';
  }
}

// Get all files that have changed in status (staged, unstaged, untracked)
const statusLines = run('git status --porcelain').split('\n').filter(Boolean);
const changedFiles = statusLines.map(line => line.substring(3).trim());

const codeDirs = ['frontend/', 'backend/', 'infra/', 'apps/'];
const touchesCode = changedFiles.some(file => codeDirs.some(dir => file.startsWith(dir)));

if (!touchesCode) {
  console.log('[check-ai-log] No application code changes detected. AI-LOG check passed.');
  process.exit(0);
}

// Code changes detected; verify docs/AI-LOG.md exists and is modified or newly added
const logStatus = statusLines.find(line => line.endsWith('docs/AI-LOG.md'));

if (!existsSync('docs/AI-LOG.md') || (!logStatus && !process.env.CI)) {
  console.error('\n[check-ai-log] ERROR: Code changes detected in frontend/, backend/, infra/, or apps/, but docs/AI-LOG.md was not updated!');
  console.error('[check-ai-log] Rule: Every code change must append a new entry to docs/AI-LOG.md.\n');
  process.exit(1);
}

// Check diff of docs/AI-LOG.md to ensure strictly append-only (no deletions or edits above)
// If it's a tracked file with modifications, inspect diff
if (logStatus && !logStatus.startsWith('??')) {
  const logDiff = run('git diff -U0 HEAD -- docs/AI-LOG.md');
  const diffLines = logDiff.split('\n');

  let hasDeletions = false;
  for (const line of diffLines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
      continue;
    }
    if (line.startsWith('-')) {
      hasDeletions = true;
      break;
    }
  }

  if (hasDeletions) {
    console.error('\n[check-ai-log] ERROR: docs/AI-LOG.md contains line deletions or edits to past entries!');
    console.error('[check-ai-log] Rule: docs/AI-LOG.md is strictly append-only. Past entries must never be modified.\n');
    process.exit(1);
  }
}

console.log('[check-ai-log] docs/AI-LOG.md append-only enforcement passed.');
process.exit(0);
