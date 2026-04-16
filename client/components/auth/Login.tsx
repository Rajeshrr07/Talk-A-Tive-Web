"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, LogIn, UserCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://talk-a-tive-web.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to login");

      setUser(data);
      router.push("/chat");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-600 text-sm font-medium ml-1">Email Address</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <Mail size={18} />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-6 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-600 text-sm font-medium ml-1">Password</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <Lock size={18} />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-6 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="cursor-pointer w-full bg-zinc-900 text-white hover:bg-zinc-800 py-6 rounded-xl font-bold text-base shadow-lg shadow-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2 ">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Logging in...
            </div>
          ) : (
            <div className="flex items-center gap-2 ">
              <LogIn size={20} />
              Login
            </div>
          )}
        </Button>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-zinc-400">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer bg-transparent border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 py-6 rounded-xl transition-all border-dashed"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("password123");
        }}
      >
        <div className="flex items-center gap-2">
          <UserCircle size={20} />
          Get Guest User Credentials
        </div>
      </Button>
    </form>
  );
}
