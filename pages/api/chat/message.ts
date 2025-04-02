import mongoose from "mongoose";
import dbConnect from "@/lib/connectDB";
import { verifyToken } from "@/lib/token";
import type { ITokenPayload } from "@/lib/token";
import { withEncryption } from "@/lib/withEncryption";
import type { NextApiRequest, NextApiResponse } from "next";
import Conversation, { IConversation } from "@/models/Conversation";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyToken(token) as ITokenPayload | null;
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const currentUserIdObj = new mongoose.Types.ObjectId(payload.userId);

  const { conversationId, text, attachment } = req.body;
  if (!conversationId || (!text && !attachment)) {
    return res
      .status(400)
      .json({ error: "conversationId and text or attachment are required" });
  }

  try {
    const conversation = (await Conversation.findById(
      conversationId
    )) as IConversation | null;

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const newMessage = {
      sender: currentUserIdObj,
      text: text || "",
      createdAt: new Date(),
      seen: false,
      attachment: attachment || null,
    };
    conversation.messages.push(newMessage);

    conversation.lastMessage = {
      text: text || "[Attachment]",
      createdAt: newMessage.createdAt,
    };

    const recipientIdObj = conversation.participants.find(
      (id) => id.toString() !== currentUserIdObj.toString()
    );

    if (recipientIdObj) {
      const recipientStr = recipientIdObj.toString();
      conversation.unreadCounts = conversation.unreadCounts || {};
      conversation.unreadCounts[recipientStr] =
        (conversation.unreadCounts[recipientStr] || 0) + 1;
      conversation.markModified("unreadCounts");
    }

    await conversation.save();

    return res.status(200).json({
      message: "Message sent",
      conversation,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withEncryption(handler);
