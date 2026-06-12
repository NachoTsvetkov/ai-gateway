import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
if (/^DESKTOP_SYNC_SECRET=/m.test(content)) {
  console.log('DESKTOP_SYNC_SECRET already set');
  process.exit(0);
}
const secret = crypto.randomBytes(32).toString('hex');
fs.appendFileSync(
  envPath,
  `\n# Desktop monitor prod read proxy\nDESKTOP_SYNC_SECRET="${secret}"\n`,
);
console.log('Added DESKTOP_SYNC_SECRET to .env.local');
