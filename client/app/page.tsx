"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  if (!mounted) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
      {/* Mesh Gradient Background (Light) */}
      <div className="absolute inset-0 -z-10 bg-zinc-50">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 mb-2 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-700">
            Talk-A-Tive
          </h1>
          <p className="text-zinc-500 font-medium text-lg">
            Connect with friends in real-time.
          </p>
        </div>

        <Card className="glass border-white shadow-2xl overflow-hidden">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-bold text-zinc-900">Welcome Back</CardTitle>
            <CardDescription className="text-zinc-500">Sign in to your account or create a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100/80 p-1 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-0 ring-offset-0 focus-visible:ring-0">
                <Login />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 ring-offset-0 focus-visible:ring-0">
                <Signup />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
