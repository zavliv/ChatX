import { encryptData } from "@/lib/cryptoUtils";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { body } = req.body;
    if (!body)
      return res
        .status(400)
        .json({ error: "Body is required for encryption." });

    const encrypted = encryptData(JSON.stringify(body)).encryptedData;
    return res.status(200).json({ encrypted });
  }
  res.status(405).json({ error: "Method Not Allowed" });
}
