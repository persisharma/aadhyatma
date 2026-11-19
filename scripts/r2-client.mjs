/** Shared S3-compatible R2 client. Credentials never enter manifests or reports. */
import { createHash, createHmac } from 'node:crypto';

export const CONTENT_TYPES = Object.freeze({
  webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
});
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const REQUIRED_SECRETS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
export const missingSecrets = env => REQUIRED_SECRETS.filter(key => !env[key]?.trim());

export function createR2Client(env = process.env, request = fetch) {
  if (missingSecrets(env).length) throw Error(`Missing ${missingSecrets(env).join(' / ')}`);
  const account = env.R2_ACCOUNT_ID.trim(), bucket = env.R2_BUCKET?.trim() || 'vedansh';
  if (!/^[a-z0-9]+$/i.test(account) || !/^[a-z0-9][a-z0-9.-]*$/.test(bucket)) throw Error('Invalid R2 account or bucket');
  const host = `${account}.r2.cloudflarestorage.com`;
  const hmac = (key, data) => createHmac('sha256', key).update(data).digest();
  function signedHeaders(method, key, body) {
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = amzDate.slice(0, 8), payloadHash = sha256(body ?? Buffer.alloc(0));
    const uri = `/${bucket}/${key}`.split('/').map(encodeURIComponent).join('/');
    const headers = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signed = 'host;x-amz-content-sha256;x-amz-date';
    const scope = `${date}/auto/s3/aws4_request`;
    const canonical = [method, uri, '', headers, signed, payloadHash].join('\n');
    const signingKey = hmac(hmac(hmac(hmac(`AWS4${env.R2_SECRET_ACCESS_KEY}`, date), 'auto'), 's3'), 'aws4_request');
    const signature = createHmac('sha256', signingKey).update(['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical)].join('\n')).digest('hex');
    return {
      Authorization: `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
      'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate,
    };
  }
  return {
    async uploadIfMissing(key, bytes, contentType) {
      if (!/^[a-zA-Z0-9/_-]+\.[a-z0-9]+$/.test(key) || key.split('/').includes('..')) throw Error('Invalid R2 object key');
      const url = `https://${host}/${bucket}/${key}`;
      const head = await request(url, { method: 'HEAD', headers: signedHeaders('HEAD', key), signal: AbortSignal.timeout(30000) });
      if (head.status === 200) return 'existing';
      // An auth/network/server failure must never be interpreted as a missing object.
      if (head.status !== 404) throw Error(`HEAD ${key}: HTTP ${head.status}`);
      const result = await request(url, { method: 'PUT', headers: {
        ...signedHeaders('PUT', key, bytes), 'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      }, body: bytes, signal: AbortSignal.timeout(30000) });
      if (!result.ok) throw Error(`PUT ${key}: HTTP ${result.status}`);
      return 'uploaded';
    },
  };
}
