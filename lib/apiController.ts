import axios from "axios";
import { encryptData, decryptData } from "@/lib/cryptoUtils";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function generateRegisterOtp(plainData: { email: string }) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post("/auth/generate-register-otp", {
    body: encryptedData,
  });
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function registerUser(plainData: {
  email: string;
  username: string;
  password: string;
  otp: string;
}) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post("/auth/register", {
    body: encryptedData,
  });
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function loginUser(plainData: {
  identifier: string;
  password: string;
}) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post("/auth/login", {
    body: encryptedData,
  });
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function getUsers(token: string) {
  const response = await apiClient.get("/chat/users", {
    headers: {
      Authorization: token,
    },
  });
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function getConversations(token: string) {
  const response = await apiClient.get("/chat/conversations", {
    headers: {
      Authorization: token,
    },
  });
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function createConversation(
  plainData: { recipientId: string },
  token: string
) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post(
    "/chat/conversation",
    { body: encryptedData },
    { headers: { Authorization: token } }
  );
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

// Updated sendMessage to accept an optional attachment object.
export async function sendMessage(
  plainData: {
    conversationId: string;
    text?: string;
    attachment?: { url: string; type: string; fileName?: string };
  },
  token: string
) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post(
    "/chat/message",
    { body: encryptedData },
    { headers: { Authorization: token } }
  );
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function getMessages(token: string, conversationId: string) {
  const response = await apiClient.get(
    `/chat/getMessages?conversationId=${conversationId}`,
    {
      headers: {
        Authorization: token,
      },
    }
  );
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}

export async function markConversationAsRead(
  plainData: { conversationId: string },
  token: string
) {
  const { encryptedData } = encryptData(JSON.stringify(plainData));
  const response = await apiClient.post(
    "/chat/read",
    { body: encryptedData },
    { headers: { Authorization: token } }
  );
  const decryptedString = decryptData(response.data.body);
  return JSON.parse(decryptedString);
}
