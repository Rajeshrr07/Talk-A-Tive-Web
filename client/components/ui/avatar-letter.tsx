interface AvatarProps {
  name: string;
  pic?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
  xl: "w-24 h-24 text-3xl",
  "2xl": "w-52 h-52 text-6xl",
};

export function Avatar({
  name,
  pic,
  size = "md",
  className = "",
}: AvatarProps) {
  const firstLetter = (name || "U").charAt(0).toUpperCase();
  const bgColor = `hsl(${firstLetter.charCodeAt(0) * 137.5}, 70%, 60%)`;

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white overflow-hidden shrink-0 border-2 border-white dark:border-zinc-800 shadow-sm ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {pic ? (
        <img src={pic} alt={name} className="w-full h-full object-cover" />
      ) : (
        firstLetter
      )}
    </div>
  );
}
