import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Client {
  id: string;
  name: string;
  email: string | null;
  prerender_token: string;
  plan: string;
  allowed_domains: string[];
  status: string;
}

interface EditClientModalProps {
  client: Client;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditClientModal({ client, open, onClose, onSuccess }: EditClientModalProps) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email || "");
  const [plan, setPlan] = useState(client.plan);
  const [domains, setDomains] = useState<string[]>(client.allowed_domains);
  const [domainInput, setDomainInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(client.name);
    setEmail(client.email || "");
    setPlan(client.plan);
    setDomains(client.allowed_domains);
  }, [client]);

  const handleAddDomain = () => {
    const domain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (domain && !domains.includes(domain)) {
      setDomains([...domains, domain]);
      setDomainInput("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setDomains(domains.filter(d => d !== domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (domains.length === 0) {
      toast.error("Au moins un domaine est requis");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: name.trim(),
          email: email.trim() || null,
          plan,
          allowed_domains: domains,
        })
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Client mis à jour");
      onSuccess();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nom du client"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-plan">Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Domaines autorisés *</Label>
            <div className="flex gap-2">
              <Input
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
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

          <div className="space-y-2">
            <Label>Token</Label>
            <code className="block text-xs bg-muted p-2 rounded break-all text-muted-foreground">
              ••••••••{client.prerender_token.slice(-4)}
            </code>
            <p className="text-xs text-muted-foreground">Token masqué pour la sécurité</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
