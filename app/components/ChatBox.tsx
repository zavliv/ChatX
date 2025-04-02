"use client";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { FiPaperclip, FiDownload } from "react-icons/fi";
import React, { useRef, useEffect, useState } from "react";

interface Attachment {
  url: string;
  type: string;
  fileName?: string;
}

interface ChatMessage {
  sender: string;
  text?: string;
  createdAt: string;
  attachment?: Attachment | null;
}

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

const DownloadButton: React.FC<{
  attachment: Attachment;
  className?: string;
}> = ({ attachment, className }) => (
  <a
    href={attachment.url}
    download={attachment.fileName}
    className={`bg-white p-1 rounded-full shadow hover:bg-gray-200 ${className}`}
    title="Download"
  >
    <FiDownload size={16} className="text-gray-700" />
  </a>
);

const AttachmentPreview: React.FC<{
  attachment: Attachment;
  pending?: boolean;
  onRemove?: () => void;
}> = ({ attachment, pending = false, onRemove }) => {
  console.log("pending", pending);
  console.log("onRemove", onRemove);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (attachment.type.startsWith("image/")) {
    return (
      <div className="relative">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}
        <img
          src={attachment.url}
          alt="Attachment Preview"
          className={`max-h-40 rounded transition-opacity duration-300 ${
            !imageLoaded ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <DownloadButton
          attachment={attachment}
          className="absolute bottom-1 right-1"
        />
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-gray-100 rounded">
          <span className="text-sm text-black">Document:</span>
        </div>
        <div>{attachment.fileName || "View Document"}</div>
        <DownloadButton attachment={attachment} />
      </div>
    );
  }
};

function ChatBox({
  messages,
  staticAvatar,
  activeChat,
  getSenderName,
  isCurrentUser,
  messageText,
  setMessageText,
  handleSendMessage,
  token,
}: {
  messages: ChatMessage[];
  staticAvatar: string;
  activeChat: any;
  getSenderName: (senderId: string) => string;
  isCurrentUser: (senderId: string) => boolean;
  messageText: string;
  setMessageText: (val: string) => void;
  handleSendMessage: (attachment?: Attachment) => void;
  token: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(
    null
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post("/api/chat/upload", formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.success) {
        const { fileUrl, fileName, contentType } = response.data;
        setPendingAttachment({ url: fileUrl, type: contentType, fileName });
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSendMessage = () => {
    if ((!messageText.trim() && !pendingAttachment) || !activeChat) return;
    // Pass the pending attachment (if any) to the send message handler.
    handleSendMessage(pendingAttachment || undefined);
    setMessageText("");
    setPendingAttachment(null);
  };

  return (
    <>
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => {
            const senderName = getSenderName(msg.sender);
            const senderIsCurrent = isCurrentUser(msg.sender);
            return (
              <div key={index} className="mb-2">
                <div
                  className={`flex items-end ${
                    senderIsCurrent ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Sender avatar on the left if not current user */}
                  {!senderIsCurrent && (
                    <img
                      src={staticAvatar}
                      alt={senderName}
                      className="w-10 h-10 rounded-full object-cover mr-2"
                    />
                  )}

                  {/* Message bubble */}
                  <div
                    className={`
                      // Adjust max widths with responsive classes:
                      max-w-[75%] sm:max-w-sm md:max-w-md
                      px-4 py-2 rounded-2xl
                      ${
                        senderIsCurrent
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none"
                      }
                      shadow-sm
                    `}
                  >
                    {/* Text content */}
                    {msg.text && (
                      <div className="whitespace-pre-wrap break-words">
                        {linkify(msg.text)}
                      </div>
                    )}

                    {/* Attachment preview (if any) */}
                    {msg.attachment?.url && (
                      <div className="mt-2">
                        <AttachmentPreview attachment={msg.attachment} />
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Sender avatar on the right if current user */}
                  {senderIsCurrent && (
                    <img
                      src={staticAvatar}
                      alt={senderName}
                      className="w-10 h-10 rounded-full object-cover ml-2"
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No messages. Start the conversation by sending a message.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment preview (if user is about to send one) */}
      {pendingAttachment && (
        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between">
          <AttachmentPreview attachment={pendingAttachment} pending />
          <button
            onClick={() => setPendingAttachment(null)}
            className="text-red-500 hover:text-red-700 ml-4"
          >
            Remove
          </button>
        </div>
      )}

      {/* Uploading state */}
      {uploading && (
        <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <span>Uploading attachment...</span>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 bg-white shadow-inner">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAttachmentClick}
            className="flex-shrink-0 hover:text-gray-700 focus:outline-none transition-colors text-white bg-purple-600 p-3 rounded cursor-pointer"
            disabled={uploading}
          >
            <FiPaperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full pl-4 pr-12 py-3 focus:outline-none border border-gray-300 rounded shadow-sm"
              disabled={uploading}
            />
            <button
              onClick={onSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-blue-700 text-white p-2 focus:outline-none transition-colors rounded cursor-pointer bg-purple-600"
              disabled={uploading}
            >
              <IoMdSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatBox;
