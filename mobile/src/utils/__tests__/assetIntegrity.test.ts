import { createHash } from 'crypto';

const mockFile = { exists: true, size: 0, body: new Uint8Array() };
jest.mock('expo-file-system', () => ({
  File: class {
    uri: string;
    constructor(uri: string) { this.uri = uri; }
    get exists() { return mockFile.exists; }
    get size() { return mockFile.size; }
    async bytes() { return mockFile.body; }
  },
}));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digest: jest.fn(async (_algo: string, data: Uint8Array) => {
    const out = require('crypto').createHash('sha256').update(data).digest();
    return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
  }),
}));

import { verifyDownloadedAsset, VERIFY_DIGEST_MAX_BYTES } from '@/utils/assetIntegrity';

const body = new Uint8Array([1, 2, 3, 4, 5]);
const key = createHash('sha256').update(body).digest('hex').slice(0, 16);

function setFile(over: Partial<typeof mockFile>) {
  Object.assign(mockFile, { exists: true, size: body.length, body }, over);
}

describe('verifyDownloadedAsset', () => {
  it('accepts bytes whose SHA-256 prefix is the key', async () => {
    setFile({});
    await expect(verifyDownloadedAsset('file:///x', key)).resolves.toBeUndefined();
  });
  it('rejects corrupted bytes', async () => {
    setFile({ body: new Uint8Array([9, 9, 9]) });
    await expect(verifyDownloadedAsset('file:///x', key)).rejects.toThrow('does not match its key');
  });
  it('rejects an empty or missing file', async () => {
    setFile({ size: 0 });
    await expect(verifyDownloadedAsset('file:///x', key)).rejects.toThrow('empty');
    setFile({ exists: false });
    await expect(verifyDownloadedAsset('file:///x', key)).rejects.toThrow('empty');
  });
  it('checks size only for a key that is not a digest prefix', async () => {
    setFile({ body: new Uint8Array([9]) });
    await expect(verifyDownloadedAsset('file:///x', 'abc')).resolves.toBeUndefined();
  });
  it('does not pull a large file through the digest', async () => {
    setFile({ size: VERIFY_DIGEST_MAX_BYTES + 1, body: new Uint8Array([9]) });
    await expect(verifyDownloadedAsset('file:///x', key)).resolves.toBeUndefined();
  });
});
