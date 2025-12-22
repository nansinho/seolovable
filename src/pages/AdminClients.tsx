import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit,
  BarChart3,
  Code,
  RefreshCw,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AddClientModal } from "@/components/AddClientModal";
import { ClientStatsPanel } from "@/components/ClientStatsPanel";
import { ClientCodePanel } from "@/components/ClientCodePanel";
import { EditClientModal } from "@/components/EditClientModal";

interface Client {
  id: string;
  name: string;
  email: string | null;
  prerender_token: string;
  plan: string;
  allowed_domains: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClientStats {
  total_renders: number;
  cached_renders: number;
  fresh_renders: number;
}

export default function AdminClients() {
  const navigate = useNavigate();
  const { isAdmin, loading: isAdminLoading } = useAdminCheck();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [clientStats, setClientStats] = useState<Record<string, ClientStats>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClientStats = useCallback(async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("prerender_logs")
        .select("cached")
        .eq("client_id", clientId);

      if (error) throw error;

      const stats: ClientStats = {
        total_renders: data?.length || 0,
        cached_renders: data?.filter(l => l.cached).length || 0,
        fresh_renders: data?.filter(l => !l.cached).length || 0,
      };

      setClientStats(prev => ({ ...prev, [clientId]: stats }));
    } catch (error) {
      console.error("Error fetching client stats:", error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchClients();
    }
  }, [isAdmin, fetchClients]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientStats(selectedClient.id);
    }
  }, [selectedClient, fetchClientStats]);

  // Realtime subscription for logs
  useEffect(() => {
    const channel = supabase
      .channel("prerender_logs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "prerender_logs" },
        (payload) => {
          const clientId = payload.new.client_id;
          if (clientId && clientStats[clientId]) {
            setClientStats(prev => ({
              ...prev,
              [clientId]: {
                total_renders: prev[clientId].total_renders + 1,
                cached_renders: prev[clientId].cached_renders + (payload.new.cached ? 1 : 0),
                fresh_renders: prev[clientId].fresh_renders + (payload.new.cached ? 0 : 1),
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientStats]);

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === "active" ? "suspended" : "active";
    try {
      const { error } = await supabase
        .from("clients")
        .update({ status: newStatus })
        .eq("id", client.id);

      if (error) throw error;

      setClients(prev =>
        prev.map(c => (c.id === client.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Client ${newStatus === "active" ? "activé" : "suspendu"}`);
    } catch (error) {
      console.error("Error updating client status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== clientId));
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      toast.success("Client supprimé");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prerender_token.includes(searchQuery)
  );

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Accès non autorisé</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Gestion Prerender</h1>
              <p className="text-muted-foreground">
                Gérez vos clients et leurs abonnements prerender
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Clients actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {clients.filter(c => c.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Clients suspendus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {clients.filter(c => c.status === "suspended").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total renders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(clientStats).reduce((acc, s) => acc + s.total_renders, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clients List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Clients
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchClients}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, email ou token..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.map(client => (
                            <TableRow
                              key={client.id}
                              className={`cursor-pointer ${
                                selectedClient?.id === client.id
                                  ? "bg-muted"
                                  : ""
                              }`}
                              onClick={() => setSelectedClient(client)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{client.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {client.email || "—"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[100px]">
                                    {client.prerender_token.slice(0, 8)}...
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={e => {
                                      e.stopPropagation();
                                      copyToClipboard(client.prerender_token);
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{client.plan}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    client.status === "active"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {client.status === "active" ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {client.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingClient(client);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleToggleStatus(client);
                                    }}
                                  >
                                    {client.status === "active" ? (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteClient(client.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredClients.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground py-8"
                              >
                                Aucun client trouvé
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Client Details Panel */}
            <div className="lg:col-span-1">
              {selectedClient ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedClient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Créé le{" "}
                      {format(new Date(selectedClient.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="stats" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Stats
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex-1">
                          <Code className="h-4 w-4 mr-1" />
                          Code
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="stats" className="mt-4">
                        <ClientStatsPanel clientId={selectedClient.id} />
                      </TabsContent>
                      <TabsContent value="code" className="mt-4">
                        <ClientCodePanel token={selectedClient.prerender_token} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un client pour voir ses détails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <AddClientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchClients();
          setShowAddModal(false);
        }}
      />

      {editingClient && (
        <EditClientModal
          client={editingClient}
          open={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            fetchClients();
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}
