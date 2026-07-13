import Conf from "conf";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import os from "node:os";

const machineKey = scryptSync(os.hostname() + os.userInfo().username, "aira-cli-kit-salt", 32);

function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", machineKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf-8");
}

function encrypt(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", machineKey, iv);
  const enc = Buffer.concat([cipher.update(value, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

const store = new Conf({ projectName: "aira-cli-kit", clearInvalidConfig: true });

export function getStoredSecret(cliName: string): string | undefined {
  const raw = store.get(`secrets.${cliName}`) as string | undefined;
  if (!raw) return undefined;
  try { return decrypt(raw); } catch { return undefined; }
}

export function setStoredSecret(cliName: string, value: string) {
  store.set(`secrets.${cliName}`, encrypt(value));
}
