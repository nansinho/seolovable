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
  Users,
  Globe2,
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

const adminItems = [
  { icon: Users, label: "Utilisateurs", href: "/admin" },
  { icon: Globe2, label: "Tous les sites", href: "/admin/sites" },
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
    if (href === "/admin") {
      return currentPath === "/admin";
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

  const renderNavItem = (item: { icon: any; label: string; href: string }, isAdminItem = false) => {
    const ItemIcon = item.icon;
    const active = isActive(item.href);
    const activeClass = isAdminItem
      ? "bg-accent/10 text-accent"
      : "bg-primary/10 text-primary";
    const hoverClass = isAdminItem
      ? "text-muted-foreground hover:bg-accent/10 hover:text-accent"
      : "text-muted-foreground hover:bg-muted hover:text-foreground";

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.href}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg transition-colors",
                active ? activeClass : hoverClass
              )}
            >
              <ItemIcon className="w-5 h-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-code">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors font-code",
          active ? activeClass : hoverClass
        )}
      >
        <ItemIcon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
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
          {/* Main nav */}
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                {renderNavItem(item)}
              </li>
            ))}
          </ul>

          {/* Admin section */}
          {isAdmin && (
            <div className="mt-6">
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-xs font-code text-accent uppercase tracking-wider">
                    Administration
                  </span>
                </div>
              )}
              {collapsed && (
                <div className="flex justify-center py-2">
                  <div className="w-8 h-px bg-accent/30" />
                </div>
              )}
              <ul className="space-y-1">
                {adminItems.map((item) => (
                  <li key={item.href}>
                    {renderNavItem(item, true)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-border">
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
