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

const siteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du site est requis")
    .max(100, "Le nom doit faire moins de 100 caractères"),
  url: z
    .string()
    .trim()
    .min(1, "L'URL est requise")
    .url("L'URL doit être valide (ex: https://example.com)")
    .max(255, "L'URL doit faire moins de 255 caractères"),
});

type SiteFormData = z.infer<typeof siteSchema>;

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

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      url: "",
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
      toast.error("Vous avez atteint la limite de sites pour votre plan");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Vous devez être connecté pour ajouter un site");
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
        user_id: session.user.id,
        status: "pending",
        cname_target: cnameTarget,
        txt_record_token: txtToken,
        dns_verified: false,
      });

      if (error) {
        console.error("Error adding site:", error);
        toast.error("Erreur lors de l'ajout du site");
        return;
      }

      // Show TXT record instructions
      setNewSiteData({ txtToken, txtRecordName, domain });
      toast.success("Site ajouté avec succès");
      form.reset();
      onSiteAdded();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyName = async () => {
    if (newSiteData) {
      await navigator.clipboard.writeText(`_seolovable`);
      setCopied("name");
      toast.success("Nom copié !");
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyValue = async () => {
    if (newSiteData?.txtToken) {
      await navigator.clipboard.writeText(newSiteData.txtToken);
      setCopied("value");
      toast.success("Token copié !");
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
                Configuration DNS requise
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                Ajouter un site
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {newSiteData 
              ? "Suivez ces 3 étapes pour vérifier votre domaine"
              : "Ajoutez un nouveau site à surveiller pour le SEO dynamique."
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Accédez à votre gestionnaire DNS</h4>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous au panneau de contrôle de votre registrar (OVH, Cloudflare, Gandi, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-3">Créez un enregistrement TXT</h4>
                  
                  <div className="space-y-3">
                    {/* Type */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Type</span>
                          <span className="font-mono font-bold text-primary text-lg">TXT</span>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="p-3 rounded-lg bg-primary/5 border-2 border-primary/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground block mb-1">Nom / Host</span>
                          <code className="font-mono font-bold text-primary text-base break-all">_seolovable</code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyName}
                          className="flex-shrink-0 h-8 px-2"
                        >
                          {copied === "name" ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="p-3 rounded-lg bg-secondary/10 border-2 border-secondary/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground block mb-1">Valeur</span>
                          <code className="font-mono font-bold text-secondary text-sm break-all">{newSiteData.txtToken}</code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyValue}
                          className="flex-shrink-0 h-8 px-2"
                        >
                          {copied === "value" ? (
                            <CheckCircle className="w-4 h-4 text-secondary" />
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Sauvegardez et patientez</h4>
                  <p className="text-sm text-muted-foreground">
                    La propagation DNS peut prendre <span className="text-primary font-medium">jusqu'à 48h</span>. 
                    Nous vérifierons automatiquement votre configuration.
                  </p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Pourquoi cette vérification ?</span><br />
                L'enregistrement TXT prouve que vous êtes le propriétaire du domaine <span className="text-primary font-mono">{newSiteData.domain}</span>
              </p>
            </div>

            <Button onClick={handleClose} className="w-full font-code glow-green">
              <CheckCircle className="w-4 h-4 mr-2" />
              J'ai configuré mon DNS
            </Button>
          </div>
        ) : !canAddSite ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous avez atteint la limite de {userPlan?.sites_limit} site(s) pour votre plan {userPlan?.plan_type}.
              Passez à un plan supérieur pour ajouter plus de sites.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-sm text-muted-foreground font-code mb-2">
                {remainingSites === Infinity ? (
                  <span className="text-primary">∞ sites disponibles (illimité)</span>
                ) : (
                  <span>{remainingSites} site(s) restant(s) sur votre plan</span>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code">Nom du site</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mon site web"
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
                    <FormLabel className="font-code">URL</FormLabel>
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

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="font-code"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-code glow-green"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
