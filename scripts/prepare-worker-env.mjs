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

  const bunnyStorageZone = (
    process.env.BUNNY_STORAGE_ZONE ||
    process.env.BUNNY_STORAGE_ZONE_NAME ||
    ''
  ).trim();

  const bunnyStorageApiKey = (
    process.env.BUNNY_STORAGE_API_KEY ||
    process.env.BUNNY_STORAGE_PASSWORD ||
    process.env.BUNNY_ACCESS_KEY ||
    ''
  ).trim();

  const bunnyStorageRegion = (
    process.env.BUNNY_STORAGE_ENDPOINT ||
    process.env.BUNNY_STORAGE_REGION ||
    ''
  ).trim();

  const bunnyCdnUrl = (
    process.env.BUNNY_CDN_URL ||
    process.env.BUNNY_CDN_HOSTNAME ||
    process.env.BUNNY_PULL_ZONE_URL ||
    ''
  ).trim();

  const bunnyStreamLibraryId = (
    process.env.BUNNY_STREAM_LIBRARY_ID ||
    process.env.BUNNY_LIBRARY_ID ||
    ''
  ).trim();

  const bunnyStreamApiKey = (process.env.BUNNY_STREAM_API_KEY || '').trim();

  const bunnyStreamCdnHost = (
    process.env.BUNNY_STREAM_CDN_HOST ||
    process.env.BUNNY_STREAM_CDN_HOSTNAME ||
    ''
  ).trim();

  const targetPath = path.resolve(process.cwd(), 'worker', 'build-env.ts');
  const content = [
    '// Generated inside ephemeral CI build container for server-side Cloudflare Worker only.',
    `export const BUILD_RESEND_API_KEY = ${JSON.stringify(resendApiKey)};`,
    `export const BUILD_RESEND_FROM_EMAIL = ${JSON.stringify(resendFromEmail)};`,
    `export const BUILD_BUNNY_STORAGE_ZONE = ${JSON.stringify(bunnyStorageZone)};`,
    `export const BUILD_BUNNY_STORAGE_API_KEY = ${JSON.stringify(bunnyStorageApiKey)};`,
    `export const BUILD_BUNNY_STORAGE_REGION = ${JSON.stringify(bunnyStorageRegion)};`,
    `export const BUILD_BUNNY_CDN_URL = ${JSON.stringify(bunnyCdnUrl)};`,
    `export const BUILD_BUNNY_STREAM_LIBRARY_ID = ${JSON.stringify(bunnyStreamLibraryId)};`,
    `export const BUILD_BUNNY_STREAM_API_KEY = ${JSON.stringify(bunnyStreamApiKey)};`,
    `export const BUILD_BUNNY_STREAM_CDN_HOST = ${JSON.stringify(bunnyStreamCdnHost)};`,
    '',
  ].join('\n');

  fs.writeFileSync(targetPath, content, 'utf8');
}
