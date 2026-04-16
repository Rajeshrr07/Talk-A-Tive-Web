"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function SideDrawer() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const logoutHandler = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 w-full p-2 px-4 shadow-sm border-b border-zinc-200 dark:border-zinc-800 h-16">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 group">
          <Search className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Search User</span>
        </Button>
      </div>
      
      <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hidden sm:block">
        Talk-A-Tive
      </div>
      
      <div className="flex items-center gap-1 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-purple-600">
          <Bell className="h-5 w-5" />
          {/* Notification Badge Example */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full cursor-pointer focus-visible:ring-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.pic || ""} alt={user?.name} />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950" onClick={logoutHandler}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
