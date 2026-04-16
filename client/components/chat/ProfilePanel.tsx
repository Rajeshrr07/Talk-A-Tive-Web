"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Camera, Edit2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";

interface ProfilePanelProps {
  onBack: () => void;
}

export default function ProfilePanel({ onBack }: ProfilePanelProps) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21] animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="h-[108px] bg-[#008069] dark:bg-[#202c33] flex items-end px-6 pb-4 shrink-0 transition-colors">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="text-white hover:opacity-80 transition-opacity"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[19px] font-medium text-white mb-0.5">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Avatar Section */}
        <div className="flex justify-center py-8">
          <div className="relative group cursor-pointer">
            <div className="rounded-full overflow-hidden transition-all group-hover:opacity-100">
               <Avatar name={user?.name || "U"} size="xl" />
               {/* Hover Overlay */}
               {/* <div className="absolute inset-0 bg-[#3b4a54]/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[13px] uppercase font-bold text-center px-4 leading-tight">Change profile photo</span>
               </div> */}
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-white dark:bg-[#111b21] px-8 py-4 mb-3 shadow-sm border-b border-[#f0f2f5] dark:border-zinc-800/50">
          <label className="text-[14px] text-[#008069] dark:text-[#00a884] mb-3 block">Your name</label>
          <div className="flex items-center justify-between">
            <span className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db]">{user?.name}</span>
            {/* <button className="text-[#8696a0] hover:text-[#00a884] transition-colors">
              <Edit2 className="w-5 h-5" />
            </button> */}
          </div>
        </div>

        <div className="px-8 py-4 mb-4">
          <p className="text-[14px] text-[#8696a0] dark:text-[#8696a0] leading-snug">
            This is not your username or pin. This name will be visible to your Talk-A-Tive contacts.
          </p>
        </div>

        {/* Email Section (About) */}
        <div className="bg-white dark:bg-[#111b21] px-8 py-4 shadow-sm border-b border-[#f0f2f5] dark:border-zinc-800/50">
          <label className="text-[14px] text-[#008069] dark:text-[#00a884] mb-3 block">Email</label>
          <div className="flex items-center justify-between">
            <span className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db]">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
