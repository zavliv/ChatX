import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(
  process.env.ENCRYPTION_KEY ||
    "72a74bb931cd7129928637469a5cb1290e000b5bd3604656522f6234be6b35c2",
  "hex"
);
const iv = Buffer.from(
  process.env.ENCRYPTION_IV || "91b12fd3cdd74328b82428bcd02d616c",
  "hex"
);

export function encryptData(text: string): {
  iv: string;
  encryptedData: string;
} {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

export function decryptData(encryptedData: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
