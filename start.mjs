import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const serverDist = path.join(__dirname, 'dist-server', 'server.js');
const clientDist = path.join(__dirname, 'dist', 'index.html');

// If build artifacts are missing (e.g., Render build command was omitted or only did install), build automatically
if (!fs.existsSync(serverDist) || !fs.existsSync(clientDist)) {
  console.log('[PROOFPATH] Production build missing. Executing build now...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[PROOFPATH] npm run build failed, trying fallback build with bun/npx...', err);
    try {
      execSync('npx vite build && npx esbuild server.ts --platform=node --bundle --format=esm --packages=external --outfile=dist-server/server.js', { stdio: 'inherit' });
    } catch (e) {
      console.error('[PROOFPATH] Build failed:', e);
      process.exit(1);
    }
  }
}

// Start compiled production server
await import('./dist-server/server.js');
