import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Users,
  Globe2,
  Shield,
  Trash2,
  Plus,
  Search,
  Ban,
  Crown,
  UserCheck,
  UserX,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AdminAddSiteModal } from "@/components/AdminAddSiteModal";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  user_id: string;
  created_at: string;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "sites">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [addSiteModalOpen, setAddSiteModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalPages: 0,
    totalCrawls: 0,
  });

  const fetchData = async () => {
    // Fetch all profiles (users with real emails)
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false });

    if (profilesData) {
      const userList: AdminUser[] = profilesData.map(p => ({
        id: p.id,
        email: p.email,
        created_at: p.created_at,
      }));
      setUsers(userList);
    }

    // Fetch all sites
    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (sitesData) setSites(sitesData);

    // Fetch user roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesData) setUserRoles(rolesData);

    // Fetch blocked users
    const { data: blockedData } = await supabase
      .from("blocked_users")
      .select("*");

    if (blockedData) setBlockedUsers(blockedData);

    // Calculate stats
    const totalSites = sitesData?.length || 0;
    const totalPages = sitesData?.reduce((sum, s) => sum + s.pages_rendered, 0) || 0;

    const { count: crawlCount } = await supabase
      .from("bot_activity")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: profilesData?.length || 0,
      totalSites,
      totalPages,
      totalCrawls: crawlCount || 0,
    });
  };
  const { checkIfBlocked } = useBlockedUserCheck();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is blocked first
      const isBlocked = await checkIfBlocked(session.user.id);
      if (isBlocked) return;

      setCurrentUserId(session.user.id);

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Accès refusé - Admin uniquement");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchData();
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [navigate, checkIfBlocked]);

  const handleDeleteSite = async () => {
    if (!siteToDelete) return;

    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", siteToDelete.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Site supprimé");
      setSites(sites.filter(s => s.id !== siteToDelete.id));
    }

    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

  const isUserAdmin = (userId: string) => {
    return userRoles.some(r => r.user_id === userId && r.role === "admin");
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.some(b => b.user_id === userId);
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

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get site count per user
  const getSiteCount = (userId: string) => {
    return sites.filter(s => s.user_id === userId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-code">Vérification des droits admin...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-destructive/20 border border-destructive flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <span className="font-code font-bold text-destructive">Admin Suprême</span>
          </div>
        </div>
        <Badge variant="destructive" className="font-code">
          <Crown className="w-3 h-3 mr-1" />
          ADMIN
        </Badge>
      </header>

      {/* Content */}
      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 lg:p-6 rounded-lg border border-destructive/30 bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Utilisateurs</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-destructive">{stats.totalUsers}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-destructive/30 bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Sites totaux</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-destructive">{stats.totalSites}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-destructive/30 bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Pages rendues</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-destructive">{stats.totalPages.toLocaleString()}</p>
          </div>
          <div className="p-4 lg:p-6 rounded-lg border border-destructive/30 bg-card">
            <p className="text-xs text-muted-foreground font-code mb-2">Total crawls</p>
            <p className="text-2xl lg:text-3xl font-bold font-code text-destructive">{stats.totalCrawls.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
            className="font-code"
          >
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs
          </Button>
          <Button
            variant={activeTab === "sites" ? "default" : "ghost"}
            onClick={() => setActiveTab("sites")}
            className="font-code"
          >
            <Globe2 className="w-4 h-4 mr-2" />
            Tous les sites
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "users" ? "Rechercher un utilisateur..." : "Rechercher un site..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-code"
            />
          </div>
          {activeTab === "sites" && (
            <Button
              onClick={() => setAddSiteModalOpen(true)}
              className="font-code bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un site
            </Button>
          )}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-code">Email</TableHead>
                  <TableHead className="font-code">Statut</TableHead>
                  <TableHead className="font-code">Sites</TableHead>
                  <TableHead className="font-code">Inscrit le</TableHead>
                  <TableHead className="font-code text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground font-code py-8">
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
                            <Badge variant="destructive" className="text-xs">
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
                      <TableCell className="font-code">
                        {getSiteCount(user.id)}
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
                              className="text-primary hover:text-primary"
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
        )}

        {/* Sites Tab */}
        {activeTab === "sites" && (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-code">Site</TableHead>
                  <TableHead className="font-code">URL</TableHead>
                  <TableHead className="font-code">Statut</TableHead>
                  <TableHead className="font-code">Pages</TableHead>
                  <TableHead className="font-code">Créé le</TableHead>
                  <TableHead className="font-code text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground font-code py-8">
                      Aucun site trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-code font-medium">
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-primary" />
                          {site.name}
                          {isUserAdmin(site.user_id) && (
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-code text-muted-foreground">
                        {site.url || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={site.status === "active" ? "default" : "secondary"}>
                          {site.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-code">
                        {site.pages_rendered.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-code text-muted-foreground">
                        {new Date(site.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSiteToDelete(site);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-code">Supprimer le site</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer <strong>{siteToDelete?.name}</strong> ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-code">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-code"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Site Modal */}
      <AdminAddSiteModal
        open={addSiteModalOpen}
        onOpenChange={setAddSiteModalOpen}
        onSiteAdded={fetchData}
        users={users}
      />
    </div>
  );
};

export default AdminDashboard;
