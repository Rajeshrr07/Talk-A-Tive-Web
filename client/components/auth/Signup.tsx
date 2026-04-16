"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all the fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://talk-a-tive-web.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to register");

      setUser(data);
      router.push("/chat");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-name" className="text-zinc-600 text-sm font-medium ml-1">Full Name</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <User size={18} />
          </div>
          <Input
            id="signup-name"
            placeholder="John Doe"
            className="pl-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-5 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-zinc-600 text-sm font-medium ml-1">Email Address</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <Mail size={18} />
          </div>
          <Input
            id="signup-email"
            type="email"
            placeholder="john@example.com"
            className="pl-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-5 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-zinc-600 text-sm font-medium ml-1">Password</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <Lock size={18} />
          </div>
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-5 transition-all"
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

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="text-zinc-600 text-sm font-medium ml-1">Confirm Password</Label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
            <Lock size={18} />
          </div>
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-0 rounded-xl py-5 transition-all"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="cursor-pointer w-full bg-zinc-900 text-white hover:bg-zinc-800 py-6 rounded-xl font-bold text-base shadow-lg shadow-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer">
              <UserPlus size={20} />
              Sign Up
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
