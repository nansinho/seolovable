import { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, RefreshCw, Loader2, Copy, Shield, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface DnsConfigCardProps {
  dnsVerified: boolean | null;
  txtRecordToken?: string | null;
  status: string;
  onVerify?: () => void;
  isVerifying?: boolean;
  domain?: string;
  dnsVerifiedAt?: string | null;
}

export function DnsConfigCard({
  dnsVerified,
  txtRecordToken,
  status,
  onVerify,
  isVerifying = false,
  domain,
  dnsVerifiedAt,
}: DnsConfigCardProps) {
  const { t, lang } = useI18n();
  const [copiedName, setCopiedName] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const displayDomain = domain || "votre-domaine.com";
  const txtRecordName = "_seolovable";

  const handleCopy = async (text: string, type: "name" | "value") => {
    await navigator.clipboard.writeText(text);
    if (type === "name") {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else {
      setCopiedValue(true);
      setTimeout(() => setCopiedValue(false), 2000);
    }
    toast.success("Copié !");
  };

  const getDnsStatus = () => {
    if (dnsVerified === true) {
      return {
        label: "DNS vérifié",
        description: "Votre domaine est correctement configuré",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
      };
    }
    if (status === "pending" && txtRecordToken) {
      return {
        label: "En attente de vérification",
        description: "Ajoutez l'enregistrement TXT puis cliquez sur Vérifier",
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
      };
    }
    if (status === "error") {
      return {
        label: "Erreur de configuration",
        description: "Vérifiez votre configuration DNS",
        icon: AlertTriangle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
      };
    }
    return {
      label: "Configuration requise",
      description: "Ajoutez l'enregistrement DNS pour activer le site",
      icon: Shield,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border",
    };
  };

  const dnsStatus = getDnsStatus();
  const StatusIcon = dnsStatus.icon;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", dnsStatus.bgColor, `border ${dnsStatus.borderColor}`)}>
            <Shield className={cn("w-5 h-5", dnsStatus.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Configuration DNS</h3>
            <p className="text-xs text-muted-foreground">Vérification de propriété du domaine</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium", dnsStatus.bgColor, dnsStatus.borderColor, "border")}>
          <StatusIcon className={cn("w-3.5 h-3.5", dnsStatus.color)} />
          <span className={dnsStatus.color}>{dnsStatus.label}</span>
        </div>
      </div>

      {/* Verified State */}
      {dnsVerified && (
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-foreground">Domaine vérifié avec succès</p>
              {dnsVerifiedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vérifié le {new Date(dnsVerifiedAt).toLocaleDateString(dateLocale)} à{" "}
                  {new Date(dnsVerifiedAt).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Instructions */}
      {txtRecordToken && !dnsVerified && (
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Comment ça fonctionne ?</p>
              <p className="text-xs text-muted-foreground">
                Pour prouver que vous êtes propriétaire de <strong>{displayDomain}</strong>, ajoutez un enregistrement TXT dans votre gestionnaire DNS (OVH, Cloudflare, GoDaddy, etc.).
              </p>
            </div>
          </div>

          {/* DNS Record to Add */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              Enregistrement DNS à ajouter
            </h4>

            <div className="space-y-3">
              {/* Type */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Type</span>
                  <code className="text-sm font-mono text-primary font-medium">TXT</code>
                </div>
              </div>

              {/* Name/Host */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs text-muted-foreground">Nom / Hôte</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            Certains hébergeurs demandent juste <code>_seolovable</code>, d'autres le nom complet <code>_seolovable.{displayDomain}</code>. Essayez d'abord le nom court.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <code className="text-sm font-mono text-primary font-medium break-all">{txtRecordName}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(txtRecordName, "name")}
                  className="h-8 w-8 shrink-0"
                >
                  {copiedName ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Value */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground block mb-0.5">Valeur / Contenu</span>
                  <code className="text-sm font-mono text-primary font-medium break-all">{txtRecordToken}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(txtRecordToken, "value")}
                  className="h-8 w-8 shrink-0"
                >
                  {copiedValue ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Verify Button */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              Vérifier la configuration
            </h4>

            <p className="text-xs text-muted-foreground mb-4">
              Après avoir ajouté l'enregistrement DNS, attendez quelques minutes (la propagation peut prendre jusqu'à 24h), puis cliquez sur le bouton ci-dessous.
            </p>

            {onVerify && (
              <Button onClick={onVerify} disabled={isVerifying} className="w-full sm:w-auto">
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Vérifier le DNS
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Common Registrars Help */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>Où trouver les paramètres DNS ?</span>
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground space-y-2">
              <p><strong className="text-foreground">OVH :</strong> Manager → Domaines → Zone DNS → Ajouter une entrée</p>
              <p><strong className="text-foreground">Cloudflare :</strong> Dashboard → DNS → Records → Add record</p>
              <p><strong className="text-foreground">GoDaddy :</strong> My Products → DNS → Manage → Add</p>
              <p><strong className="text-foreground">Ionos :</strong> Domain & SSL → DNS Settings → Add record</p>
              <p><strong className="text-foreground">Gandi :</strong> Domain → DNS Records → Add record</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
