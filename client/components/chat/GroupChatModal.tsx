"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import SearchUsers from "./SearchUsers";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupChatModal({
  isOpen,
  onClose,
}: GroupChatModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { setChats, chats } = useChatStore();

  const handleSelectUser = (newUser: User) => {
    if (!selectedUsers.find((u) => u._id === newUser._id)) {
      setSelectedUsers([...selectedUsers, newUser]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      alert("Please enter a group name and select at least 1 user");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://talk-a-tive-web.onrender.com/api/chats/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : data || "Failed to create group"
        );
      }

      const newChat = data;
      setChats([newChat, ...chats]);

      setGroupName("");
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Group creation error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error creating group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg max-w-md w-full space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create Group Chat</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Input
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={loading}
        />

        <SearchUsers onSelectUser={handleSelectUser} />

        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Selected users ({selectedUsers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-sm"
                >
                  <span>{u.name}</span>
                  <button
                    onClick={() => handleRemoveUser(u._id)}
                    disabled={loading}
                    className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={
              loading || !groupName.trim() || selectedUsers.length === 0
            }
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
