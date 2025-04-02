import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface ITokenPayload {
  userId: string;
}

/**
 * Generates a JWT token with the given payload.
 *
 * @param payload - The payload to embed in the token.
 * @returns A signed JWT token as a string.
 */
export function generateToken(payload: ITokenPayload): string {
  const options: SignOptions = {
    expiresIn: "1h",
    algorithm: "HS256",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT token.
 *
 * @param token - The JWT token to verify.
 * @returns The decoded payload if valid, or null if verification fails.
 */
export function verifyToken(token: string): ITokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ITokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
