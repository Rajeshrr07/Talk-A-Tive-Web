"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface SearchUsersProps {
  onSelectUser: (user: User) => void;
}

export default function SearchUsers({ onSelectUser }: SearchUsersProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://talk-a-tive-web.onrender.com/api/chats/search?search=${search}`,
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
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, user?.token]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin" />
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {searchResults.map((u) => (
          <div
            key={u._id}
            onClick={() => {
              onSelectUser(u);
              setSearch("");
              setSearchResults([]);
            }}
            className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={u.pic}
              alt={u.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-zinc-500 truncate">{u.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
