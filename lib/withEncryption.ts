import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { encryptData, decryptData } from "@/lib/cryptoUtils";

export function withEncryption(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      if (!req.body?.body) {
        return res.status(400).json({ error: "Missing encrypted payload" });
      }
      try {
        const decryptedPayload = decryptData(req.body.body);
        req.body = JSON.parse(decryptedPayload);
      } catch (error) {
        console.error("Error decrypting request body:", error);
        return res.status(400).json({ error: "Invalid encrypted payload" });
      }
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const jsonString = JSON.stringify(data);
      const encrypted = encryptData(jsonString).encryptedData;
      return originalJson({ body: encrypted });
    };

    return handler(req, res);
  };
}
