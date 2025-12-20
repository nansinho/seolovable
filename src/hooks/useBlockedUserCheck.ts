import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBlockedUserCheck = () => {
  const navigate = useNavigate();

  const checkIfBlocked = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: blockedData, error } = await supabase
        .from("blocked_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking blocked status:", error);
        return false;
      }

      if (blockedData) {
        // User is blocked, sign them out
        await supabase.auth.signOut();
        toast.error("Votre compte a été suspendu. Contactez le support pour plus d'informations.");
        navigate("/auth");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking blocked status:", error);
      return false;
    }
  }, [navigate]);

  return { checkIfBlocked };
};
