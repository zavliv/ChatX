"use client";
import axios from "axios";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  username: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refetchUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUser() {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await axios.get("/api/user/me", {
        headers: { Authorization: token },
      });

      console.log("res", res);

      setUser(res.data.user);
    } catch (err: any) {
      console.error("Error fetching current user:", err);
      setError(err.response?.data?.error || "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function refetchUser() {
    fetchUser();
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
