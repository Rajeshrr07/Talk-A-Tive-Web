import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  token: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Function to safely check localStorage
const getInitialUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (e) {
        console.error("Error parsing user info from local storage", e);
      }
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user));
      } else {
        localStorage.removeItem("userInfo");
      }
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userInfo");
    }
    set({ user: null });
  },
}));
