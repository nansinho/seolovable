import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, LogOut, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PlanBadge, AvatarRing } from "@/components/PlanBadge";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
      return;
    }
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
    if (name.includes("@")) return name[0].toUpperCase();
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "";
  };

  // Fetch user plan
  const fetchUserPlan = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_plans")
        .select("plan_type")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (!error && data) {
        setUserPlan(data.plan_type || "free");
      }
    } catch (e) {
      console.error("Error fetching user plan:", e);
    }
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check admin status and fetch plan
        if (session?.user) {
          setTimeout(() => {
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle()
              .then(({ data }) => {
                setIsAdmin(!!data);
              });
            
            fetchUserPlan(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setUserPlan("free");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check admin status and fetch plan
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => {
            setIsAdmin(!!data);
          });
        
        fetchUserPlan(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fermer le menu quand on change de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Empêcher le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 z-50" aria-label="SEO Lovable - Accueil">
            <span className="text-foreground font-mono font-medium tracking-tight uppercase">
              SEO Lovable
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2" role="navigation" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-mono uppercase tracking-wider transition-colors link-hover",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-muted/50 transition-colors">
                    <AvatarRing plan={userPlan} size="sm">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getUserAvatar() || undefined} alt={getUserName()} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-mono">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarRing>
                    <span className="text-sm font-mono text-foreground max-w-[120px] truncate">
                      {getUserName().split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{getUserName()}</p>
                      <PlanBadge plan={userPlan} size="sm" showLabel={true} showIcon={true} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-accent focus:text-accent">
                          <Shield className="w-4 h-4 mr-2" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="font-mono uppercase tracking-wider border-border h-9 px-6">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider h-9 px-6">
                    {t("nav.trial")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 z-50 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile plein écran */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out",
          isMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isMenuOpen}
      >
        {/* Fond opaque complet */}
        <div className="absolute inset-0 bg-background" />
        
        <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <nav className="flex flex-col items-center gap-3 w-full max-w-sm" role="navigation" aria-label="Navigation mobile">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-2xl font-mono uppercase tracking-wider py-5 px-8 rounded-xl transition-all duration-300 w-full text-center",
                  location.pathname === link.href
                    ? "text-foreground bg-card border border-border"
                    : "text-foreground/80 hover:text-foreground hover:bg-card/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                aria-current={location.pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-full h-px bg-border my-8" role="separator" />
            
            <div className="flex justify-center mb-8">
              <LanguageSwitcher />
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              {!loading && user ? (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border mb-2">
                    <AvatarRing plan={userPlan} size="md">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getUserAvatar() || undefined} alt={getUserName()} />
                        <AvatarFallback className="bg-accent text-accent-foreground font-mono">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarRing>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-mono font-medium text-foreground truncate">{getUserName()}</p>
                        <PlanBadge plan={userPlan} size="sm" showIcon={false} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider h-14 text-lg">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full font-mono uppercase tracking-wider border-border h-14 text-lg text-destructive hover:text-destructive"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full font-mono uppercase tracking-wider border-border h-14 text-lg">
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider h-14 text-lg">
                      {t("nav.trial")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;