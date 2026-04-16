"use client";

import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreVertical, MessageSquareText, Search, Users, ArrowLeft, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";
import GroupChatModal from "./GroupChatModal";
import ProfilePanel from "./ProfilePanel";
import SettingsPanel from "./SettingsPanel";
import NewChatPanel from "./NewChatPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

export default function MyChats() {
  const { selectedChat, setSelectedChat, chats, setChats } = useChatStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Search state
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  // Panel state
  const [activePanel, setActivePanel] = useState<"chats" | "profile" | "settings" | "new-chat">("chats");

  const fetchChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch("https://talk-a-tive-web.onrender.com/api/chats", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `https://talk-a-tive-web.onrender.com/api/chats/search?search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.token]);

  const handleSelectUserForChat = async (selectedUser: User) => {
    if (!user) return;

    try {
      const res = await fetch("https://talk-a-tive-web.onrender.com/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: selectedUser._id }),
      });

      const data = await res.json();

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setSearchFocused(false);
      setSearchQuery("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#111b21] overflow-hidden">
      {/* WhatsApp Left Header */}
      <div className="h-[59px] shrink-0 flex items-center justify-between px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b-none shadow-[0_1px_3px_rgba(11,20,26,0.05)] dark:shadow-none z-10">
        <div className="flex items-center cursor-pointer">
          <Avatar name={user?.name || "U"} size="md" />
        </div>

        <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
          <button
            onClick={() => setShowGroupModal(true)}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="New Group"
          >
            <Users className="w-[20px] h-[20px]" />
          </button>
          <button
            onClick={() => setActivePanel("new-chat")}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="New Chat"
          >
            <MessageSquareText className="w-[20px] h-[20px]" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer">
              <MoreVertical className="w-[20px] h-[20px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#233138] border-none shadow-lg mt-1 py-1">
              <DropdownMenuItem
                onClick={() => setActivePanel("profile")}
                className="cursor-pointer text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] rounded-none py-3 px-6 text-sm"
              >
                <UserIcon className="w-4 h-4 mr-3 opacity-70" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActivePanel("settings")}
                className="cursor-pointer text-[#3b4a54] dark:text-[#d1d7db] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] rounded-none py-3 px-6 text-sm"
              >
                <SettingsIcon className="w-4 h-4 mr-3 opacity-70" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] rounded-none py-3 px-6 text-sm">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {activePanel === "profile" ? (
        <ProfilePanel onBack={() => setActivePanel("chats")} />
      ) : activePanel === "settings" ? (
        <SettingsPanel
          onBack={() => setActivePanel("chats")}
          onProfileClick={() => setActivePanel("profile")}
        />
      ) : activePanel === "new-chat" ? (
        <NewChatPanel
          onBack={() => setActivePanel("chats")}
          onSelectUser={(user) => {
            handleSelectUserForChat(user);
            setActivePanel("chats");
          }}
        />
      ) : (
        <>
          {/* WhatsApp Search Bar Area */}
          <div className="bg-white dark:bg-[#111b21] border-b border-[#f2f2f2] dark:border-zinc-800 shrink-0 z-0 transition-all">
            <div className="px-3 py-2 flex items-center h-[49px]">
              <div className="flex-1 flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg h-[35px] relative overflow-hidden transition-all">
                {searchFocused ? (
                  <button
                    onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                    className="absolute left-0 top-0 bottom-0 px-4 text-[#00a884] items-center flex animate-in fade-in"
                  >
                    <ArrowLeft className="w-[20px] h-[20px]" />
                  </button>
                ) : (
                  <div className="absolute left-0 top-0 bottom-0 px-4 text-[#54656f] dark:text-[#aebac1] items-center flex pointer-events-none">
                    <Search className="w-[18px] h-[18px]" />
                  </div>
                )}

                <input
                  className={`w-full h-full bg-transparent border-none outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder-[#54656f] dark:placeholder-[#8696a0] ${searchFocused ? 'pl-[52px]' : 'pl-[52px]'}`}
                  placeholder="Search or start new chat"
                  onFocus={() => setSearchFocused(true)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Chat List */}
          <div className="flex flex-col flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar">
            {loading || searching ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
              </div>
            ) : searchFocused && searchQuery ? (
              // Search Results View
              <div className="flex flex-col">
                <div className="py-4 px-8 text-[#00a884] text-[15px] bg-white dark:bg-[#111b21]">
                  Contacts
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => handleSelectUserForChat(u)}
                      className="cursor-pointer flex items-center pr-4 pl-3 py-0 transition-colors h-[72px] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] bg-white dark:bg-[#111b21]"
                    >
                      <div className="mr-3 shrink-0 px-[2px]">
                        <Avatar name={u.name} size="lg" />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-[#f2f2f2] dark:border-zinc-800/80 h-full flex flex-col justify-center pr-2">
                        <p className="truncate text-[17px] text-[#111b21] dark:text-[#e9edef]">
                          {u.name}
                        </p>
                        <p className="text-[14px] text-[#667781] dark:text-[#8696a0] truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#667781] text-[14px] mt-10 p-6">
                    No chats, contacts or messages found
                  </div>
                )}
              </div>
            ) : (
              // Default Chat List
              chats.length > 0 ? (
                chats.map((chat) => {
                  const isActive = selectedChat?._id?.toString() === chat._id.toString();
                  const state = useChatStore.getState();
                  const unreadCount = state.notifications.filter((n) => n.chat._id === chat._id).length;
                  return (
                    <div
                      key={chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        state.setNotifications(state.notifications.filter((n) => n.chat._id !== chat._id));
                      }}
                      className={`cursor-pointer flex items-center pr-4 pl-3 py-0 transition-colors h-[72px] ${isActive
                        ? "bg-[#f0f2f5] dark:bg-[#202c33]"
                        : "bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]"
                        }`}
                    >
                      <div className="mr-3 shrink-0 px-[2px]">
                        <Avatar
                          name={
                            !chat.isGroupChat
                              ? chat.users.find((u) => u._id !== user?._id)?.name || "User"
                              : chat.chatName
                          }
                          size="lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-[#f2f2f2] dark:border-zinc-800/80 h-full flex flex-col justify-center pr-2">
                        <div className="flex justify-between items-center mb-[2px]">
                          <p className={`truncate text-[17px] ${isActive ? "text-[#111b21] dark:text-[#e9edef] font-medium" : "text-[#111b21] dark:text-[#e9edef]"}`}>
                            {!chat.isGroupChat
                              ? chat.users.find((u) => u._id.toString() !== user?._id)?.name || "User"
                              : chat.chatName}
                          </p>
                          {chat.latestMessage && (
                            <span className={`text-[12px] mt-1 mx-1 ${unreadCount > 0 ? "text-[#00a884]" : (isActive ? "text-[#111b21] dark:text-[#e9edef]" : "text-[#667781] dark:text-[#8696a0]")}`}>
                              {new Date(chat.latestMessage.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-[14px] truncate leading-5 ${unreadCount > 0 ? "text-[#111b21] dark:text-[#e9edef] font-medium" : "text-[#667781] dark:text-[#8696a0]"}`}>
                            {chat.latestMessage && (
                              <>
                                {chat.latestMessage.sender._id === user?._id && (
                                  <span className={`mr-1 inline-block text-[15px] font-bold ${chat.latestMessage.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0] dark:text-[#8696a0]'}`}>
                                    {chat.latestMessage.status === "sent" ? "✓" : "✓✓"}
                                  </span>
                                )}
                                <span className={`${chat.latestMessage.sender._id !== user?._id ? "font-medium" : ""}`}>
                                  {chat.latestMessage.sender._id !== user?._id && chat.isGroupChat && (
                                    <span className="mr-1">{chat.latestMessage.sender.name}:</span>
                                  )}
                                  {chat.latestMessage.content}
                                </span>
                              </>
                            )}
                          </p>
                          {unreadCount > 0 && (
                            <div className="bg-[#00a884] shrink-0 text-white text-[11px] font-bold px-[6px] py-[1px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center ml-2">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-[#667781] text-sm mt-10 p-6">
                  <p className="mb-2">No chats to show</p>
                </div>
              )
            )}
          </div>
        </>

      )}

      <GroupChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </div>
  );
}
