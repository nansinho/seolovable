import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, Copy, CheckCircle, Globe, Settings, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useI18n } from "@/lib/i18n";

type SiteFormData = {
  name: string;
  url: string;
  originUrl: string;
};

interface AddSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSiteAdded: () => void;
  currentSitesCount: number;
}

interface UserPlan {
  plan_type: string;
  sites_limit: number;
}

// Generate a unique verification token
function generateVerificationToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "seolovable-verify-";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function AddSiteModal({ open, onOpenChange, onSiteAdded, currentSitesCount }: AddSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSiteData, setNewSiteData] = useState<{ txtToken: string; txtRecordName: string; domain: string } | null>(null);
  const [copied, setCopied] = useState<"name" | "value" | null>(null);
  const { t } = useI18n();

  const siteSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("addSite.siteNameRequired"))
      .max(100, t("addSite.siteNameMax")),
    url: z
      .string()
      .trim()
      .min(1, t("addSite.urlRequired"))
      .url(t("addSite.urlInvalid"))
      .max(255, t("addSite.urlMax")),
    originUrl: z
      .string()
      .trim()
      .min(1, t("addSite.originUrlRequired") || "L'URL origin est requise")
      .url(t("addSite.originUrlInvalid") || "L'URL origin n'est pas valide")
      .max(255, t("addSite.urlMax")),
  });

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      url: "",
      originUrl: "",
    },
  });

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!open) return;
      
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Check if user is admin (admins have unlimited access)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        // Admin = unlimited
        setUserPlan({ plan_type: "admin", sites_limit: -1 });
        setLoading(false);
        return;
      }

      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan_type, sites_limit")
        .eq("user_id", session.user.id)
        .single();

      setUserPlan(planData || { plan_type: "free", sites_limit: 1 });
      setLoading(false);
    };

    fetchUserPlan();
  }, [open]);

  const canAddSite = userPlan ? (userPlan.sites_limit === -1 || currentSitesCount < userPlan.sites_limit) : false;
  const remainingSites = userPlan?.sites_limit === -1 ? Infinity : (userPlan?.sites_limit || 1) - currentSitesCount;

  const onSubmit = async (data: SiteFormData) => {
    if (!canAddSite) {
      toast.error(t("addSite.limitReached") + " " + userPlan?.sites_limit + " " + t("addSite.siteFor"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error(t("addSite.loginRequired"));
        return;
      }

      // Generate TXT verification token
      const txtToken = generateVerificationToken();
      
      // Extract domain from URL
      let domain = "";
      try {
        const urlObj = new URL(data.url);
        domain = urlObj.hostname;
      } catch {
        domain = "example.com";
      }

      const txtRecordName = `_seolovable.${domain}`;

      // Also generate CNAME for backwards compatibility (prerender routing)
      const cnameTarget = `${domain.replace(/\./g, "-")}.prerender.seolovable.fr`;

      const { error } = await supabase.from("sites").insert({
        name: data.name,
        url: data.url,
        origin_url: data.originUrl,
        user_id: session.user.id,
        status: "pending",
        cname_target: cnameTarget,
        txt_record_token: txtToken,
        dns_verified: false,
      });

      if (error) {
        console.error("Error adding site:", error);
        toast.error(t("addSite.error"));
        return;
      }

      // Show TXT record instructions
      setNewSiteData({ txtToken, txtRecordName, domain });
      toast.success(t("addSite.success"));
      form.reset();
      onSiteAdded();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyName = async () => {
    if (newSiteData) {
      await navigator.clipboard.writeText(`_seolovable`);
      setCopied("name");
      toast.success(t("addSite.nameCopied"));
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyValue = async () => {
    if (newSiteData?.txtToken) {
      await navigator.clipboard.writeText(newSiteData.txtToken);
      setCopied("value");
      toast.success(t("addSite.tokenCopied"));
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleClose = () => {
    setNewSiteData(null);
    setCopied(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-code text-primary flex items-center gap-2">
            {newSiteData ? (
              <>
                <Settings className="w-5 h-5" />
                {t("addSite.dnsTitle")}
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                {t("addSite.title")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {newSiteData 
              ? t("addSite.dnsDescription")
              : t("addSite.description")
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : newSiteData ? (
          <div className="space-y-5">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{t("addSite.step1Title")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("addSite.step1Desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-3">{t("addSite.step2Title")}</h4>
                  
                  <div className="space-y-3">
                    {/* Type */}
                    <div className="p-3 rounded-lg bg-muted border border-border">
                      <span className="text-xs text-muted-foreground font-code">{t("addSite.type")}</span>
                      <p className="font-code font-bold text-accent text-lg">TXT</p>
                    </div>

                    {/* Name */}
                    <div className="p-3 rounded-lg bg-accent/10 border-2 border-accent/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground font-code">{t("addSite.name")}</span>
                          <p className="font-code font-bold text-accent text-base">_seolovable</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyName}
                          className="h-8 w-8"
                        >
                          {copied === "name" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Value - HIGHLIGHTED */}
                    <div className="p-3 rounded-lg bg-primary/10 border-2 border-primary/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground font-code">{t("addSite.value")}</span>
                          <p className="font-code font-bold text-primary text-base break-all">{newSiteData.txtToken}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyValue}
                          className="h-8 w-8"
                        >
                          {copied === "value" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{t("addSite.step3Title")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("addSite.step3Desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
              <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{t("addSite.whyVerify")}</span><br />
                {t("addSite.whyVerifyDesc")} <span className="text-accent font-code">{newSiteData.domain}</span>
              </p>
            </div>

            <Button onClick={handleClose} className="w-full font-code">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("addSite.dnsConfigured")}
            </Button>
          </div>
        ) : !canAddSite ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("addSite.limitReached")} {userPlan?.sites_limit} {t("addSite.siteFor")} {userPlan?.plan_type}.
              {t("addSite.upgradePrompt")}
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-sm text-muted-foreground font-code mb-2">
                {remainingSites === Infinity ? (
                  <span className="text-primary">∞ {t("addSite.unlimited")}</span>
                ) : (
                  <span>{remainingSites} {t("addSite.remaining")}</span>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code">{t("addSite.siteName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addSite.siteNamePlaceholder")}
                        className="font-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code">{t("addSite.url")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        className="font-code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code flex items-center gap-2">
                      {t("addSite.originUrl") || "Serveur Origin"}
                      <span className="text-xs font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">Important</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://mon-site.vercel.app"
                        className="font-code"
                        {...field}
                      />
                    </FormControl>
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-muted-foreground">
                        {t("addSite.originUrlHelp") || "L'URL où votre site est réellement hébergé (Vercel, Netlify, etc.)"}
                      </p>
                      <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                          ⚠️ Important : évitez les boucles !
                        </p>
                        <p className="text-xs text-muted-foreground">
                          L'origin URL doit pointer vers un serveur <strong>différent</strong> du domaine principal.
                        </p>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 ml-3 list-disc">
                          <li><span className="text-green-500">✓</span> <code className="font-code text-primary">https://mon-site.vercel.app</code></li>
                          <li><span className="text-green-500">✓</span> <code className="font-code text-primary">https://origin.example.com</code></li>
                          <li><span className="text-red-500">✗</span> <code className="font-code text-red-400">https://example.com</code> (boucle !)</li>
                        </ul>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="font-code"
                >
                  {t("addSite.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-code glow-green"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("addSite.add")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}