import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const INITIAL_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const INITIAL_PASSWORD_LENGTH = 12;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, hashBuffer.length);
  if (candidate.length !== hashBuffer.length) return false;
  return timingSafeEqual(candidate, hashBuffer);
}

export function generateInitialPassword(): string {
  const bytes = randomBytes(INITIAL_PASSWORD_LENGTH);
  let password = "";
  for (let i = 0; i < INITIAL_PASSWORD_LENGTH; i++) password += INITIAL_PASSWORD_ALPHABET[bytes[i] % INITIAL_PASSWORD_ALPHABET.length];
  return password;
}
