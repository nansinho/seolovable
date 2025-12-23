import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SimulateCrawlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  siteName: string;
  siteToken: string; // Required for authentication
  onSuccess?: () => void;
}

const BOT_OPTIONS = [
  { value: "googlebot", label: "Googlebot", type: "search", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { value: "bingbot", label: "Bingbot", type: "search", userAgent: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" },
  { value: "gptbot", label: "GPTBot (OpenAI)", type: "ai", userAgent: "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.0; +https://openai.com/gptbot)" },
  { value: "claudebot", label: "ClaudeBot (Anthropic)", type: "ai", userAgent: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com)" },
  { value: "perplexitybot", label: "PerplexityBot", type: "ai", userAgent: "Mozilla/5.0 (compatible; PerplexityBot/1.0)" },
  { value: "yandexbot", label: "YandexBot", type: "search", userAgent: "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)" },
];

export function SimulateCrawlModal({ open, onOpenChange, siteId, siteName, siteToken, onSuccess }: SimulateCrawlModalProps) {
  const [selectedBot, setSelectedBot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSimulate = async () => {
    if (!selectedBot) {
      toast.error("Veuillez sélectionner un bot");
      return;
    }

    const bot = BOT_OPTIONS.find((b) => b.value === selectedBot);
    if (!bot) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("log-crawl", {
        body: {
          siteId,
          userAgent: bot.userAgent,
          pagesCrawled: 1,
          token: siteToken, // Required for authentication
        },
      });

      if (error) throw error;

      if (data?.logged) {
        setResult({
          success: true,
          message: `Crawl simulé avec succès ! Bot: ${data.botName} (${data.botType})`,
        });
        toast.success(`Crawl ${bot.label} simulé avec succès`);
        onSuccess?.();
      } else {
        setResult({
          success: false,
          message: data?.reason || "Le crawl n'a pas été enregistré",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setResult({ success: false, message });
      toast.error("Erreur lors de la simulation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setSelectedBot("");
    onOpenChange(false);
  };

  const selectedBotInfo = BOT_OPTIONS.find((b) => b.value === selectedBot);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-code flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Simuler un crawl bot
          </DialogTitle>
          <DialogDescription>
            Testez l'enregistrement d'activité bot pour <strong>{siteName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Choisir un bot à simuler</label>
            <Select value={selectedBot} onValueChange={setSelectedBot}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un bot..." />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Moteurs de recherche
                </div>
                {BOT_OPTIONS.filter((b) => b.type === "search").map((bot) => (
                  <SelectItem key={bot.value} value={bot.value}>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      {bot.label}
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Bots IA
                </div>
                {BOT_OPTIONS.filter((b) => b.type === "ai").map((bot) => (
                  <SelectItem key={bot.value} value={bot.value}>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-500" />
                      {bot.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBotInfo && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground font-code break-all">
                <span className="font-semibold">User-Agent:</span>
                <br />
                {selectedBotInfo.userAgent}
              </p>
            </div>
          )}

          {result && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                result.success
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Fermer
            </Button>
            <Button onClick={handleSimulate} disabled={loading || !selectedBot} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulation...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Simuler le crawl
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
