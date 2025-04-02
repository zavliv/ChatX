import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log("Socket.io is already running.");
    res.end();
    return;
  }

  console.log("Initializing Socket.io server...");
  const httpServer = res.socket.server;
  const io = new IOServer(httpServer, { path: "/api/socketio" });
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a user-specific room, for receiving user-level events
    socket.on("joinUserRoom", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room: user:${userId}`);
    });

    // Join a conversation room
    socket.on("joinRoom", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room: ${conversationId}`);
    });

    // Notify a user about a new conversation
    socket.on(
      "newConversation",
      (data: { conversation: any; recipientId: string }) => {
        // Broadcast to the recipient's user room
        io.to(`user:${data.recipientId}`).emit(
          "newConversation",
          data.conversation
        );
        console.log(`Broadcasted new conversation to user:${data.recipientId}`);
      }
    );

    // Send a new message
    socket.on(
      "sendMessage",
      (data: {
        conversationId: string;
        text: string;
        sender: string;
        createdAt: string;
        recipientId?: string;
        // Optionally handle attachments here:
        attachment?: {
          url: string;
          type: string;
          fileName?: string;
        };
      }) => {
        console.log("Received sendMessage data:", data);

        io.to(data.conversationId).emit("newMessage", {
          conversationId: data.conversationId,
          text: data.text,
          sender: data.sender,
          createdAt: data.createdAt,
          attachment: data.attachment || null,
        });

        if (data.recipientId && data.recipientId !== data.sender) {
          io.to(`user:${data.recipientId}`).emit("newMessageForUser", {
            conversationId: data.conversationId,
            text: data.text,
            sender: data.sender,
            createdAt: data.createdAt,
            attachment: data.attachment || null,
          });
        }
      }
    );

    // Leave a conversation room
    socket.on("leaveRoom", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left room: ${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  res.end();
}
