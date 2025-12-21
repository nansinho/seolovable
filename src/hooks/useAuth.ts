import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBlockedUserCheck } from "./useBlockedUserCheck";

interface AuthState {
  userId: string | null;
  userEmail: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (redirectToAuth = true) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    userId: null,
    userEmail: null,
    loading: true,
    isAuthenticated: false,
  });
  const { checkIfBlocked } = useBlockedUserCheck();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setState({
        userId: null,
        userEmail: null,
        loading: false,
        isAuthenticated: false,
      });
      if (redirectToAuth) {
        navigate("/auth");
      }
      return null;
    }

    // Check if user is blocked
    const isBlocked = await checkIfBlocked(session.user.id);
    if (isBlocked) {
      setState({
        userId: null,
        userEmail: null,
        loading: false,
        isAuthenticated: false,
      });
      return null;
    }

    setState({
      userId: session.user.id,
      userEmail: session.user.email || null,
      loading: false,
      isAuthenticated: true,
    });

    return session;
  }, [navigate, redirectToAuth, checkIfBlocked]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { ...state, refetch: checkAuth };
};
