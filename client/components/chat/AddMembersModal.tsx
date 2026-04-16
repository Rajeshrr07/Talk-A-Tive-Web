"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchUsers from "./SearchUsers";
import { Avatar } from "@/components/ui/avatar-letter";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  currentMembers: User[];
  onMembersAdded: () => void;
}

export default function AddMembersModal({
  isOpen,
  onClose,
  chatId,
  currentMembers,
  onMembersAdded,
}: AddMembersModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSelectUser = (newUser: User) => {
    // Don't allow adding users already in the group
    if (
      !currentMembers.find((m) => m._id === newUser._id) &&
      !selectedUsers.find((u) => u._id === newUser._id)
    ) {
      setSelectedUsers([...selectedUsers, newUser]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least 1 user");
      return;
    }

    try {
      setLoading(true);

      for (const selectedUser of selectedUsers) {
        const res = await fetch("http://localhost:5000/api/chats/groupadd", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            chatId,
            userId: selectedUser._id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to add member");
        }
      }

      onMembersAdded();
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error adding members");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg max-w-md w-full space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add Members</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            onClick={handleAddMembers}
            disabled={loading || selectedUsers.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Members"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
