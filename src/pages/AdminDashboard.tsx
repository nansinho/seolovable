import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Ban,
  Crown,
  UserCheck,
  UserX,
  Infinity,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { StatsSkeleton, AdminTableSkeleton } from "@/components/DashboardSkeleton";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

interface Site {
  id: string;
  user_id: string;
  pages_rendered: number;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface BlockedUser {
  user_id: string;
  blocked_at: string;
  reason: string | null;
}

interface UserPlan {
  user_id: string;
  plan_type: string;
  sites_limit: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading, currentUserId } = useAdminCheck(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalPages: 0,
    totalCrawls: 0,
  });

  const fetchData = useCallback(async () => {
    // Fetch all data in parallel for better performance
    const [profilesResult, sitesResult, rolesResult, blockedResult, plansResult, crawlCountResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("sites")
        .select("id, user_id, pages_rendered")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_roles")
        .select("*"),
      supabase
        .from("blocked_users")
        .select("*"),
      supabase
        .from("user_plans")
        .select("user_id, plan_type, sites_limit"),
      supabase
        .from("bot_activity")
        .select("*", { count: "exact", head: true }),
    ]);

    if (profilesResult.data) {
      const userList: AdminUser[] = profilesResult.data.map(p => ({
        id: p.id,
        email: p.email,
        created_at: p.created_at,
      }));
      setUsers(userList);
    }

    if (sitesResult.data) setSites(sitesResult.data);
    if (rolesResult.data) setUserRoles(rolesResult.data);
    if (blockedResult.data) setBlockedUsers(blockedResult.data);
    if (plansResult.data) setUserPlans(plansResult.data);

    // Calculate stats
    const totalSites = sitesResult.data?.length || 0;
    const totalPages = sitesResult.data?.reduce((sum, s) => sum + s.pages_rendered, 0) || 0;

    setStats({
      totalUsers: profilesResult.data?.length || 0,
      totalSites,
      totalPages,
      totalCrawls: crawlCountResult.count || 0,
    });
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (adminLoading || !isAdmin) return;
    fetchData();
  }, [adminLoading, isAdmin, fetchData]);

  const isUserAdmin = (userId: string) => {
    return userRoles.some(r => r.user_id === userId && r.role === "admin");
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.some(b => b.user_id === userId);
  };

  const getUserPlan = (userId: string): UserPlan | undefined => {
    return userPlans.find(p => p.user_id === userId);
  };

  const handleChangePlan = async (userId: string, planType: string) => {
    const planLimits: Record<string, number> = {
      free: 1,
      starter: 1,
      pro: 5,
      business: 999,
    };
    const sitesLimit = planLimits[planType] ?? 1;
    
    const { error } = await supabase
      .from("user_plans")
      .upsert({
        user_id: userId,
        plan_type: planType,
        sites_limit: sitesLimit,
        created_by: currentUserId,
      }, {
        onConflict: "user_id",
      });

    if (error) {
      toast.error("Erreur lors de la modification du plan");
    } else {
      toast.success(`Plan modifié en ${planType}`);
      setUserPlans(prev => {
        const existing = prev.find(p => p.user_id === userId);
        if (existing) {
          return prev.map(p => p.user_id === userId ? { ...p, plan_type: planType, sites_limit: sitesLimit } : p);
        }
        return [...prev, { user_id: userId, plan_type: planType, sites_limit: sitesLimit }];
      });
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (error) {
      if (error.code === "23505") {
        toast.error("Cet utilisateur est déjà admin");
      } else {
        toast.error("Erreur lors de la promotion");
      }
    } else {
      toast.success("Utilisateur promu admin");
      setUserRoles([...userRoles, { user_id: userId, role: "admin" }]);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("Vous ne pouvez pas vous retirer les droits admin");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");

    if (error) {
      toast.error("Erreur lors de la suppression des droits");
    } else {
      toast.success("Droits admin retirés");
      setUserRoles(userRoles.filter(r => !(r.user_id === userId && r.role === "admin")));
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("Vous ne pouvez pas vous bloquer vous-même");
      return;
    }

    const { error } = await supabase
      .from("blocked_users")
      .insert({ user_id: userId, blocked_by: currentUserId });

    if (error) {
      if (error.code === "23505") {
        toast.error("Cet utilisateur est déjà bloqué");
      } else {
        toast.error("Erreur lors du blocage");
      }
    } else {
      toast.success("Utilisateur bloqué");
      setBlockedUsers([...blockedUsers, { user_id: userId, blocked_at: new Date().toISOString(), reason: null }]);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Erreur lors du déblocage");
    } else {
      toast.success("Utilisateur débloqué");
      setBlockedUsers(blockedUsers.filter(b => b.user_id !== userId));
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSiteCount = (userId: string) => {
    return sites.filter(s => s.user_id === userId).length;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-code">Vérification des droits admin...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-8">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <div className="h-8 w-40 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-60 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <StatsSkeleton />
            <div className="mb-6 mt-8">
              <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            </div>
            <AdminTableSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-2xl font-bold font-code flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" />
                  Utilisateurs
                </h1>
                <p className="text-muted-foreground text-sm">
                  Gestion des utilisateurs et des rôles
                </p>
              </div>
            </div>
            <Badge className="font-code bg-accent text-accent-foreground self-start sm:self-auto">
              <Crown className="w-3 h-3 mr-1" />
              ADMIN
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Utilisateurs</p>
              <p className="text-2xl font-bold font-code text-accent">{stats.totalUsers}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Sites totaux</p>
              <p className="text-2xl font-bold font-code text-accent">{stats.totalSites}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Pages rendues</p>
              <p className="text-2xl font-bold font-code text-accent">{stats.totalPages.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground font-code mb-1">Total crawls</p>
              <p className="text-2xl font-bold font-code text-accent">{stats.totalCrawls.toLocaleString()}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-code"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-code">Email</TableHead>
                  <TableHead className="font-code">Statut</TableHead>
                  <TableHead className="font-code">Plan</TableHead>
                  <TableHead className="font-code">Sites</TableHead>
                  <TableHead className="font-code">Inscrit le</TableHead>
                  <TableHead className="font-code text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground font-code py-8">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-code font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isUserAdmin(user.id) && (
                            <Badge className="text-xs bg-accent text-accent-foreground">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {isUserBlocked(user.id) && (
                            <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-500">
                              <Ban className="w-3 h-3 mr-1" />
                              Bloqué
                            </Badge>
                          )}
                          {!isUserAdmin(user.id) && !isUserBlocked(user.id) && (
                            <Badge variant="outline" className="text-xs">
                              Utilisateur
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isUserAdmin(user.id) ? (
                          <div className="flex items-center gap-1 text-xs font-code text-accent">
                            <Infinity className="w-3 h-3" />
                            <span>Illimité (Admin)</span>
                          </div>
                        ) : (
                          <Select
                            value={getUserPlan(user.id)?.plan_type || "free"}
                            onValueChange={(value) => handleChangePlan(user.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 font-code text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free" className="font-code text-xs">
                                Free
                              </SelectItem>
                              <SelectItem value="starter" className="font-code text-xs">
                                Starter
                              </SelectItem>
                              <SelectItem value="pro" className="font-code text-xs">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-primary" />
                                  Pro
                                </span>
                              </SelectItem>
                              <SelectItem value="business" className="font-code text-xs">
                                <span className="flex items-center gap-1">
                                  <Infinity className="w-3 h-3 text-accent" />
                                  Business
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="font-code">
                        {(() => {
                          const siteCount = getSiteCount(user.id);
                          const plan = getUserPlan(user.id);
                          const limit = isUserAdmin(user.id) ? -1 : (plan?.sites_limit ?? 1);
                          
                          if (isUserAdmin(user.id) || limit === -1) {
                            return (
                              <span className="flex items-center gap-1 text-accent">
                                {siteCount} <Infinity className="w-3 h-3" />
                              </span>
                            );
                          }
                          
                          const remaining = limit - siteCount;
                          const isAtLimit = remaining <= 0;
                          
                          return (
                            <span className={isAtLimit ? "text-destructive" : "text-muted-foreground"}>
                              {siteCount} / {limit}
                              <span className="ml-1 text-xs">
                                ({remaining > 0 ? `${remaining} dispo` : "limite"})
                              </span>
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="font-code text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isUserAdmin(user.id) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePromoteToAdmin(user.id)}
                              className="text-accent hover:text-accent"
                              title="Promouvoir admin"
                            >
                              <Crown className="w-4 h-4" />
                            </Button>
                          ) : user.id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAdmin(user.id)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Retirer admin"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                          {!isUserBlocked(user.id) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBlockUser(user.id)}
                              className="text-orange-500 hover:text-orange-500"
                              title="Bloquer"
                              disabled={user.id === currentUserId}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnblockUser(user.id)}
                              className="text-green-500 hover:text-green-500"
                              title="Débloquer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;