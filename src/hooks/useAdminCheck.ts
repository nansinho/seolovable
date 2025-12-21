import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache admin status to avoid repeated database queries
let adminCache: { userId: string; isAdmin: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute

export const useAdminCheck = (redirectOnFail = true) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const checkAdmin = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      if (redirectOnFail) {
        navigate("/auth");
      }
      setLoading(false);
      return false;
    }

    setCurrentUserId(session.user.id);

    // Check cache first
    if (
      adminCache &&
      adminCache.userId === session.user.id &&
      Date.now() - adminCache.timestamp < CACHE_DURATION
    ) {
      setIsAdmin(adminCache.isAdmin);
      setLoading(false);
      return adminCache.isAdmin;
    }

    // Query database
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      setLoading(false);
      return false;
    }

    const isAdminResult = !!roleData;
    
    // Update cache
    adminCache = {
      userId: session.user.id,
      isAdmin: isAdminResult,
      timestamp: Date.now(),
    };

    setIsAdmin(isAdminResult);
    setLoading(false);

    if (!isAdminResult && redirectOnFail) {
      toast.error("Accès refusé - Admin uniquement");
      navigate("/dashboard");
    }

    return isAdminResult;
  }, [navigate, redirectOnFail]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  return { isAdmin, loading, currentUserId, refetch: checkAdmin };
};

// Clear cache on logout
export const clearAdminCache = () => {
  adminCache = null;
};
