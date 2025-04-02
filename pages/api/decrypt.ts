import { decryptData } from "@/lib/cryptoUtils";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({ error: "Encrypted data is required." });
    }

    try {
      const decrypted = decryptData(body);

      let parsedData;
      try {
        parsedData = JSON.parse(decrypted);
      } catch (error) {
        console.log("error", error);
        parsedData = decrypted;
      }

      return res.status(200).json({ decrypted: parsedData });
    } catch (error) {
      console.error("Decryption failed:", error);
      return res.status(500).json({ error: "Failed to decrypt data." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
