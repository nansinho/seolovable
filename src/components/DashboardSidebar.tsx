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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [collapsed, setCollapsed] = useState(false);

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
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-background border-r border-border flex flex-col transform transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + Collapse button */}
        <div className="p-4 border-b border-border flex items-center justify-between min-h-[72px]">
          {!collapsed && (
            <Link to="/" className="font-code text-xl font-bold text-primary">
              SEO<span className="text-foreground">Lovable</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="font-code text-xl font-bold text-primary mx-auto">
              S
            </Link>
          )}
          {onMobileClose ? (
            <button
              className="lg:hidden text-foreground"
              onClick={onMobileClose}
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              className="hidden lg:flex text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg transition-colors",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-code">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors font-code",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin button + Logout */}
        <div className="p-2 border-t border-border space-y-1">
          {isAdmin && (
            collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/admin" className="block">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-full",
                        currentPath.startsWith("/admin")
                          ? "bg-accent/20 text-accent border-accent"
                          : "text-muted-foreground hover:text-accent hover:border-accent"
                      )}
                    >
                      <Shield className="w-5 h-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-code">
                  Administration
                </TooltipContent>
              </Tooltip>
            ) : (
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
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Administration</span>
                </Button>
              </Link>
            )
          )}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-code">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-code text-sm text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Déconnexion</span>
            </Button>
          )}
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
