import dbConnect from "@/lib/connectDB";
import { verifyToken } from "@/lib/token";
import Conversation from "@/models/Conversation";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const currentUserId = payload.userId.toString();
  const { conversationId } = req.body;
  if (!conversationId) {
    return res.status(400).json({ error: "conversationId is required" });
  }

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === currentUserId
    );
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    conversation.messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUserId && !msg.seen) {
        msg.seen = true;
      }
    });
    conversation.unreadCounts = conversation.unreadCounts || {};
    conversation.unreadCounts[currentUserId] = 0;

    conversation.markModified("unreadCounts");

    await conversation.save();
    return res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withEncryption(handler);
