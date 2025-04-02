import dbConnect from "@/lib/connectDB";
import { verifyToken } from "@/lib/token";
import Conversation from "@/models/Conversation";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });
  const currentUserId = payload.userId;
  try {
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .select("-messages")
      .populate("participants", "username email")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ conversations });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withEncryption(handler);
