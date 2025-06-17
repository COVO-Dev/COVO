import crypto from 'crypto';

export const generateCodeVerifier = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

export const generateCodeChallenge = (verifier: string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(verifier);
  return hash.digest('base64url');
};

export function generateResetToken(): { rawToken: string; hashedToken: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  return { rawToken, hashedToken };
}
