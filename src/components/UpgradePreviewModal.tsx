import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Check, CreditCard, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProrationPreview {
  credit: number;
  debit: number;
  amountDue: number;
  renewalDate: string;
  currentPlan: string;
  newPlan: string;
  currency: string;
}

interface UpgradePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: ProrationPreview | null;
  isLoading: boolean;
  isConfirming: boolean;
  lang: "fr" | "en";
}

const PLAN_LABELS: Record<string, { fr: string; en: string }> = {
  starter: { fr: "Starter", en: "Starter" },
  pro: { fr: "Pro", en: "Pro" },
  business: { fr: "Business", en: "Business" },
  free: { fr: "Gratuit", en: "Free" },
};

const PLAN_PRICES: Record<string, number> = {
  starter: 29,
  pro: 59,
  business: 99,
};

const formatCurrency = (cents: number, currency: string = "eur") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
};

const formatDate = (isoDate: string, lang: "fr" | "en") => {
  return new Date(isoDate).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const UpgradePreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  preview,
  isLoading,
  isConfirming,
  lang,
}: UpgradePreviewModalProps) => {
  const content = {
    fr: {
      title: "Confirmation du changement de plan",
      subtitle: "Voici le détail de votre changement d'abonnement",
      currentPlan: "Plan actuel",
      newPlan: "Nouveau plan",
      credit: "Crédit jours restants",
      debit: "Prorata nouveau plan",
      total: "À payer maintenant",
      renewalDate: "Prochaine facturation",
      renewalAmount: "Montant au renouvellement",
      confirm: "Confirmer le changement",
      cancel: "Annuler",
      loading: "Calcul en cours...",
      perMonth: "/mois",
    },
    en: {
      title: "Confirm plan change",
      subtitle: "Here's the breakdown of your subscription change",
      currentPlan: "Current plan",
      newPlan: "New plan",
      credit: "Credit for remaining days",
      debit: "Prorated new plan cost",
      total: "Pay now",
      renewalDate: "Next billing date",
      renewalAmount: "Renewal amount",
      confirm: "Confirm change",
      cancel: "Cancel",
      loading: "Calculating...",
      perMonth: "/mo",
    },
  };

  const t = content[lang];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-accent" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.subtitle}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          </div>
        ) : preview ? (
          <div className="space-y-6 py-4">
            {/* Plan change visualization */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{t.currentPlan}</p>
                <p className="font-semibold">{PLAN_LABELS[preview.currentPlan]?.[lang] || preview.currentPlan}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{t.newPlan}</p>
                <p className="font-semibold text-accent">{PLAN_LABELS[preview.newPlan]?.[lang] || preview.newPlan}</p>
              </div>
            </div>

            {/* Proration breakdown */}
            <div className="space-y-3">
              {preview.credit > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.credit}</span>
                  <span className="text-green-500 font-medium">
                    -{formatCurrency(preview.credit, preview.currency)}
                  </span>
                </div>
              )}
              
              {preview.debit > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.debit}</span>
                  <span className="font-medium">
                    +{formatCurrency(preview.debit, preview.currency)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-accent" />
                    {t.total}
                  </span>
                  <span className={cn(
                    "text-xl font-bold",
                    preview.amountDue > 0 ? "text-accent" : "text-green-500"
                  )}>
                    {formatCurrency(preview.amountDue, preview.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Renewal info */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.renewalDate}
                </span>
                <span className="font-medium">{formatDate(preview.renewalDate, lang)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t.renewalAmount}</span>
                <span className="font-medium">
                  {PLAN_PRICES[preview.newPlan] || 0}€{t.perMonth}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isConfirming}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t.confirm}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
