import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  X,
  Menu,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: CreditCard, label: "Abonnement", href: "/upgrade" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!roleData);
    };
    checkAdmin();
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(href);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
      return;
    }
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-background border-r border-border flex flex-col transform transition-transform lg:transform-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="font-code text-xl font-bold text-primary">
            SEO<span className="text-foreground">Lovable</span>
          </Link>
          {onMobileClose && (
            <button
              className="lg:hidden text-foreground"
              onClick={onMobileClose}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors font-code",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin button + Logout */}
        <div className="p-4 border-t border-border space-y-2">
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-3 font-code text-sm",
                  currentPath.startsWith("/admin")
                    ? "bg-accent/20 text-accent border-accent"
                    : "text-muted-foreground hover:text-accent hover:border-accent"
                )}
              >
                <Shield className="w-4 h-4" />
                Administration
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 font-code text-sm text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="lg:hidden text-foreground" onClick={onClick}>
      <Menu className="w-6 h-6" />
    </button>
  );
}
