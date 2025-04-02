import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  seen: boolean;
}

export interface ILastMessage {
  text: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastMessage?: ILastMessage | null;
  unreadCounts: Record<string, number>;
}

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
  attachment: {
    url: { type: String, default: "" },
    type: { type: String, default: "" },
    fileName: { type: String, default: "" },
  },
});

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [MessageSchema],
    lastMessage: {
      text: { type: String },
      createdAt: { type: Date },
    },
    unreadCounts: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default (mongoose.models.Conversation as Model<IConversation>) ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
