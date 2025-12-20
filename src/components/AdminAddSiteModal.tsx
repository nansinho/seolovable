import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  user_id: z.string().min(1, "L'utilisateur est requis"),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface AdminUser {
  id: string;
  email: string;
}

interface AdminAddSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSiteAdded: () => void;
  users: AdminUser[];
}

export function AdminAddSiteModal({ open, onOpenChange, onSiteAdded, users }: AdminAddSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      url: "",
      user_id: "",
    },
  });

  const onSubmit = async (data: SiteFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("sites").insert({
        name: data.name,
        url: data.url,
        user_id: data.user_id,
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
          <DialogTitle className="font-code text-destructive">Ajouter un site (Admin)</DialogTitle>
          <DialogDescription>
            Créez un site pour n'importe quel utilisateur.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-code">Utilisateur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-code">
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="font-code">
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className="font-code bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ajouter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
