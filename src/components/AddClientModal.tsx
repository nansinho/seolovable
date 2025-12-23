import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Validation schema
const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom doit faire moins de 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, "Le nom contient des caractères non autorisés"),
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email doit faire moins de 255 caractères")
    .optional()
    .or(z.literal("")),
  plan: z.enum(["basic", "pro", "enterprise"]),
});

type ClientFormData = z.infer<typeof clientSchema>;

// Domain validation regex
const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClientModal({ open, onClose, onSuccess }: AddClientModalProps) {
  const [domains, setDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      plan: "basic",
    },
  });

  const validateDomain = (domain: string): boolean => {
    if (!domain) return false;
    if (domain.length > 253) {
      setDomainError("Le domaine est trop long");
      return false;
    }
    if (!DOMAIN_REGEX.test(domain)) {
      setDomainError("Format de domaine invalide");
      return false;
    }
    setDomainError(null);
    return true;
  };

  const handleAddDomain = () => {
    const domain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    
    if (!validateDomain(domain)) return;
    
    if (domains.includes(domain)) {
      setDomainError("Ce domaine existe déjà");
      return;
    }
    
    if (domains.length >= 10) {
      setDomainError("Maximum 10 domaines autorisés");
      return;
    }
    
    setDomains([...domains, domain]);
    setDomainInput("");
    setDomainError(null);
  };

  const handleRemoveDomain = (domain: string) => {
    setDomains(domains.filter(d => d !== domain));
  };

  const onSubmit = async (data: ClientFormData) => {
    if (domains.length === 0) {
      setDomainError("Au moins un domaine est requis");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("clients").insert({
        name: data.name,
        email: data.email || null,
        plan: data.plan,
        allowed_domains: domains,
        status: "active",
      });

      if (error) throw error;

      toast.success("Client créé avec succès");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erreur lors de la création du client");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setDomains([]);
    setDomainInput("");
    setDomainError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom du client"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemple.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Domaines autorisés *</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={domainInput}
                  onChange={e => {
                    setDomainInput(e.target.value);
                    setDomainError(null);
                  }}
                  placeholder="exemple.com"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDomain();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddDomain}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {domainError && (
                <p className="text-sm font-medium text-destructive">{domainError}</p>
              )}
              {domains.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {domains.map(domain => (
                    <Badge key={domain} variant="secondary" className="gap-1">
                      {domain}
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Création..." : "Créer le client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
