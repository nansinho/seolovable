import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { staticTranslations, Language, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Languages, RefreshCw, Search, Check, X, Loader2, Crown, FolderOpen } from "lucide-react";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { cn } from "@/lib/utils";

interface TranslationRow {
  id: string;
  key: string;
  lang: string;
  value: string;
  is_auto: boolean;
}

// Extract page from key (e.g., "landing.hero.title" -> "landing")
const getPageFromKey = (key: string): string => {
  const parts = key.split(".");
  return parts[0] || "other";
};

// Friendly names for pages
const PAGE_LABELS: Record<string, string> = {
  all: "Toutes",
  landing: "Landing",
  common: "Commun",
  dashboard: "Dashboard",
  admin: "Admin",
  auth: "Auth",
  settings: "Paramètres",
  pricing: "Tarifs",
  siteDetails: "Détails Site",
  analytics: "Analytics",
  upgrade: "Upgrade",
  legal: "Légal",
  howItWorks: "Comment ça marche",
  notFound: "Page 404",
};

const AdminTranslations = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck(true);
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLang, setEditLang] = useState<Language>("fr");
  const queryClient = useQueryClient();

  const { data: translations, isLoading } = useQuery({
    queryKey: ["admin-translations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("translations")
        .select("*")
        .order("key");
      if (error) throw error;
      return data as TranslationRow[];
    },
    enabled: isAdmin,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("sync-translations");
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Synchronisation terminée: ${data.translated} traductions ajoutées`);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la synchronisation: " + error.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, lang, value }: { key: string; lang: string; value: string }) => {
      const { error } = await supabase
        .from("translations")
        .upsert({ key, lang, value, is_auto: false }, { onConflict: "key,lang" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Traduction sauvegardée");
      setEditingKey(null);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const importStaticMutation = useMutation({
    mutationFn: async () => {
      const toInsert: { key: string; lang: string; value: string; is_auto: boolean }[] = [];
      Object.entries(staticTranslations).forEach(([key, langs]) => {
        toInsert.push({ key, lang: "fr", value: langs.fr, is_auto: false });
        toInsert.push({ key, lang: "en", value: langs.en, is_auto: false });
      });
      const { error } = await supabase
        .from("translations")
        .upsert(toInsert, { onConflict: "key,lang" });
      if (error) throw error;
      return toInsert.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} traductions importées`);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Get all unique keys from static + database
  const allKeys = useMemo(() => new Set([
    ...Object.keys(staticTranslations),
    ...(translations?.map((t) => t.key) || []),
  ]), [translations]);

  // Get all unique pages with counts and missing counts
  const pagesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const missingCounts: Record<string, number> = {};
    
    allKeys.forEach((key) => {
      const page = getPageFromKey(key);
      counts[page] = (counts[page] || 0) + 1;
      
      // Check for missing translations (FR or EN)
      const frTranslation = translations?.find((t) => t.key === key && t.lang === "fr");
      const enTranslation = translations?.find((t) => t.key === key && t.lang === "en");
      const frValue = frTranslation?.value || staticTranslations[key]?.fr;
      const enValue = enTranslation?.value || staticTranslations[key]?.en;
      
      if (!frValue || !enValue) {
        missingCounts[page] = (missingCounts[page] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([page, count]) => ({ page, count, missing: missingCounts[page] || 0 }));
  }, [allKeys, translations]);

  // Total missing count
  const totalMissing = useMemo(() => {
    return pagesWithCounts.reduce((acc, { missing }) => acc + missing, 0);
  }, [pagesWithCounts]);

  const getTranslation = (key: string, lang: Language): TranslationRow | undefined => {
    return translations?.find((t) => t.key === key && t.lang === lang);
  };

  // Filter keys by page and search
  const filteredKeys = useMemo(() => {
    return Array.from(allKeys).filter((key) => {
      if (selectedPage !== "all" && getPageFromKey(key) !== selectedPage) return false;
      if (search && !key.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort();
  }, [allKeys, selectedPage, search]);

  const startEdit = (key: string, lang: Language) => {
    const existing = getTranslation(key, lang);
    setEditingKey(`${key}:${lang}`);
    setEditLang(lang);
    setEditValue(existing?.value || staticTranslations[key]?.[lang] || "");
  };

  const saveEdit = (key: string) => {
    saveMutation.mutate({ key, lang: editLang, value: editValue });
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-code">{t("common.checkingAdmin")}</div>
      </div>
    );
  }

  if (!isAdmin) return null;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-2xl font-bold font-code flex items-center gap-2">
                  <Languages className="w-6 h-6 text-accent" />
                  {t("admin.translations.title")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {translations?.length || 0} {t("admin.translations.count")} · {allKeys.size} {t("admin.translations.keys")}
                </p>
              </div>
            </div>
            <Badge className="font-code bg-accent text-accent-foreground self-start sm:self-auto">
              <Crown className="w-3 h-3 mr-1" />
              ADMIN
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="outline"
              onClick={() => importStaticMutation.mutate()}
              disabled={importStaticMutation.isPending}
              className="font-code"
            >
              {importStaticMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("admin.translations.importStatic")}
            </Button>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="font-code"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("admin.translations.translateMissing")}
            </Button>
          </div>

          {/* Layout: Pages List + Translations */}
          <div className="flex gap-6">
            {/* Pages List - Left Side */}
            <div className="w-48 shrink-0 hidden md:block">
              <div className="sticky top-6 rounded-lg border border-border bg-card p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground mb-1">
                  <FolderOpen className="w-4 h-4" />
                  Pages
                </div>
                <button
                  onClick={() => setSelectedPage("all")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm font-code transition-colors flex items-center justify-between",
                    selectedPage === "all" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  <span>Toutes ({allKeys.size})</span>
                  {totalMissing > 0 && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      {totalMissing}
                    </Badge>
                  )}
                </button>
                {pagesWithCounts.map(({ page, count, missing }) => (
                  <button
                    key={page}
                    onClick={() => setSelectedPage(page)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm font-code transition-colors flex items-center justify-between",
                      selectedPage === page 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <span>{PAGE_LABELS[page] || page} ({count})</span>
                    {missing > 0 && (
                      <Badge 
                        variant={selectedPage === page ? "secondary" : "destructive"} 
                        className="text-xs ml-2"
                      >
                        {missing}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile: Dropdown */}
            <div className="md:hidden w-full mb-4">
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-card font-code"
              >
                <option value="all">Toutes les pages ({allKeys.size})</option>
                {pagesWithCounts.map(({ page, count }) => (
                  <option key={page} value={page}>
                    {PAGE_LABELS[page] || page} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Translations - Right Side */}
            <div className="flex-1 min-w-0">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une clé..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 font-code"
                />
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground mb-4 font-code">
                {filteredKeys.length} clés trouvées
              </div>

              {/* Translations List */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredKeys.length === 0 ? (
                  <div className="text-center text-muted-foreground font-code py-12">
                    Aucune traduction trouvée
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredKeys.map((key) => (
                      <div key={key} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="font-mono text-xs text-accent mb-3 break-all">{key}</div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {(["fr", "en"] as Language[]).map((lang) => {
                            const translation = getTranslation(key, lang);
                            const isEditing = editingKey === `${key}:${lang}`;
                            const value = translation?.value || staticTranslations[key]?.[lang];
                            const isFromDb = !!translation;
                            const isMissing = !value;

                            return (
                              <div key={lang} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={lang === "fr" ? "default" : "secondary"} 
                                    className="font-code text-xs"
                                  >
                                    {lang.toUpperCase()}
                                  </Badge>
                                  {isMissing && (
                                    <Badge variant="destructive" className="text-xs">
                                      Manquante
                                    </Badge>
                                  )}
                                  {!isMissing && !isFromDb && (
                                    <Badge variant="outline" className="text-xs">
                                      Statique
                                    </Badge>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="flex-1 font-code text-sm"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => saveEdit(key)}
                                      disabled={saveMutation.isPending}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingKey(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className={cn(
                                      "text-sm font-code p-2 rounded border cursor-pointer transition-colors",
                                      isMissing 
                                        ? "bg-destructive/10 border-destructive/30 text-destructive italic" 
                                        : "bg-background border-border hover:border-accent/50"
                                    )}
                                    onClick={() => startEdit(key, lang)}
                                  >
                                    {value || "Non définie - cliquer pour ajouter"}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTranslations;