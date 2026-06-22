import * as crypto from 'crypto';

export function generateAuthKeyHelper(): string {
  const timestamp = Date.now();
  const secretKey = process.env.IPAY_SECRET_KEY || '';
  const serviceId = process.env.IPAY_SERVICE_ID || '';

  // sha1(secret_key + timestamp) xeshini hisoblash
  const hash = crypto
    .createHash('sha1')
    .update(secretKey + timestamp)
    .digest('hex');

  // Strukturasi: service_id-hash-timestamp
  return `${serviceId}-${hash}-${timestamp}`;
}