"use client";

import { useChatStore, Message } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useRef } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import {
  Loader2,
  Send,
  MoreVertical,
  Trash2,
  Plus,
  Paperclip,
  Search,
  Smile,
  Mic,
  ArrowLeft,
  Image as ImageIcon,
  File as FileIcon,
  X,
  Play,
  Pause,
  Clock
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";
import AddMembersModal from "./AddMembersModal";
import GroupInfoModal from "./GroupInfoModal";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

export default function ChatBox() {
  const { selectedChat, setSelectedChat, messages, setMessages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [messageMenu, setMessageMenu] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean | string>(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const { theme } = useTheme();

  // Multimedia Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
        await sendMultimediaMessage(audioBlob, "audio");
        stream.getTracks().forEach((track) => track.stop());
      };

      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.onstop = null; // Prevent sending
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendMultimediaMessage(file, type);
    // Reset input
    e.target.value = "";
  };

  const sendMultimediaMessage = async (file: File | Blob, type: "image" | "audio" | "file") => {
    if (!selectedChat || !user) return;
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

      // Send message with file URL
      const res = await fetch(`http://localhost:5000/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: type === "image" ? "📷 Photo" : type === "audio" ? "🎵 Voice Message" : `📄 ${file instanceof File ? file.name : "File"}`,
          chatId: selectedChat._id.toString(),
          type: type,
          fileUrl: uploadData.url,
        }),
      });

      const data = await res.json();
      addMessage(data);
      useChatStore.getState().updateChatWithNewMessage(data);
      getSocket().emit("new message", data);
    } catch (error) {
      console.error("Error uploading/sending multimedia:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const socket = initSocket();
      socket.connect();
      socket.emit("setup", user);
    }
  }, [user]);

  // Fetch Messages for selected chat
  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/messages/${selectedChat._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (res.status === 401) {
        useAuthStore.getState().logout();
        return;
      }

      const data = await res.json();
      setMessages(data);
      const socket = getSocket();
      socket.emit("join chat", selectedChat._id.toString());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsTyping(false);
    fetchMessages();
    
    // Mark messages as read when opening chat
    if (selectedChat && user) {
      const socket = getSocket();
      socket.emit("message read", {
        chatId: selectedChat._id,
        userId: user._id
      });
      useChatStore.getState().markChatMessagesAsRead(selectedChat._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Listen to new messages
  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (newMessageRecieved: Message) => {
      // Update chat list with the new message and bring active chat to top
      useChatStore.getState().updateChatWithNewMessage(newMessageRecieved);

      if (
        !selectedChat ||
        selectedChat._id.toString() !== newMessageRecieved.chat._id.toString()
      ) {
        useChatStore.getState().addNotification(newMessageRecieved);
        // Emit delivered if message is for us
        if (user && newMessageRecieved.sender._id !== user._id) {
            socket.emit("message delivered", {
                messageId: newMessageRecieved._id,
                chatId: newMessageRecieved.chat._id,
                senderId: newMessageRecieved.sender._id
            });
        }
      } else {
        addMessage(newMessageRecieved);
        // Emit read if we are in the chat
        if (user && newMessageRecieved.sender._id !== user._id) {
            socket.emit("message read", {
                messageId: newMessageRecieved._id,
                chatId: newMessageRecieved.chat._id,
                senderId: newMessageRecieved.sender._id
            });
        }
      }
    };

    const handleStatusUpdate = (data: { messageId: string, status: "sent" | "delivered" | "read" }) => {
      useChatStore.getState().updateMessageStatus(data.messageId, data.status);
    };

    const handleMessagesSeen = (data: { chatId: string, userId: string, status: string }) => {
       if (selectedChat && selectedChat._id === data.chatId) {
          useChatStore.getState().markChatMessagesAsRead(data.chatId);
       }
    };

    socket.on("message recieved", handleNewMessage);
    socket.on("message status update", handleStatusUpdate);
    socket.on("messages seen", handleMessagesSeen);

    return () => {
      socket.off("message recieved", handleNewMessage);
      socket.off("message status update", handleStatusUpdate);
      socket.off("messages seen", handleMessagesSeen);
    };
  }, [selectedChat, addMessage, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!selectedChat) return;
    const socket = getSocket();

    if (!typingRef.current) {
      socket.emit("typing", { room: selectedChat._id, userName: user?.name });
    }

    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    typingRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      typingRef.current = null;
    }, 800);
  };

  useEffect(() => {
    const socket = getSocket();
    const handleTypingEvent = (userName?: string) => setIsTyping(userName ? userName : true);
    const handleStopTypingEvent = () => setIsTyping(false);

    socket.on("typing", handleTypingEvent);
    socket.on("stop typing", handleStopTypingEvent);

    return () => {
      socket.off("typing", handleTypingEvent);
      socket.off("stop typing", handleStopTypingEvent);
    };
  }, []);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const contentStr = newMessage;
      setNewMessage("");
      const res = await fetch(`http://localhost:5000/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: contentStr,
          chatId: selectedChat._id.toString(),
        }),
      });
      const data = await res.json();

      // Update local state
      addMessage(data);
      useChatStore.getState().updateChatWithNewMessage(data);

      const socket = getSocket();
      socket.emit("new message", data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (res.ok) {
        setMessages(messages.filter((m) => m._id !== messageId));
      }
    } catch (error) {
      console.error(error);
    }
    setMessageMenu(null);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    // Move cursor logic could be added here if needed
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#f0f2f5] dark:bg-[#222e35] relative">
      {selectedChat ? (
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="h-[59px] shrink-0 border-b border-[#d1d7db] dark:border-zinc-800 flex items-center justify-between px-4 bg-[#f0f2f5] dark:bg-[#202c33]">
            <div 
              className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => {
                if (selectedChat.isGroupChat) {
                  setShowGroupInfo(true);
                }
              }}
            >
              <Avatar
                name={
                  !selectedChat.isGroupChat
                    ? selectedChat.users.find(
                      (u) => u._id.toString() !== user?._id
                    )?.name || "User"
                    : selectedChat.chatName
                }
                size="md"
              />
              <div className="flex flex-col">
                <span className="text-[16px] text-zinc-900 dark:text-[#e9edef]">
                  {!selectedChat.isGroupChat
                    ? selectedChat.users.find(
                      (u) => u._id.toString() !== user?._id
                    )?.name || "User"
                    : selectedChat.chatName}
                </span>
                <span className="text-[13px] text-[#667781] dark:text-[#8696a0]">
                  {!selectedChat.isGroupChat
                    ? isTyping ? <span className="text-[#00a884]">typing...</span> : "click here for contact info"
                    : isTyping ? <span className="text-[#00a884]">{typeof isTyping === 'string' ? `${isTyping} is typing...` : 'typing...'}</span> : `${selectedChat.users.length} members`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              {selectedChat.isGroupChat &&
                (selectedChat.groupAdmin?._id || selectedChat.groupAdmin)?.toString() === user?._id && (
                  <button
                    onClick={() => setShowAddMembers(true)}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                    title="Add members"
                  >
                    <Plus className="w-[20px] h-[20px]" />
                  </button>
                )}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Search"
              >
                <Search className="w-[20px] h-[20px]" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none cursor-pointer">
                  <MoreVertical className="w-[20px] h-[20px]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#233138] border-none shadow-lg mt-1 py-2">
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedChat(null);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="cursor-pointer text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] rounded-none py-3 px-6 text-[14px]"
                  >
                    Close chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Area */}
          {showSearch && (
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#d1d7db] dark:border-zinc-800 px-4 py-2 shrink-0 z-10 transition-all flex items-center shadow-sm">
              <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-lg h-[35px] relative overflow-hidden transition-all">
                <button 
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                  className="absolute left-0 top-0 bottom-0 px-4 text-[#54656f] dark:text-[#aebac1] hover:text-[#00a884] items-center flex transition-colors"
                  title="Close search"
                >
                  <ArrowLeft className="w-[20px] h-[20px]" />
                </button>
                <input 
                  className={`w-full h-full bg-transparent border-none outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder-[#54656f] dark:placeholder-[#8696a0] pl-[52px]`}
                  placeholder="Search messages..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Messages Area - WhatsApp Pattern Background */}
          {/* The background uses a subtle CSS pattern. For an exact match, WhatsApp uses an image pattern. We use a CSS pseudo-element or simple color based on theme. */}
          <div className="flex-1 overflow-y-auto px-[5%] py-4 bg-[#efeae2] dark:bg-[#0b141a] custom-scrollbar relative z-0" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QMeFtXb0.webp')", opacity: 0.9 }}>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
              </div>
            ) : messages.length > 0 ? (
              <div className="flex flex-col space-y-1">
                {messages
                  .filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((m, i, filteredMessages) => {
                  const isMyMsg = m.sender._id.toString() === user?._id;
                  const isFirstMessageBySender = i === 0 || filteredMessages[i - 1].sender._id.toString() !== m.sender._id.toString();

                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMyMsg ? "justify-end" : "justify-start"} ${isFirstMessageBySender ? 'mt-2' : 'mt-0.5'}`}
                    >
                      <div
                        className={`flex flex-col group relative max-w-[65%]`}
                      >
                        {/* Message Bubble */}
                        <div
                          className={`rounded-lg min-h-12 max-auto px-2 pt-1.5 pb-2 shadow-sm text-[14.2px] leading-snug wrap-break-word whitespace-normal relative ${isMyMsg
                            ? `bg-[#dcf8c6] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] ${isFirstMessageBySender ? 'rounded-tr-none' : ''}`
                            : `bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] ${isFirstMessageBySender ? 'rounded-tl-none' : ''}`
                            }`}
                        >
                          {/* Tails */}
                          {/* {isFirstMessageBySender && isMyMsg && (
                            <span className="absolute top-0 right-[-8px] block w-[8px] h-[13px] text-[#dcf8c6] dark:text-[#005c4b]">
                              <svg viewBox="0 0 8 13" width="8" height="13" className="">
                                <path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"></path>
                              </svg>
                            </span>
                          )} */}
                          {/* {isFirstMessageBySender && !isMyMsg && (
                            <span className="absolute top-0 left-[-8px] block w-[8px] h-[13px] text-white dark:text-[#202c33]">
                              <svg viewBox="0 0 8 13" width="8" height="13" className="">
                                <path fill="currentColor" d="M6.467 2.568L0 11.193V0h5.188c1.77 0 2.338 1.156 1.279 2.568z"></path>
                              </svg>
                            </span>
                          )} */}

                          {selectedChat.isGroupChat && !isMyMsg && isFirstMessageBySender && (
                            <p className="text-[12.5px] font-medium text-[#1fa855] dark:text-[#53bdeb] mb-1 px-1">
                              {m.sender.name}
                            </p>
                          )}

                          {/* Multimedia Content Rendering */}
                          {m.type === "image" ? (
                             <div className="mb-1 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 cursor-pointer hover:opacity-95 transition-opacity">
                                <img 
                                  src={m.fileUrl} 
                                  alt="Sent image" 
                                  className="max-h-[300px] w-full object-cover"
                                  onClick={() => window.open(m.fileUrl, '_blank')}
                                />
                                {m.content && m.content !== "📷 Photo" && (
                                  <p className="px-1 py-1.5 text-[14.2px]">{m.content}</p>
                                )}
                             </div>
                          ) : m.type === "audio" ? (
                             <div className="mb-1 py-2 px-1 min-w-[240px]">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-[#53bdeb]/10 flex items-center justify-center text-[#53bdeb] transition-transform hover:scale-110 cursor-pointer">
                                      <Mic className="w-5 h-5" />
                                   </div>
                                   <audio controls className="h-8 w-full max-w-[200px] custom-audio">
                                      <source src={m.fileUrl} type="audio/mpeg" />
                                   </audio>
                                </div>
                             </div>
                          ) : m.type === "file" ? (
                             <div 
                                onClick={() => window.open(m.fileUrl, '_blank')}
                                className="mb-2 flex items-center gap-3 p-3 rounded-lg bg-[#0000000a] dark:bg-[#ffffff0a] cursor-pointer hover:bg-[#00000015] dark:hover:bg-[#ffffff15] transition-colors"
                             >
                                <div className="w-10 h-10 rounded-lg bg-[#5f66cd] flex items-center justify-center text-white shrink-0">
                                   <FileIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="truncate text-[14px] font-medium">Message Attachment</p>
                                   <p className="text-[12px] opacity-70 uppercase">File</p>
                                </div>
                             </div>
                          ) : (
                            <span className="break-words mr-10">{m.content}</span>
                          )}

                          <div className={`absolute right-1.5 bottom-1 flex items-center justify-end gap-[3px] ${m.type === 'image' && !m.content?.includes('📷') ? 'bg-black/30 px-1.5 py-0.5 rounded-full text-white' : ''}`}>
                            <span
                              className={`text-[11px] font-medium  ${isMyMsg
                                ? "text-[#667781] dark:text-[#ffffff99]"
                                : "text-[#667781] dark:text-[#8696a0]"
                                }`}
                            >
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMyMsg && (
                              <span className={`text-[15px] -mt-[3px] flex items-center ${m.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0] dark:text-[#ffffff99]'}`}>
                                {m.status === "sent" ? (
                                  <span title="Sent">✓</span>
                                ) : (
                                  <span title={m.status === 'read' ? "Read" : "Delivered"}>✓✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu context overlay on hover */}
                        {isMyMsg && (
                          <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setMessageMenu(
                                    messageMenu === m._id ? null : m._id
                                  )
                                }
                                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 bg-white/50 rounded-full cursor-pointer"
                              >
                                <svg viewBox="0 0 19 20" width="19" height="20" className=""><path fill="currentColor" d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
                              </button>
                              {messageMenu === m._id && (
                                <div className="absolute top-full right-0 bg-white dark:bg-[#233138] rounded-md shadow-lg border border-transparent mt-2 z-10 py-2 w-32">
                                  <button
                                    onClick={() => handleDeleteMessage(m._id)}
                                    className="flex items-center w-full px-4 py-2 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] text-[14.5px] text-[#3b4a54] dark:text-[#d1d7db]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-[#667781] dark:text-zinc-500 text-sm flex flex-col items-center justify-center h-full opacity-60">
                <p className="bg-[#ffeecd] px-3 py-1 rounded-lg text-zinc-900 shadow-sm">Start a conversation via Talk-A-Tive Web end-to-end encryption</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="min-h-[62px] border-t border-[#d1d7db] dark:border-zinc-800 px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between z-10 shrink-0">
            {isRecording ? (
               <div className="flex-1 flex items-center justify-between animate-in slide-in-from-right duration-300">
                  <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3 bg-white dark:bg-[#2a3942] rounded-full px-6 py-2 flex-1 mx-4 shadow-sm border border-[#d1d7db] dark:border-zinc-800">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[15px] font-medium text-zinc-700 dark:text-[#e9edef] min-w-[45px]">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-1 bg-[#d1d7db] dark:bg-zinc-700 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 animate-pulse" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <button onClick={stopRecording} className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#008f72] transition-colors shadow-md">
                    <Send className="w-6 h-6 rotate-[-45deg] translate-x-0.5" />
                  </button>
               </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-[#54656f] dark:text-[#aebac1] relative">
                  <button 
                    type="button" 
                    className={`p-1 transition-colors ${isEmojiPickerOpen ? "text-[#00a884]" : "hover:text-zinc-900 dark:hover:bg-zinc-800"}`}
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  >
                    <Smile className="w-[26px] h-[26px]" />
                  </button>
                  {isEmojiPickerOpen && (
                    <div className="absolute bottom-14 left-0 z-50 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="fixed inset-0" onClick={() => setIsEmojiPickerOpen(false)} />
                      <div className="relative">
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                          autoFocusSearch={false}
                          width={350}
                          height={400}
                        />
                      </div>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors outline-none cursor-pointer">
                      <Plus className="w-[26px] h-[26px] transition-transform hover:rotate-90" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-48 bg-white dark:bg-[#233138] border-none shadow-xl mb-2 py-2 rounded-xl scale-in-center">
                      <DropdownMenuItem 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] py-3 px-6 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#bf59cf] flex items-center justify-center text-white">
                           <ImageIcon className="w-4 h-4" />
                        </div>
                        Photos & Videos
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => docInputRef.current?.click()}
                        className="cursor-pointer text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] py-3 px-6 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#5f66cd] flex items-center justify-center text-white">
                           <FileIcon className="w-4 h-4" />
                        </div>
                        Document
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Hidden Inputs */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*,video/*" 
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                  <input 
                    type="file" 
                    ref={docInputRef} 
                    hidden 
                    accept=".pdf,.doc,.docx,.txt" 
                    onChange={(e) => handleFileUpload(e, "file")}
                  />
                </div>

                <form
                  onSubmit={sendMessage}
                  className="flex-1 mx-3 flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      className="w-full bg-white dark:bg-[#2a3942] rounded-lg px-4 py-[9px] outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder:text-[#8696a0]"
                      placeholder="Type a message"
                    />
                    {isUploading && (
                       <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#00a884]" />
                       </div>
                    )}
                  </div>
                </form>

                <div className="flex items-center text-[#54656f] dark:text-[#aebac1]">
                  {newMessage.trim() ? (
                    <button
                      type="submit"
                      onClick={(e) => sendMessage(e as any)}
                      className="p-1 text-[#00a884] transition-colors"
                    >
                      <Send className="w-[24px] h-[24px] rotate-[-45deg] translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="p-1 hover:text-red-500 transition-colors"
                      title="Hold to record"
                    >
                      <Mic className="w-[24px] h-[24px]" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#f0f2f5] dark:bg-[#222e35] border-b-[6px] border-[#00a884]">
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center mb-10">
              <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669aeRfKI.png" alt="WhatsApp Web" className="w-[320px] object-contain opacity-80 dark:opacity-60" onError={(e) => {
                // Fallback icon if image fails
                (e.target as any).style.display = 'none';
              }} />
              <div className="w-[320px] h-[200px] bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center empty-state-fallback hidden">
                <span className="text-6xl">💬</span>
              </div>
            </div>
            <h1 className="text-[32px] font-light text-[#41525d] dark:text-[#e9edef]">Talk-A-Tive Web</h1>
            <p className="text-[14px] text-[#667781] dark:text-[#8696a0] leading-[20px]">
              Send and receive messages without keeping your phone online.<br />
              Use Talk-A-Tive on up to 4 linked devices and 1 phone at the same time.
            </p>
      
          </div>
        </div>
      )}

      {selectedChat && selectedChat.isGroupChat && (
        <>
          <AddMembersModal
            isOpen={showAddMembers}
            onClose={() => setShowAddMembers(false)}
            chatId={selectedChat._id}
            currentMembers={selectedChat.users}
            onMembersAdded={handleRefresh}
          />
          <GroupInfoModal
            isOpen={showGroupInfo}
            onClose={() => setShowGroupInfo(false)}
            chatName={selectedChat.chatName}
            members={selectedChat.users}
            groupAdminId={(selectedChat.groupAdmin?._id || selectedChat.groupAdmin)?.toString() || undefined}
          />
        </>
      )}
    </div>
  );
}
