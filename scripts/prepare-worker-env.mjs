import fs from 'node:fs';
import path from 'node:path';

const isCiBuild =
  process.env.WORKERS_CI === '1' ||
  process.env.CF_PAGES === '1' ||
  process.env.CI === 'true';

if (isCiBuild) {
  const resendApiKey = (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    ''
  ).trim();

  const resendFromEmail = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.VITE_RESEND_FROM_EMAIL ||
    ''
  ).trim();

  const targetPath = path.resolve(process.cwd(), 'worker', 'build-env.ts');
  const content = [
    '// Generated inside ephemeral CI build container for server-side Cloudflare Worker only.',
    `export const BUILD_RESEND_API_KEY = ${JSON.stringify(resendApiKey)};`,
    `export const BUILD_RESEND_FROM_EMAIL = ${JSON.stringify(resendFromEmail)};`,
    '',
  ].join('\n');

  fs.writeFileSync(targetPath, content, 'utf8');
}
