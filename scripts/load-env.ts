import dotenv from "dotenv";
import fs from "fs";
import path from "path";

/** Load .env.local first (Next.js convention), then .env as fallback. */
export function loadProjectEnv(): void {
  const root = process.cwd();
  const localPath = path.join(root, ".env.local");
  const envPath = path.join(root, ".env");
  if (fs.existsSync(localPath)) dotenv.config({ path: localPath });
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

// Auto-load when imported by scripts (must run before lib/firebase initializes).
loadProjectEnv();
