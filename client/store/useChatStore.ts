import { create } from "zustand";

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: any[];
  latestMessage?: any;
  groupAdmin?: any;
}

export interface Message {
  _id: string;
  sender: any;
  content: string;
  type?: "text" | "image" | "audio" | "file";
  fileUrl?: string;
  chat: Chat;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

interface ChatState {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateChatWithNewMessage: (message: Message) => void;
  notifications: Message[];
  setNotifications: (notifications: Message[]) => void;
  addNotification: (notification: Message) => void;
  removeNotification: (notificationId: string) => void;
  updateMessageStatus: (messageId: string, status: "sent" | "delivered" | "read") => void;
  markChatMessagesAsRead: (chatId: string, currentUserId?: string) => void;
  markSentMessagesAsRead: (chatId: string, readerId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  chats: [],
  setChats: (chats) => set({ chats }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateChatWithNewMessage: (message) => 
    set((state) => {
      const chatIndex = state.chats.findIndex((c) => c._id === message.chat._id);
      if (chatIndex !== -1) {
         // Existing chat found, update it and move to top
         const updatedChat = { ...state.chats[chatIndex], latestMessage: message };
         const updatedChats = [...state.chats];
         updatedChats.splice(chatIndex, 1);
         updatedChats.unshift(updatedChat);
         return { chats: updatedChats };
      } else {
         // New chat created entirely, add to top
         const newChat = { ...message.chat, latestMessage: message };
         return { chats: [newChat, ...state.chats] };
      }
    }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  removeNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n._id !== notificationId
      ),
    })),
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, status } : m
      ),
      chats: state.chats.map((chat) => 
        chat.latestMessage?._id === messageId 
          ? { ...chat, latestMessage: { ...chat.latestMessage, status } }
          : chat
      )
    })),
  markChatMessagesAsRead: (chatId, currentUserId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.chat._id === chatId && 
        m.status !== "read" && 
        (!currentUserId || m.sender._id !== currentUserId)
          ? { ...m, status: "read" } 
          : m
      ),
      chats: state.chats.map((chat) => 
        chat._id === chatId && 
        chat.latestMessage && 
        chat.latestMessage.status !== "read" &&
        (!currentUserId || chat.latestMessage.sender._id !== currentUserId)
          ? { ...chat, latestMessage: { ...chat.latestMessage, status: "read" } }
          : chat
      )
    })),
  markSentMessagesAsRead: (chatId, readerId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.chat._id === chatId && 
        m.status !== "read" && 
        m.sender._id !== readerId
          ? { ...m, status: "read" } 
          : m
      ),
      chats: state.chats.map((chat) => 
        chat._id === chatId && 
        chat.latestMessage && 
        chat.latestMessage.status !== "read" &&
        chat.latestMessage.sender._id !== readerId
          ? { ...chat, latestMessage: { ...chat.latestMessage, status: "read" } }
          : chat
      )
    })),
}));
