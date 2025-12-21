import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { staticTranslations, Language, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Languages, RefreshCw, Search, Check, X, Loader2, Crown, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface TranslationRow {
  id: string;
  key: string;
  lang: string;
  value: string;
  is_auto: boolean;
}

// Extract page/section from key (e.g., "landing.hero.title" -> "landing")
const getPageFromKey = (key: string): string => {
  const parts = key.split(".");
  return parts[0] || "other";
};

// Extract section from key (e.g., "landing.hero.title" -> "hero")
const getSectionFromKey = (key: string): string => {
  const parts = key.split(".");
  return parts[1] || "root";
};

// Friendly names for pages
const PAGE_LABELS: Record<string, string> = {
  landing: "🏠 Landing Page",
  common: "🔧 Commun",
  dashboard: "📊 Dashboard",
  admin: "👑 Admin",
  auth: "🔐 Authentification",
  settings: "⚙️ Paramètres",
  pricing: "💰 Tarifs",
  siteDetails: "📄 Détails Site",
  analytics: "📈 Analytics",
  upgrade: "⬆️ Upgrade",
  legal: "📜 Légal",
  howItWorks: "❓ Comment ça marche",
  notFound: "🚫 Page 404",
  other: "📁 Autres",
};

const AdminTranslations = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck(true);
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "auto" | "manual" | "missing">("all");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
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

  // Get all unique pages
  const allPages = useMemo(() => {
    const pages = new Set<string>();
    allKeys.forEach((key) => pages.add(getPageFromKey(key)));
    return Array.from(pages).sort();
  }, [allKeys]);

  // Count keys per page
  const pageKeyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allKeys.forEach((key) => {
      const page = getPageFromKey(key);
      counts[page] = (counts[page] || 0) + 1;
    });
    return counts;
  }, [allKeys]);

  const getTranslation = (key: string, lang: Language): TranslationRow | undefined => {
    return translations?.find((t) => t.key === key && t.lang === lang);
  };

  const filteredKeys = useMemo(() => {
    return Array.from(allKeys).filter((key) => {
      // Filter by page
      if (selectedPage !== "all" && getPageFromKey(key) !== selectedPage) return false;
      // Filter by search
      if (search && !key.toLowerCase().includes(search.toLowerCase())) return false;
      // Filter by type
      if (filter === "auto") {
        const fr = getTranslation(key, "fr");
        const en = getTranslation(key, "en");
        return fr?.is_auto || en?.is_auto;
      }
      if (filter === "manual") {
        const fr = getTranslation(key, "fr");
        const en = getTranslation(key, "en");
        return (fr && !fr.is_auto) || (en && !en.is_auto);
      }
      if (filter === "missing") {
        const fr = getTranslation(key, "fr");
        const en = getTranslation(key, "en");
        return !fr || !en;
      }
      return true;
    });
  }, [allKeys, selectedPage, search, filter, translations]);

  // Group keys by section
  const groupedBySection = useMemo(() => {
    const groups: Record<string, string[]> = {};
    filteredKeys.forEach((key) => {
      const section = getSectionFromKey(key);
      if (!groups[section]) groups[section] = [];
      groups[section].push(key);
    });
    return groups;
  }, [filteredKeys]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(Object.keys(groupedBySection)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
            <div className="flex items-center gap-2">
              <Badge className="font-code bg-accent text-accent-foreground self-start sm:self-auto">
                <Crown className="w-3 h-3 mr-1" />
                ADMIN
              </Badge>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.translations.searchKey")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-code"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => importStaticMutation.mutate()}
                disabled={importStaticMutation.isPending}
                className="font-code"
              >
                {importStaticMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
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
          </div>

          {/* Page Selector */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-code text-muted-foreground">Page:</span>
            </div>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-[250px] font-code">
                <SelectValue placeholder="Toutes les pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-code">
                  📂 Toutes les pages ({allKeys.size})
                </SelectItem>
                {allPages.map((page) => (
                  <SelectItem key={page} value={page} className="font-code">
                    {PAGE_LABELS[page] || page} ({pageKeyCounts[page] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={expandAll} className="font-code text-xs">
                Tout ouvrir
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="font-code text-xs">
                Tout fermer
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="font-code">
                <TabsTrigger value="all">{t("admin.translations.all")} ({filteredKeys.length})</TabsTrigger>
                <TabsTrigger value="auto">{t("admin.translations.auto")}</TabsTrigger>
                <TabsTrigger value="manual">{t("admin.translations.manual")}</TabsTrigger>
                <TabsTrigger value="missing">{t("admin.translations.missing")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content - Grouped by Section */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : Object.keys(groupedBySection).length === 0 ? (
              <div className="text-center text-muted-foreground font-code py-12">
                Aucune traduction trouvée
              </div>
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(groupedBySection)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([section, keys]) => {
                    const isExpanded = expandedSections.has(section);
                    return (
                      <div key={section}>
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(section)}
                          className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted/70 transition-colors text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-code font-medium text-sm">
                            {section}
                          </span>
                          <Badge variant="secondary" className="font-code text-xs">
                            {keys.length} clés
                          </Badge>
                        </button>

                        {/* Section Keys */}
                        {isExpanded && (
                          <div className="divide-y divide-border/50">
                            {keys.map((key) => (
                              <div key={key} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="font-mono text-xs text-muted-foreground mb-3">{key}</div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {(["fr", "en"] as Language[]).map((lang) => {
                                    const translation = getTranslation(key, lang);
                                    const isEditing = editingKey === `${key}:${lang}`;
                                    const value = translation?.value || staticTranslations[key]?.[lang];
                                    const isFromDb = !!translation;

                                    return (
                                      <div key={lang} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant={lang === "fr" ? "default" : "secondary"} className="font-code text-xs">
                                            {lang.toUpperCase()}
                                          </Badge>
                                          {isFromDb && (
                                            <Badge variant={translation.is_auto ? "outline" : "default"} className="text-xs">
                                              {translation.is_auto ? t("admin.translations.auto") : "Manuel"}
                                            </Badge>
                                          )}
                                          {!isFromDb && value && (
                                            <Badge variant="outline" className="text-xs">
                                              {t("admin.translations.static")}
                                            </Badge>
                                          )}
                                          {!value && (
                                            <Badge variant="destructive" className="text-xs">
                                              {t("admin.translations.missing")}
                                            </Badge>
                                          )}
                                        </div>
                                        {isEditing ? (
                                          <div className="flex gap-2">
                                            <Input
                                              value={editValue}
                                              onChange={(e) => setEditValue(e.target.value)}
                                              className="flex-1 font-code text-sm"
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
                                            className="text-sm font-code p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-accent/50 transition-colors"
                                            onClick={() => startEdit(key, lang)}
                                          >
                                            {value || <span className="text-destructive italic">{t("admin.translations.notDefined")}</span>}
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
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTranslations;
