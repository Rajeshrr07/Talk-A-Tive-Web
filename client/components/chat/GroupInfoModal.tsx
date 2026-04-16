"use client";

import { X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
}

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  members: User[];
  groupAdminId?: string;
}

export default function GroupInfoModal({
  isOpen,
  onClose,
  chatName,
  members,
  groupAdminId,
}: GroupInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg max-w-md w-full space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Group Info</h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="transform scale-150 mb-4">
            <Avatar name={chatName} size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{chatName}</h3>
          <p className="text-sm text-zinc-500 mt-1">Group · {members.length} members</p>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pt-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Participants
          </h4>
          <div className="space-y-1">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <div className="flex items-center gap-3 w-full min-w-0">
                  <Avatar name={member.name} size="md" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{member.name}</span>
                    <span className="text-xs text-zinc-500 truncate">{member.email}</span>
                  </div>
                  {groupAdminId === member._id && (
                    <span className="shrink-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 rounded-full font-semibold border border-green-200 dark:border-green-800/50">
                      Group Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
