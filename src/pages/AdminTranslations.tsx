import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { staticTranslations, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Languages, RefreshCw, Search, Save, Check, X, Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface TranslationRow {
  id: string;
  key: string;
  lang: string;
  value: string;
  is_auto: boolean;
}

const AdminTranslations = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "auto" | "manual" | "missing">("all");
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
  const allKeys = new Set([
    ...Object.keys(staticTranslations),
    ...(translations?.map((t) => t.key) || []),
  ]);

  const getTranslation = (key: string, lang: Language): TranslationRow | undefined => {
    return translations?.find((t) => t.key === key && t.lang === lang);
  };

  const filteredKeys = Array.from(allKeys).filter((key) => {
    if (search && !key.toLowerCase().includes(search.toLowerCase())) return false;
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

  const startEdit = (key: string, lang: Language) => {
    const existing = getTranslation(key, lang);
    setEditingKey(`${key}:${lang}`);
    setEditLang(lang);
    setEditValue(existing?.value || staticTranslations[key]?.[lang] || "");
  };

  const saveEdit = (key: string) => {
    saveMutation.mutate({ key, lang: editLang, value: editValue });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Languages className="h-8 w-8" />
                  Gestion des traductions
                </h1>
                <p className="text-muted-foreground mt-1">
                  {translations?.length || 0} traductions en base · {allKeys.size} clés uniques
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => importStaticMutation.mutate()}
                  disabled={importStaticMutation.isPending}
                >
                  {importStaticMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Importer statiques
                </Button>
                <Button
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Traduire manquantes
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une clé..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                    <TabsList>
                      <TabsTrigger value="all">Toutes</TabsTrigger>
                      <TabsTrigger value="auto">Auto</TabsTrigger>
                      <TabsTrigger value="manual">Manuelles</TabsTrigger>
                      <TabsTrigger value="missing">Manquantes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredKeys.map((key) => (
                      <div key={key} className="border rounded-lg p-4 space-y-3">
                        <div className="font-mono text-sm text-muted-foreground">{key}</div>
                        <div className="grid grid-cols-2 gap-4">
                          {(["fr", "en"] as Language[]).map((lang) => {
                            const translation = getTranslation(key, lang);
                            const isEditing = editingKey === `${key}:${lang}`;
                            const value = translation?.value || staticTranslations[key]?.[lang];
                            const isFromDb = !!translation;

                            return (
                              <div key={lang} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={lang === "fr" ? "default" : "secondary"}>
                                    {lang.toUpperCase()}
                                  </Badge>
                                  {isFromDb && (
                                    <Badge variant={translation.is_auto ? "outline" : "default"} className="text-xs">
                                      {translation.is_auto ? "Auto" : "Manuel"}
                                    </Badge>
                                  )}
                                  {!isFromDb && value && (
                                    <Badge variant="outline" className="text-xs">
                                      Statique
                                    </Badge>
                                  )}
                                  {!value && (
                                    <Badge variant="destructive" className="text-xs">
                                      Manquant
                                    </Badge>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="flex-1"
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
                                    className="text-sm p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => startEdit(key, lang)}
                                  >
                                    {value || <span className="text-destructive italic">Non défini</span>}
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminTranslations;
