import { randomBytes, createHash } from "crypto";

/** CSRF token echoed back by the provider and checked against the signed cookie on callback. */
export function generateState(): string {
  return randomBytes(24).toString("base64url");
}

/** PKCE code_verifier - kept server-side only, in the signed oauth cookie. */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/** PKCE code_challenge (S256) sent to the provider's authorize endpoint. */
export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
