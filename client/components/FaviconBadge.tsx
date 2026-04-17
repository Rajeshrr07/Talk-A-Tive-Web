"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";

export const useDynamicFavicon = (count: number) => {
  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    if (!favicon) return;

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Ensure the original favicon path is correct. User specified /favicon.png
    img.src = "/favicon.png"; 

    img.onload = () => {
      ctx?.clearRect(0, 0, 64, 64);
      ctx?.drawImage(img, 0, 0, 64, 64);

      if (count > 0) {
        // 🔴 badge background
        ctx!.fillStyle = "#ff3b30";
        ctx!.beginPath();
        ctx!.arc(48, 16, 12, 0, Math.PI * 2);
        ctx!.fill();

        // 🔢 count text
        ctx!.fillStyle = "#fff";
        ctx!.font = "bold 14px sans-serif";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(count > 9 ? "9+" : String(count), 48, 16);
      }

      favicon.href = canvas.toDataURL("image/png");
    };

    // 🧠 Update tab title (WhatsApp style)
    if (count > 0) {
      document.title = `(${count}) Talk-a-tive`;
    } else {
      document.title = "Talk-a-tive";
    }
  }, [count]);
};

/**
 * Component that synchronizes the application's notification state
 * with the browser's favicon badge and tab title.
 */
export const FaviconBadge = () => {
  const notifications = useChatStore((state) => state.notifications);
  
  // Calculate the number of unique chats that have unread notifications
  const chatCount = new Set(notifications.map((notification) => notification.chat._id)).size;

  // Update the favicon and title dynamically
  useDynamicFavicon(chatCount);

  return null;
};