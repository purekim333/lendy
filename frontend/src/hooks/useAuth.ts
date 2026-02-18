import { useState, useEffect, useCallback } from "react";
import { fetchWithAccess } from "../util/fetchUtil";

interface AuthUser {
  username: string;
  nickname: string;
  email: string;
  role: string;
  social: boolean;
}

interface AuthState {
  isLoading: boolean;
  isAuthed: boolean;
  role: "ADMIN" | "USER" | "GUEST";
  user: AuthUser | null;
}

export function useAuth(): AuthState & { refresh: () => void } {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthed: false,
    role: "GUEST",
    user: null,
  });
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setState({ isLoading: false, isAuthed: false, role: "GUEST", user: null });
      return;
    }

    fetchWithAccess("/user")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: AuthUser) => {
        setState({
          isLoading: false,
          isAuthed: true,
          role: (data.role === "ADMIN" ? "ADMIN" : "USER") as "ADMIN" | "USER",
          user: data,
        });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setState({ isLoading: false, isAuthed: false, role: "GUEST", user: null });
      });
  }, [trigger]);

  return { ...state, refresh };
}
