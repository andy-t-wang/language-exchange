/**
 * Generates an HMAC-SHA256 hash of the provided nonce using a secret key from the environment.
 * Uses Web Crypto API for Edge Runtime compatibility.
 * @param {Object} params - The parameters object.
 * @param {string} params.nonce - The nonce to be hashed.
 * @returns {Promise<string>} The resulting HMAC hash in hexadecimal format.
 */
export const hashNonce = async ({ nonce }: { nonce: string }): Promise<string> => {
  const encoder = new TextEncoder();
  const secretKey = process.env.HMAC_SECRET_KEY!;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(nonce)
  );

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
