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

  const currentUserId = payload.userId;
  const { recipientId } = req.body;
  if (!recipientId) {
    return res.status(400).json({ error: "recipientId is required" });
  }

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        messages: [],
        lastMessage: null,
        unreadCounts: {
          [String(currentUserId)]: 0,
          [String(recipientId)]: 0,
        },
      });
    }

    await conversation.populate("participants", "email username");

    const conversationData = conversation.toObject();
    const { ...conversationWithoutMessages } = conversationData;
    return res.status(200).json({ conversation: conversationWithoutMessages });
  } catch (error) {
    console.error("Error creating/fetching conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withEncryption(handler);
