import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Terminal,
  ArrowLeft,
  Users,
  Globe2,
  BarChart3,
  Shield,
  Trash2,
  Plus,
  Search,
  Ban,
  Crown,
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

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "sites" | "stats">("users");
  const [sites, setSites] = useState<Site[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSites: 0,
    totalPages: 0,
    totalCrawls: 0,
  });

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

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

      // Calculate stats
      const totalSites = sitesData?.length || 0;
      const totalPages = sitesData?.reduce((sum, s) => sum + s.pages_rendered, 0) || 0;
      const uniqueUsers = new Set(sitesData?.map(s => s.user_id)).size;

      const { count: crawlCount } = await supabase
        .from("bot_activity")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: uniqueUsers,
        totalSites,
        totalPages,
        totalCrawls: crawlCount || 0,
      });

      setLoading(false);
    };

    checkAdminAndFetch();
  }, [navigate]);

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

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            variant={activeTab === "sites" ? "default" : "ghost"}
            onClick={() => setActiveTab("sites")}
            className="font-code"
          >
            <Globe2 className="w-4 h-4 mr-2" />
            Tous les sites
          </Button>
        </div>

        {/* Sites Tab */}
        {activeTab === "sites" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un site..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-code"
                />
              </div>
            </div>

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
    </div>
  );
};

export default AdminDashboard;
