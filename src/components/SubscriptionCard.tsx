import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  CreditCard, 
  Download, 
  ExternalLink, 
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Invoice {
  id: string;
  number: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  createdAt: string;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  pdfUrl: string | null;
  description: string;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  createdAt: string;
  priceId: string;
  productId: string;
}

interface UpcomingInvoice {
  amountDue: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

interface SubscriptionCardProps {
  subscription: Subscription | null;
  invoices: Invoice[];
  upcomingInvoice: UpcomingInvoice | null;
  currentPlan: string;
  isLoading?: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  free: "Gratuit",
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "paid":
      return <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">Payée</Badge>;
    case "open":
      return <Badge variant="secondary">En attente</Badge>;
    case "draft":
      return <Badge variant="outline">Brouillon</Badge>;
    case "void":
      return <Badge variant="destructive">Annulée</Badge>;
    case "uncollectible":
      return <Badge variant="destructive">Impayée</Badge>;
    default:
      return <Badge variant="outline">{status || "Inconnu"}</Badge>;
  }
};

export const SubscriptionCard = ({ 
  subscription, 
  invoices, 
  upcomingInvoice,
  currentPlan,
  isLoading = false 
}: SubscriptionCardProps) => {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Impossible d'ouvrir le portail de gestion");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Details Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-code text-foreground flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-accent" />
                Abonnement
              </CardTitle>
              <CardDescription className="font-code">
                {subscription ? "Détails de votre abonnement actif" : "Aucun abonnement actif"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-code px-3 py-1 capitalize">
              {PLAN_NAMES[currentPlan] || currentPlan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-code">Début période</span>
                  </div>
                  <p className="font-code font-medium">
                    {format(new Date(subscription.currentPeriodStart), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-code">Prochain renouvellement</span>
                  </div>
                  <p className="font-code font-medium">
                    {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-code">
                      Votre abonnement sera annulé le{" "}
                      {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                </div>
              )}

              {upcomingInvoice && !subscription.cancelAtPeriodEnd && (
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-code text-muted-foreground mb-1">Prochaine facture</p>
                      <p className="font-code font-semibold text-lg text-foreground">
                        {formatCurrency(upcomingInvoice.amountDue, upcomingInvoice.currency)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground font-code">
                      le {format(new Date(upcomingInvoice.periodEnd), "d MMMM", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="font-code flex-1"
                  onClick={handleManageSubscription}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gérer l'abonnement
                </Button>
                <Link to="/upgrade" className="flex-1">
                  <Button variant="default" className="font-code w-full">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Changer de plan
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground font-code text-sm mb-4">
                Vous n'avez pas d'abonnement actif
              </p>
              <Link to="/upgrade">
                <Button className="font-code">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Découvrir nos offres
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-code text-foreground flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-accent" />
            Historique des factures
          </CardTitle>
          <CardDescription className="font-code">
            Vos {invoices.length} dernières factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground font-code py-8">
              Aucune facture disponible
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      invoice.status === "paid" ? "bg-green-500/10" : "bg-muted"
                    )}>
                      {invoice.status === "paid" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-code font-medium text-sm">
                        {invoice.number || `Facture ${invoice.id.slice(-8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground font-code">
                        {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(invoice.status)}
                    <p className="font-code font-bold text-sm min-w-[80px] text-right">
                      {formatCurrency(invoice.amountPaid || invoice.amountDue, invoice.currency)}
                    </p>
                    <div className="flex gap-2">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(invoice.hostedInvoiceUrl!, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
