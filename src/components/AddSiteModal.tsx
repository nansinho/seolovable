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
import { Loader2, AlertCircle } from "lucide-react";
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

export function AddSiteModal({ open, onOpenChange, onSiteAdded, currentSitesCount }: AddSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { error } = await supabase.from("sites").insert({
        name: data.name,
        url: data.url,
        user_id: session.user.id,
        status: "pending",
      });

      if (error) {
        console.error("Error adding site:", error);
        toast.error("Erreur lors de l'ajout du site");
        return;
      }

      toast.success("Site ajouté avec succès");
      form.reset();
      onOpenChange(false);
      onSiteAdded();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-code text-primary">Ajouter un site</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau site à surveiller pour le SEO dynamique.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
                  onClick={() => onOpenChange(false)}
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
