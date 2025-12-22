import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { staticTranslations, Language, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Languages, RefreshCw, Search, Check, X, Loader2, Crown, FolderOpen, Bot, AlertTriangle, RotateCcw } from "lucide-react";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { cn } from "@/lib/utils";
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
  integration: "Intégration",
  prerenderStats: "Stats Prerender",
  subscription: "Abonnement",
  addSite: "Ajout Site",
  deleteSite: "Suppression Site",
  dns: "DNS",
  seoTest: "Test SEO",
  prerenderTest: "Test Prerender",
  toast: "Toasts",
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
  const [manualOverrideConfirm, setManualOverrideConfirm] = useState<{key: string; value: string} | null>(null);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);
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

  // Sync translations via LibreTranslate (translate missing EN from FR)
  // Now processes in batches and loops until all are done
  const syncMutation = useMutation({
    mutationFn: async () => {
      let totalTranslated = 0;
      let totalErrors = 0;
      let hasMore = true;
      let iterations = 0;
      const maxIterations = 50; // Safety limit

      while (hasMore && iterations < maxIterations) {
        iterations++;
        const response = await supabase.functions.invoke("sync-translations");
        if (response.error) throw response.error;
        
        const data = response.data;
        totalTranslated += data.translated || 0;
        totalErrors += data.errors || 0;
        hasMore = data.hasMore || false;
        
        // Update UI during process
        if (hasMore) {
          toast.info(`Traduction en cours... ${totalTranslated} faites, ${data.remaining} restantes`);
          queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
        }
      }

      return { translated: totalTranslated, errors: totalErrors };
    },
    onSuccess: (data) => {
      toast.success(`Synchronisation terminée: ${data.translated} traductions LibreTranslate${data.errors > 0 ? ` (${data.errors} erreurs)` : ''}`);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la synchronisation: " + error.message);
    },
  });

  // Save FR translation (manual)
  const saveFrMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("translations")
        .upsert({ key, lang: "fr", value, is_auto: false }, { onConflict: "key,lang" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Traduction FR sauvegardée");
      setEditingKey(null);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Translate single key via LibreTranslate
  const translateSingleMutation = useMutation({
    mutationFn: async ({ key, frenchText }: { key: string; frenchText: string }) => {
      const response = await supabase.functions.invoke("translate-single", {
        body: { key, frenchText },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Traduit via LibreTranslate: "${data.translatedText}"`);
      setEditingKey(null);
      setTranslatingKey(null);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur LibreTranslate: " + error.message);
      setTranslatingKey(null);
    },
  });

  // Manual EN override (with warning)
  const saveManualEnMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("translations")
        .upsert({ key, lang: "en", value, is_auto: false }, { onConflict: "key,lang" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.warning("Traduction EN manuelle sauvegardée (non LibreTranslate)");
      setEditingKey(null);
      setManualOverrideConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Import ONLY French static translations (EN will be generated via LibreTranslate)
  const importStaticMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Import ONLY French translations
      const toInsert: { key: string; lang: string; value: string; is_auto: boolean }[] = [];
      Object.entries(staticTranslations).forEach(([key, langs]) => {
        toInsert.push({ key, lang: "fr", value: langs.fr, is_auto: false });
      });
      
      const { error } = await supabase
        .from("translations")
        .upsert(toInsert, { onConflict: "key,lang" });
      if (error) throw error;
      
      return toInsert.length;
    },
    onSuccess: async (count) => {
      toast.success(`${count} traductions FR importées. Lancement de la traduction LibreTranslate...`);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      
      // Step 2: Automatically trigger LibreTranslate sync
      setTimeout(() => {
        syncMutation.mutate();
      }, 500);
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Re-translate a single key via LibreTranslate
  const handleRetranslate = (key: string) => {
    const frTranslation = translations?.find((t) => t.key === key && t.lang === "fr");
    const frValue = frTranslation?.value || staticTranslations[key]?.fr;
    
    if (!frValue) {
      toast.error("Aucune traduction FR trouvée pour cette clé");
      return;
    }
    
    setTranslatingKey(key);
    translateSingleMutation.mutate({ key, frenchText: frValue });
  };

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
      const enValue = enTranslation?.value;
      
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
    setEditValue(existing?.value || (lang === "fr" ? staticTranslations[key]?.fr : "") || "");
  };

  const handleSaveEdit = (key: string) => {
    if (editLang === "fr") {
      // Save FR directly
      saveFrMutation.mutate({ key, value: editValue });
    } else {
      // For EN, show confirmation dialog to force LibreTranslate
      setManualOverrideConfirm({ key, value: editValue });
    }
  };

  const handleUseLibreTranslate = (key: string) => {
    const frTranslation = translations?.find((t) => t.key === key && t.lang === "fr");
    const frValue = frTranslation?.value || staticTranslations[key]?.fr;
    
    if (!frValue) {
      toast.error("Aucune traduction FR trouvée. Ajoutez d'abord la version française.");
      return;
    }
    
    setEditingKey(null);
    setTranslatingKey(key);
    translateSingleMutation.mutate({ key, frenchText: frValue });
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

          {/* Rule Banner */}
          <div className="mb-6 p-4 rounded-lg border border-accent/50 bg-accent/10">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-accent">Règle : 100% LibreTranslate</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Toutes les traductions anglaises doivent passer par LibreTranslate. 
                  L'import statique importe uniquement le français, puis déclenche automatiquement la traduction.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="outline"
              onClick={() => importStaticMutation.mutate()}
              disabled={importStaticMutation.isPending || syncMutation.isPending}
              className="font-code"
            >
              {importStaticMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Importer FR + Traduire EN
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
              Traduire EN manquantes
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
                    {filteredKeys.map((key) => {
                      const isTranslating = translatingKey === key;
                      
                      return (
                        <div key={key} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="font-mono text-xs text-accent mb-3 break-all">{key}</div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {(["fr", "en"] as Language[]).map((lang) => {
                              const translation = getTranslation(key, lang);
                              const isEditing = editingKey === `${key}:${lang}`;
                              const value = translation?.value || (lang === "fr" ? staticTranslations[key]?.fr : undefined);
                              const isFromDb = !!translation;
                              const isMissing = !value;
                              const isAuto = translation?.is_auto === true;

                              return (
                                <div key={lang} className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
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
                                    {isFromDb && lang === "en" && (
                                      <Badge 
                                        variant={isAuto ? "default" : "outline"} 
                                        className={cn(
                                          "text-xs",
                                          isAuto ? "bg-green-600 hover:bg-green-700" : "border-orange-500 text-orange-500"
                                        )}
                                      >
                                        {isAuto ? (
                                          <>
                                            <Bot className="w-3 h-3 mr-1" />
                                            LibreTranslate
                                          </>
                                        ) : (
                                          <>
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Manuel
                                          </>
                                        )}
                                      </Badge>
                                    )}
                                    {lang === "en" && isFromDb && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleRetranslate(key)}
                                        disabled={isTranslating}
                                      >
                                        {isTranslating ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <RotateCcw className="w-3 h-3 mr-1" />
                                            Re-traduire
                                          </>
                                        )}
                                      </Button>
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
                                        onClick={() => handleSaveEdit(key)}
                                        disabled={saveFrMutation.isPending}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      {lang === "en" && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleUseLibreTranslate(key)}
                                          disabled={translateSingleMutation.isPending}
                                          title="Traduire via LibreTranslate"
                                        >
                                          <Bot className="h-4 w-4" />
                                        </Button>
                                      )}
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
                                      {value || (lang === "en" ? "Cliquer pour traduire via LibreTranslate" : "Non définie - cliquer pour ajouter")}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Override Confirmation Dialog */}
      <AlertDialog open={!!manualOverrideConfirm} onOpenChange={() => setManualOverrideConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Traduction manuelle détectée
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Vous êtes sur le point de sauvegarder une traduction anglaise <strong>manuelle</strong>.
              </p>
              <p className="text-orange-500 font-medium">
                ⚠️ La règle est d'utiliser LibreTranslate pour toutes les traductions EN.
              </p>
              <p>
                Voulez-vous plutôt traduire automatiquement via LibreTranslate ?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setManualOverrideConfirm(null)}>
              Annuler
            </AlertDialogCancel>
            <Button
              variant="default"
              onClick={() => {
                if (manualOverrideConfirm) {
                  handleUseLibreTranslate(manualOverrideConfirm.key);
                  setManualOverrideConfirm(null);
                }
              }}
            >
              <Bot className="w-4 h-4 mr-2" />
              Utiliser LibreTranslate
            </Button>
            <AlertDialogAction
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                if (manualOverrideConfirm) {
                  saveManualEnMutation.mutate({ key: manualOverrideConfirm.key, value: manualOverrideConfirm.value });
                }
              }}
            >
              Forcer manuel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTranslations;
