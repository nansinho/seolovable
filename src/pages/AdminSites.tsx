import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe2, 
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  User,
  ArrowLeft,
  Plus,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { AdminAddSiteModal } from "@/components/AdminAddSiteModal";
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

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
  user_id: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

const AdminSites = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addSiteModalOpen, setAddSiteModalOpen] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
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
        toast.error("Accès refusé - Vous n'êtes pas administrateur");
        navigate("/dashboard");
        return;
      }

      // Fetch all sites
      const { data: sitesData, error: sitesError } = await supabase
        .from("sites")
        .select("*")
        .order("created_at", { ascending: false });

      if (sitesError) {
        console.error("Error fetching sites:", sitesError);
        toast.error("Erreur lors du chargement des sites");
      } else if (sitesData) {
        setSites(sitesData);

        // Get unique user IDs
        const userIds = [...new Set(sitesData.map(s => s.user_id))];
        
        // Fetch user profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profilesData) {
          const usersMap: Record<string, UserProfile> = {};
          profilesData.forEach(p => {
            usersMap[p.id] = p;
          });
          setUsers(usersMap);
        }
      }

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [navigate]);

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!siteToDelete) return;
    
    setIsDeleting(true);
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
    
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setSiteToDelete(null);
  };

  const filteredSites = sites.filter(site => {
    const user = users[site.user_id];
    const searchLower = searchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(searchLower) ||
      site.url?.toLowerCase().includes(searchLower) ||
      user?.email.toLowerCase().includes(searchLower) ||
      user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const getUserDisplay = (userId: string) => {
    const user = users[userId];
    if (!user) return "Utilisateur inconnu";
    return user.full_name || user.email;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-code">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/admin")}
                className="font-code"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour Admin
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-code">Tous les sites</h1>
              <p className="text-muted-foreground text-sm">
                {sites.length} sites au total
              </p>
            </div>
          </div>

          {/* Search and Add button */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par site, URL ou propriétaire..."
                className="pl-10 font-code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setAddSiteModalOpen(true)}
              className="font-code glow-green"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un site
            </Button>
          </div>

          {/* Sites List */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Site</th>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Propriétaire</th>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Pages</th>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Créé le</th>
                    <th className="text-left p-4 font-code text-sm text-muted-foreground">Dernier crawl</th>
                    <th className="text-right p-4 font-code text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-code">
                        Aucun site trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredSites.map((site) => (
                      <tr key={site.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Globe2 className="w-5 h-5 text-accent" />
                            <div>
                              <p className="font-code font-medium text-foreground">{site.name}</p>
                              {site.url && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {site.url}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-code text-foreground">
                              {getUserDisplay(site.user_id)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {site.status === "active" ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-code text-green-500">Actif</span>
                              </>
                            ) : site.status === "pending" ? (
                              <>
                                <Clock className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-code text-yellow-500">En attente</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-destructive" />
                                <span className="text-sm font-code text-destructive">Erreur</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-code text-foreground">
                            {site.pages_rendered.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-code text-muted-foreground">
                              {new Date(site.created_at).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-code text-muted-foreground">
                            {site.last_crawl 
                              ? new Date(site.last_crawl).toLocaleDateString("fr-FR") 
                              : "Jamais"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {site.url && (
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-muted-foreground hover:text-accent transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => navigate(`/dashboard/sites/${site.id}`)}
                              className="p-2 text-muted-foreground hover:text-accent transition-colors"
                            >
                              <Globe2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(site)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{siteToDelete?.name}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Site Modal */}
      <AdminAddSiteModal
        open={addSiteModalOpen}
        onOpenChange={setAddSiteModalOpen}
        onSiteAdded={async () => {
          // Refresh sites list
          const { data: sitesData } = await supabase
            .from("sites")
            .select("*")
            .order("created_at", { ascending: false });
          if (sitesData) setSites(sitesData);
        }}
        users={Object.values(users).map(u => ({ id: u.id, email: u.email }))}
      />
    </div>
  );
};

export default AdminSites;