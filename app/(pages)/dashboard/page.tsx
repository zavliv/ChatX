"use client";
import Cookies from "js-cookie";
import {
  getUsers,
  getConversations,
  createConversation,
  sendMessage,
  getMessages,
  markConversationAsRead,
} from "@/lib/apiController";
import ChatBox from "@/components/ChatBox";
import Sidebar from "@/components/Sidebar";
import io, { Socket } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import ChatHeader from "@/components/ChatHeader";
import React, { useEffect, useState, useRef } from "react";
import { FiMenu } from "react-icons/fi";

export default function DashboardPage() {
  const staticAvatar = "https://placehold.co/40x40/000000/FFFFFF/png";
  const { user, loading: userLoading, error: userError } = useUser();

  const [users, setUsers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = Cookies.get("token");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io({ path: "/api/socketio" });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinUserRoom", user._id);
    });

    socket.on("newConversation", (newConvo) => {
      console.log("Received newConversation:", newConvo);
      setConversations((prev) => {
        if (prev.some((c) => c._id === newConvo._id)) return prev;
        return [newConvo, ...prev];
      });
    });

    socket.on("newMessageForUser", (data) => {
      setConversations((prev) =>
        prev.map((convo) => {
          if (convo._id === data.conversationId) {
            const newUnreadCounts = { ...convo.unreadCounts };

            if (!activeChat || activeChat._id !== data.conversationId) {
              const currentCount = newUnreadCounts[user._id] || 0;
              newUnreadCounts[user._id] = currentCount + 1;
            }
            let lastMessageText = data.text;
            if (!data.text && data.attachment) {
              lastMessageText = "[Attachment]";
            }

            return {
              ...convo,
              lastMessage: { text: lastMessageText, createdAt: data.createdAt },
              unreadCounts: newUnreadCounts,
            };
          }
          return convo;
        })
      );
    });

    return () => {
      socket.off("connect");
      socket.off("newConversation");
      socket.off("newMessageForUser");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, activeChat]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (activeChat?._id) {
      socket.emit("joinRoom", activeChat._id);
    }

    const fetchConversationMessages = async () => {
      if (activeChat?._id && token) {
        try {
          const data = await getMessages(token, activeChat._id);
          setMessages(data.messages || []);
        } catch (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
        }
      }
    };

    fetchConversationMessages();

    const handleNewMessage = (newMsg: any) => {
      if (!user) return;
      if (activeChat && activeChat._id === newMsg.conversationId) {
        if (newMsg.sender !== user?._id) {
          markConversationAsRead({ conversationId: activeChat._id }, token!)
            .then(() => {
              setConversations((prev) =>
                prev.map((c) =>
                  c._id === activeChat._id
                    ? {
                        ...c,
                        unreadCounts: { ...c.unreadCounts, [user._id]: 0 },
                      }
                    : c
                )
              );
            })
            .catch((err) =>
              console.error("Error marking conversation as read", err)
            );
        }

        if (newMsg.sender === user._id) return;
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      if (activeChat?._id) {
        socket.emit("leaveRoom", activeChat._id);
      }
      socket.off("newMessage", handleNewMessage);
    };
  }, [activeChat, token, user]);

  const fetchConversations = async () => {
    setLoadingConvos(true);
    try {
      if (token) {
        const data = await getConversations(token);
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      if (token) {
        const data = await getUsers(token);
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchConversations();
    }
  }, [token]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading user...
      </div>
    );
  }
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        {userError || "No user is logged in."}
      </div>
    );
  }

  const filteredItems = searchTerm
    ? users.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  const handleConversationSelect = async (convo: any) => {
    setActiveChat(convo);

    // Close sidebar automatically on mobile when a conversation is selected
    setSidebarOpen(false);

    try {
      await markConversationAsRead({ conversationId: convo._id }, token);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === convo._id
            ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: 0 } }
            : c
        )
      );
    } catch (err) {
      console.error("Error marking conversation as read", err);
    }
  };

  const handleUserClick = async (clickedUser: any) => {
    if (!token) return;
    try {
      const res = await createConversation(
        { recipientId: clickedUser._id },
        token
      );
      setActiveChat(res.conversation);

      setSidebarOpen(false);

      const socket = socketRef.current;
      if (socket) {
        socket.emit("newConversation", {
          conversation: res.conversation,
          recipientId: clickedUser._id,
        });
      }
      fetchConversations();
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  const handleSendMessage = async (attachment?: {
    url: string;
    type: string;
    fileName?: string;
  }) => {
    if ((!messageText.trim() && !attachment) || !activeChat || !token) return;

    const payload: {
      conversationId: string;
      text?: string;
      attachment?: {
        url: string;
        type: string;
        fileName?: string;
      };
    } = {
      conversationId: activeChat._id,
    };

    if (attachment) {
      payload.attachment = attachment;
    }
    if (messageText.trim()) {
      payload.text = messageText.trim();
    }

    try {
      await sendMessage(payload, token);

      const newMsg = {
        sender: user._id,
        text: payload.text || "",
        createdAt: new Date().toISOString(),
        seen: false,
        conversationId: activeChat._id,
        attachment: payload.attachment || null,
      };

      setMessages((prev) => [...prev, newMsg]);

      if (socketRef.current) {
        const recipient = activeChat.participants.find(
          (p: any) => p._id !== user._id
        );
        socketRef.current.emit("sendMessage", {
          conversationId: activeChat._id,
          text: newMsg.text,
          sender: user._id,
          createdAt: newMsg.createdAt,
          recipientId: recipient?._id,
          attachment: newMsg.attachment,
        });
      }

      setMessageText("");

      // Refresh conversation list if needed
      if (token) {
        const data = await getConversations(token);
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getSenderName = (senderId: string) => {
    if (!activeChat?.participants) return "Unknown";
    const sender = activeChat.participants.find((p: any) => p._id === senderId);
    return sender ? sender.username : "Unknown";
  };

  const isCurrentUser = (senderId: string) => {
    return (
      getSenderName(senderId).toLowerCase() === user?.username.toLowerCase()
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-sm text-gray-800">
      {/* 
        A "hamburger" icon that appears only on small screens (md:hidden).
        Clicking it toggles the sidebar. 
      */}
      <button
        className="absolute top-24 left-0 z-10 md:hidden bg-white p-2 rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FiMenu size={20} />
      </button>

      {/* Sidebar: hidden on small screens unless `sidebarOpen` is true. */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block h-full z-20 bg-gray-50`}
      >
        <Sidebar
          staticAvatar={staticAvatar}
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredItems={filteredItems}
          loadingUsers={loadingUsers}
          loadingConvos={loadingConvos}
          handleUserClick={handleUserClick}
          handleConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col border-r border-gray-200">
        {activeChat ? (
          <>
            <ChatHeader
              activeChat={activeChat}
              staticAvatar={staticAvatar}
              user={user}
            />
            <ChatBox
              messages={messages}
              staticAvatar={staticAvatar}
              activeChat={activeChat}
              getSenderName={getSenderName}
              isCurrentUser={isCurrentUser}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              token={token}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-2">
            <div className="text-gray-500">
              No conversation selected. Please select a conversation or start a
              new chat.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
