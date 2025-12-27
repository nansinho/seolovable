import { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, RefreshCw, Loader2, Copy, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const { lang } = useI18n();
  const [copiedName, setCopiedName] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const [copiedCname, setCopiedCname] = useState(false);
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const txtRecordName = "_seolovable";
  const cnameTarget = "prerender.seolovable.cloud";

  const handleCopy = async (text: string, type: "name" | "value" | "cname") => {
    await navigator.clipboard.writeText(text);
    if (type === "name") {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else if (type === "value") {
      setCopiedValue(true);
      setTimeout(() => setCopiedValue(false), 2000);
    } else {
      setCopiedCname(true);
      setTimeout(() => setCopiedCname(false), 2000);
    }
    toast.success("Copié !");
  };

  const getDnsStatus = () => {
    if (dnsVerified === true) {
      return {
        label: "DNS vérifié",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    }
    if (status === "pending" && txtRecordToken) {
      return {
        label: "En attente",
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      };
    }
    if (status === "error") {
      return {
        label: "Erreur",
        icon: AlertTriangle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      };
    }
    return {
      label: "Configuration requise",
      icon: Shield,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    };
  };

  const dnsStatus = getDnsStatus();
  const StatusIcon = dnsStatus.icon;

  return (
    <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="font-code font-semibold text-foreground">Configuration DNS</h3>
        </div>

        <div className={cn("flex items-center gap-2 px-2 py-1 rounded text-xs font-code", dnsStatus.bgColor)}>
          <StatusIcon className={cn("w-3.5 h-3.5", dnsStatus.color)} />
          <span className={dnsStatus.color}>{dnsStatus.label}</span>
        </div>
      </div>

      {/* Verified State */}
      {dnsVerified && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="font-code text-sm text-foreground">Domaine vérifié</p>
                {dnsVerifiedAt && (
                  <p className="text-xs text-muted-foreground font-code">
                    {new Date(dnsVerifiedAt).toLocaleDateString(dateLocale)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CNAME Instructions for verified sites */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-primary" />
              <h4 className="font-code font-semibold text-foreground text-sm">Étape finale : Configurer le CNAME</h4>
            </div>
            <p className="text-xs text-muted-foreground font-code mb-3">
              Pour activer le prerendering automatique, pointez votre domaine vers notre proxy :
            </p>
            
            {/* CNAME Record */}
            <div className="space-y-2 mb-4">
              <div className="p-2 rounded bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground font-code">Type</span>
                <p className="font-code text-sm text-foreground font-bold">CNAME</p>
              </div>
              <div className="p-2 rounded bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground font-code">Nom / Hôte</span>
                <p className="font-code text-sm text-foreground">@ (ou votre domaine)</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border-2 border-primary/40 gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-code">Valeur (copier)</span>
                  <p className="font-code text-sm text-primary font-bold break-all">{cnameTarget}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(cnameTarget, "cname")}
                  className="h-8 w-8 shrink-0"
                >
                  {copiedCname ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-code font-semibold text-foreground mb-2">Comment ça fonctionne :</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Les <strong>bots</strong> (Google, GPT, etc.) reçoivent le HTML prérendu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Les <strong>humains</strong> sont redirigés vers votre serveur origin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Les crawls sont <strong>automatiquement enregistrés</strong> dans votre dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Instructions */}
      {txtRecordToken && !dnsVerified && (
        <div className="space-y-4">
          {/* Step 1: TXT Record */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="font-code font-semibold text-foreground text-sm">Vérification du domaine (TXT)</h4>
            </div>
            <p className="text-xs text-muted-foreground font-code mb-3">
              Ajoutez cet enregistrement TXT pour prouver que vous êtes propriétaire du domaine :
            </p>

            <div className="space-y-2">
              {/* Type */}
              <div className="p-2 rounded bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground font-code">Type</span>
                <p className="font-code text-sm text-foreground">TXT</p>
              </div>

              {/* Name/Host */}
              <div className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-code">Nom / Hôte</span>
                  <p className="font-code text-sm text-foreground break-all">{txtRecordName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(txtRecordName, "name")}
                  className="h-7 w-7 shrink-0"
                >
                  {copiedName ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>

              {/* Value */}
              <div className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-code">Valeur</span>
                  <p className="font-code text-sm text-foreground break-all">{txtRecordToken}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(txtRecordToken, "value")}
                  className="h-7 w-7 shrink-0"
                >
                  {copiedValue ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: CNAME Preview */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="font-code font-semibold text-muted-foreground text-sm">CNAME (après vérification)</h4>
            </div>
            <p className="text-xs text-muted-foreground font-code">
              Une fois le TXT vérifié, vous pourrez configurer le CNAME vers <span className="text-foreground">{cnameTarget}</span>
            </p>
          </div>

          {/* Verify Button */}
          {onVerify && (
            <Button onClick={onVerify} disabled={isVerifying} size="sm" className="font-code">
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
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
      )}
    </div>
  );
}
