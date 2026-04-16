"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Bell,
  Lock,
  Shield,
  Laptop,
  HelpCircle,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar-letter";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SettingsPanelProps {
  onBack: () => void;
  onProfileClick: () => void;
}

export default function SettingsPanel({ onBack, onProfileClick }: SettingsPanelProps) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // const menuItems = [
  //   { icon: <Bell className="w-5 h-5" />, title: "Notifications", subtitle: "Messages, group & call tones" },
  //   { icon: <Shield className="w-5 h-5" />, title: "Privacy", subtitle: "Last seen, profile photo, groups" },
  //   { icon: <Lock className="w-5 h-5" />, title: "Security", subtitle: "Security notifications, two-step verification" },
  //   { icon: <HelpCircle className="w-5 h-5" />, title: "Help", subtitle: "Help centre, contact us, privacy policy" },
  // ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] animate-in slide-in-from-left duration-300">
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
          <h1 className="text-[19px] font-medium text-white mb-0.5">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* User Mini Profile */}
        <div
          onClick={onProfileClick}
          className="flex items-center h-[112px] px-6 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors border-b border-[#f0f2f5] dark:border-zinc-800/50"
        >
          <div className="mr-5 h-[82px] w-[82px] flex items-center justify-center">
            <Avatar name={user?.name || "U"} size="xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[19px] text-[#111b21] dark:text-[#e9edef] truncate">{user?.name}</h2>
            <p className="text-[14px] text-[#667781] dark:text-[#8696a0] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="py-2">
          {/* {menuItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center px-6 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors"
            >
              <div className="mr-6 text-[#8696a0] dark:text-[#8696a0]">
                {item.icon}
              </div>
              <div className="flex-1 border-b border-[#f0f2f5] dark:border-zinc-800/50 pb-4">
                <h3 className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db]">{item.title}</h3>
                <p className="text-[14px] text-[#667781] dark:text-[#8696a0] truncate">{item.subtitle}</p>
              </div>
            </div>
          ))} */}

          {/* Theme Toggle */}
          {mounted && (
            <div
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center px-6 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors"
            >
              <div className="mr-6 text-[#8696a0] dark:text-[#8696a0]">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div className="flex-1 border-b border-[#f0f2f5] dark:border-zinc-800/50 pb-4">
                <h3 className="text-[17px] text-[#3b4a54] dark:text-[#d1d7db]">Theme</h3>
                <p className="text-[14px] text-[#667781] dark:text-[#8696a0] truncate">
                  {theme === 'dark' ? 'Dark' : 'Light'} mode enabled
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <div
            onClick={handleLogout}
            className="flex items-center px-6 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors group"
          >
            <div className="mr-6 text-[#ef4444] opacity-80 group-hover:opacity-100">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 pb-4">
              <h3 className="text-[17px] text-[#ef4444]">Logout</h3>
              <p className="text-[14px] text-[#8696a0] dark:text-[#8696a0]">Finish your session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
