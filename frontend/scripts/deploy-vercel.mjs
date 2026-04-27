#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rawArgs = process.argv.slice(2);

const hasFlag = (flag) => rawArgs.includes(flag);
const getValue = (flag) => {
  const index = rawArgs.indexOf(flag);
  if (index === -1) return undefined;
  return rawArgs[index + 1];
};

const showHelp = hasFlag("--help") || hasFlag("-h");
const isPreview = hasFlag("--preview");
const skipBuild = hasFlag("--skip-build");
const preserveEnv = !hasFlag("--no-preserve-env");
const token = getValue("--token") ?? process.env.VERCEL_TOKEN;
const scope = getValue("--scope");

if (showHelp) {
  console.log(`\nDeploy frontend to Vercel\n\nUsage:\n  npm run deploy:vercel -- [options]\n\nOptions:\n  --preview            Deploy preview instead of production\n  --skip-build         Skip local build step before deploy\n  --no-preserve-env    Do not backup/restore local .env.local\n  --token <token>      Vercel token (or use VERCEL_TOKEN env)\n  --scope <team>       Deploy under specific Vercel scope/team\n  -h, --help           Show help\n`);
  process.exit(0);
}

const envLocalPath = path.join(process.cwd(), ".env.local");
const envLocalBackupPath = path.join(process.cwd(), ".env.local.deploy-backup");

const resolveCommand = (command) =>
  process.platform === "win32" ? `${command}.cmd` : command;

const run = (command, args, step) => {
  console.log(`\n[deploy-vercel] ${step}`);
  console.log(`> ${command} ${args.join(" ")}`);

  const result = spawnSync(resolveCommand(command), args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    const code = result.status ?? 1;
    throw new Error(`[deploy-vercel] Failed at step: ${step} (exit code ${code})`);
  }
};

let didBackupEnv = false;

try {
  if (preserveEnv && existsSync(envLocalPath)) {
    if (existsSync(envLocalBackupPath)) {
      rmSync(envLocalBackupPath, { force: true });
    }
    copyFileSync(envLocalPath, envLocalBackupPath);
    didBackupEnv = true;
    console.log("\n[deploy-vercel] Backed up local .env.local before deploy");
  }

  if (!skipBuild) {
    run("npm", ["run", "build"], "Build frontend");
  }

  const deployArgs = ["vercel", "--yes"];

  if (!isPreview) {
    deployArgs.push("--prod");
  }

  if (token) {
    deployArgs.push("--token", token);
  }

  if (scope) {
    deployArgs.push("--scope", scope);
  }

  run("npx", deployArgs, isPreview ? "Deploy preview to Vercel" : "Deploy production to Vercel");
  console.log("\n[deploy-vercel] Done.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (didBackupEnv && existsSync(envLocalBackupPath)) {
    copyFileSync(envLocalBackupPath, envLocalPath);
    rmSync(envLocalBackupPath, { force: true });
    console.log("[deploy-vercel] Restored local .env.local from backup");
  }
}
