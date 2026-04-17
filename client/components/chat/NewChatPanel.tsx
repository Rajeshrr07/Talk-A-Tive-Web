"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";
import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface NewChatPanelProps {
  onBack: () => void;
  onSelectUser: (user: User) => void;
}

export default function NewChatPanel({ onBack, onSelectUser }: NewChatPanelProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Reusing the search logic from MyChats but in a dedicated panel
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="h-[108px] bg-[#008069] dark:bg-[#202c33] flex items-end px-6 pb-4 shrink-0 transition-colors">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="cursor-pointer text-white hover:opacity-80 transition-opacity"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[19px] font-medium text-white mb-0.5">New Chat</h1>
        </div>
      </div>

      {/* Search Input Area */}
      <div className="bg-white dark:bg-[#111b21] shrink-0 px-3 py-2 border-b border-[#f2f2f2] dark:border-zinc-800">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg h-[35px] relative overflow-hidden transition-all">
          {searchFocused ? (
            <button
              onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
              className="absolute left-0 top-0 bottom-0 px-4 text-[#00a884] items-center flex animate-in fade-in"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <div className="absolute left-0 top-0 bottom-0 px-4 text-[#54656f] dark:text-[#aebac1] items-center flex pointer-events-none">
              <Search className="w-[16px] h-[16px]" />
            </div>
          )}

          <input
            className="w-full h-full bg-transparent border-none outline-none text-[15px] text-[#111b21] dark:text-[#e9edef] placeholder-[#54656f] dark:placeholder-[#8696a0] pl-[52px]"
            placeholder="Search name or email"
            onFocus={() => setSearchFocused(true)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {searching ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
          </div>
        ) : searchQuery && searchResults.length > 0 ? (
          <div className="flex flex-col">
            <div className="py-4 px-8 text-[#00a884] text-[15px] bg-white dark:bg-[#111b21] uppercase font-medium">
              Contacts
            </div>
            {searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => onSelectUser(u)}
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
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center text-[#667781] text-[14px] mt-10 p-6">
            No contacts found
          </div>
        ) : (
          <div className="text-center text-[#667781] text-[14px] mt-10 p-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-center">
              <Search className="w-6 h-6 opacity-20" />
            </div>
            <p>Search for a user to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
