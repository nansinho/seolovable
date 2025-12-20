import { CheckCircle, Clock, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DnsStatusBadgeProps {
  dnsVerified: boolean | null;
  txtRecordToken?: string | null;
  cnameTarget?: string | null;
  status: string;
  onVerify?: () => void;
  isVerifying?: boolean;
  showVerifyButton?: boolean;
  domain?: string;
}

export const DnsStatusBadge = ({
  dnsVerified,
  txtRecordToken,
  cnameTarget,
  status,
  onVerify,
  isVerifying = false,
  showVerifyButton = true,
  domain,
}: DnsStatusBadgeProps) => {
  // Determine DNS status
  const getDnsStatus = () => {
    if (dnsVerified === true) {
      return {
        label: "DNS vérifié",
        icon: CheckCircle,
        className: "bg-primary/20 text-primary border-primary/30",
      };
    }
    if (status === "pending" && (txtRecordToken || cnameTarget)) {
      return {
        label: "En attente de vérification DNS",
        icon: Clock,
        className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      };
    }
    if (status === "error") {
      return {
        label: "Erreur DNS",
        icon: AlertTriangle,
        className: "bg-destructive/20 text-destructive border-destructive/30",
      };
    }
    return {
      label: "Configuration DNS requise",
      icon: Clock,
      className: "bg-muted text-muted-foreground border-border",
    };
  };

  const dnsStatus = getDnsStatus();
  const Icon = dnsStatus.icon;

  // Nom de l'enregistrement TXT (la plupart des registrars ajoutent le domaine automatiquement)
  const displayDomain = domain || "votre-domaine.com";
  const txtRecordName = `_seolovable`;

  return (
    <div className="space-y-3">
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono",
        dnsStatus.className
      )}>
        <Icon className="w-3.5 h-3.5" />
        {dnsStatus.label}
      </div>

      {txtRecordToken && !dnsVerified && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
          <p className="text-sm font-mono text-muted-foreground">
            Configurez votre DNS avec l'enregistrement TXT suivant (le nom/host doit être <code className="text-primary">_seolovable</code> — certains registrars demandent <code className="text-primary">_seolovable.{displayDomain}</code>) :
          </p>
          <div className="p-3 rounded bg-background border border-border font-mono text-sm space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Type :</span>
              <code className="text-primary">TXT</code>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Nom / Host :</span>
              <code className="text-primary select-all break-all">{txtRecordName}</code>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Valeur :</span>
              <code className="text-primary select-all break-all">{txtRecordToken}</code>
            </div>
          </div>
          
          {showVerifyButton && onVerify && (
            <Button
              variant="outline"
              size="sm"
              onClick={onVerify}
              disabled={isVerifying}
              className="font-mono"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Vérifier DNS
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Fallback to CNAME display if no TXT token */}
      {!txtRecordToken && cnameTarget && !dnsVerified && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
          <p className="text-sm font-mono text-muted-foreground">
            Configurez votre DNS avec l'enregistrement CNAME suivant :
          </p>
          <div className="p-3 rounded bg-background border border-border font-mono text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">CNAME :</span>
              <code className="text-primary select-all">{cnameTarget}</code>
            </div>
          </div>
          
          {showVerifyButton && onVerify && (
            <Button
              variant="outline"
              size="sm"
              onClick={onVerify}
              disabled={isVerifying}
              className="font-mono"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Vérifier DNS
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
