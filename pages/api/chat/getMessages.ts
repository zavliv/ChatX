import dbConnect from "@/lib/connectDB";
import { verifyToken } from "@/lib/token";
import Conversation from "@/models/Conversation";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const currentUserId = payload.userId;
  const { conversationId } = req.query;
  if (!conversationId) {
    return res.status(400).json({ error: "conversationId is required" });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (
      !conversation.participants.some(
        (participant) => participant.toString() === currentUserId
      )
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withEncryption(handler);
