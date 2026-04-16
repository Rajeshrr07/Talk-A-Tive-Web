"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import MyChats from "@/components/chat/MyChats";
import ChatBox from "@/components/chat/ChatBox";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user && window.localStorage.getItem("userInfo") === null) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="w-full h-screen bg-[#d1d7db] dark:bg-[#0a1014] flex flex-col font-sans relative overflow-hidden">
      {/* Top Green Background Strip for Desktop (visible only on ultra-wide or zoomed out) */}
      <div className="hidden 2xl:block absolute top-0 left-0 w-full h-[127px] bg-[#00a884] dark:bg-[#202c33] z-0"></div>
      
      {/* Main App Container */}
      <div className="relative z-10 w-full h-full max-w-[1600px] shadow-none border-none 2xl:shadow-[0_6px_18px_rgba(11,20,26,0.05)] bg-[#111b21] 2xl:h-[calc(100vh-38px)] 2xl:my-[19px] 2xl:mx-auto flex flex-1">
        
        {/* Left Sidebar Pane */}
        <div className="w-[30%] min-w-[340px] max-w-[420px] flex shrink-0 flex-col bg-white dark:bg-[#111b21] border-r border-[#d1d7db] dark:border-zinc-800/80">
          <MyChats />
        </div>

        {/* Right Application / Chat Pane */}
        <div className="flex flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden relative min-w-[400px]">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}

