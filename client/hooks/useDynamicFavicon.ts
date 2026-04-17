import { useEffect } from "react";

/**
 * Hook to dynamically update the browser favicon with a notification badge.
 * @param count - The number to display in the badge.
 */
export const useDynamicFavicon = (count: number) => {
  useEffect(() => {
    const updateFavicon = () => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      
      if (!favicon) {
        // If no favicon link exists, try to find the default one or create it
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = '/favicon.ico';
        document.head.appendChild(newFavicon);
      }

      const activeFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!activeFavicon) return;

      if (count <= 0) {
        activeFavicon.href = "/favicon.ico";
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      // Use the absolute path if possible, or relative to public
      img.src = "/favicon.ico";
      
      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, 32, 32);
        
        // Draw original favicon
        ctx.drawImage(img, 0, 0, 32, 32);

        // Badge settings
        const badgeRadius = 10;
        const badgeX = 32 - badgeRadius;
        const badgeY = badgeRadius;

        // Draw Badge Background
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "#FF3B30"; // iOS Red
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Badge Text
        ctx.fillStyle = "white";
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const displayText = count > 9 ? "9+" : count.toString();
        ctx.fillText(displayText, badgeX, badgeY + 1);

        activeFavicon.href = canvas.toDataURL("image/png");
      };
      
      img.onerror = () => {
        console.error("Failed to load favicon for badge update");
      };
    };

    updateFavicon();
  }, [count]);
};
