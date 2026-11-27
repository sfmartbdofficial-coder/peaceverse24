import crypto from 'crypto';

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID?.trim() || 'gen-lang-client-0936405543';

let cachedCerts: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getFirebaseCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < cachedCerts.expiresAt) {
    return cachedCerts.certs;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error('Failed to fetch Firebase certificates');
  }
  const certs = (await resp.json()) as Record<string, string>;
  cachedCerts = { certs, expiresAt: now + 3600 * 1000 };
  return certs;
}

async function verifyFirebaseBearer(authHeader?: string): Promise<{ uid: string } | null> {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
  if (!match) return null;

  const [headerB64, payloadB64, sigB64] = match[1].split('.');
  try {
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (header?.alg !== 'RS256' || typeof header?.kid !== 'string') return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (
      typeof payload?.sub !== 'string' ||
      !payload.sub ||
      payload.aud !== FIREBASE_PROJECT_ID ||
      payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}` ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec
    ) {
      return null;
    }

    const certs = await getFirebaseCerts();
    const certPem = certs[header.kid];
    if (!certPem) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    const sigBuf = Buffer.from(sigB64, 'base64url');
    if (!verifier.verify(certPem, sigBuf)) return null;

    return { uid: payload.sub };
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const libraryId = (
      process.env.BUNNY_STREAM_LIBRARY_ID ||
      process.env.BUNNY_LIBRARY_ID ||
      ''
    ).trim();
    const apiKey = (
      process.env.BUNNY_STREAM_API_KEY ||
      process.env.BUNNY_API_KEY ||
      ''
    ).trim();
    const cdnHost = (
      process.env.BUNNY_STREAM_CDN_HOST ||
      process.env.BUNNY_STREAM_CDN_HOSTNAME ||
      ''
    )
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    if (!libraryId || !apiKey) {
      return res.status(501).json({
        ok: false,
        code: 'BUNNY_STREAM_NOT_CONFIGURED',
        error: 'Bunny Stream credentials are not configured on the server.',
      });
    }

    const verified = await verifyFirebaseBearer(req.headers?.authorization);
    if (!verified) {
      return res.status(401).json({
        ok: false,
        error: 'Authentication required to create Bunny Stream video.',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const safeTitle =
      typeof body?.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 120)
        : `PeaceVerse_${Date.now()}`;

    const createResp = await fetch(
      `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos`,
      {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ title: safeTitle }),
      }
    );

    const created: any = await createResp.json().catch(() => null);
    const videoId = typeof created?.guid === 'string' ? created.guid : '';
    if (!createResp.ok || !videoId) {
      return res.status(502).json({
        ok: false,
        error:
          created?.Message ||
          created?.message ||
          `Bunny Stream create failed (${createResp.status}).`,
      });
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 7200;
    const signature = crypto
      .createHash('sha256')
      .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
      .digest('hex');

    const embedUrl = `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`;
    const hlsUrl = cdnHost ? `https://${cdnHost}/${videoId}/playlist.m3u8` : '';

    return res.status(200).json({
      ok: true,
      libraryId,
      videoId,
      guid: videoId,
      expirationTime,
      signature,
      tusEndpoint: 'https://video.bunnycdn.com/tusupload',
      embedUrl,
      playbackUrl: embedUrl,
      hlsUrl,
      cdnHost,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Failed to create Bunny Stream video.',
    });
  }
}
