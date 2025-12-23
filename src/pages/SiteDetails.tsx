import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Globe2,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bot,
  TrendingUp,
  Calendar,
  FileText,
  Play,
  Lock,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";
import { DnsConfigCard } from "@/components/DnsConfigCard";
import { PrerenderTestModal } from "@/components/PrerenderTestModal";
import { SimulateCrawlModal } from "@/components/SimulateCrawlModal";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useI18n } from "@/lib/i18n";
import { IntegrationGuide } from "@/components/IntegrationGuide";
import { SitePrerenderStats } from "@/components/SitePrerenderStats";

interface Site {
  id: string;
  name: string;
  url: string | null;
  status: string;
  pages_rendered: number;
  last_crawl: string | null;
  created_at: string;
  cname_target: string | null;
  txt_record_token: string | null;
  dns_verified: boolean | null;
  dns_verified_at: string | null;
  detected_txt_name?: string | null;
  prerender_token?: string | null;
}


const SiteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [prerenderTestOpen, setPrerenderTestOpen] = useState(false);
  const [simulateCrawlOpen, setSimulateCrawlOpen] = useState(false);

  const { checkIfBlocked } = useBlockedUserCheck();

  const getDomain = (url: string | null): string => {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const isBlocked = await checkIfBlocked(session.user.id);
      if (isBlocked) return;

      if (!id) {
        navigate("/dashboard");
        return;
      }

      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id, name, url, status, pages_rendered, last_crawl, created_at, cname_target, txt_record_token, dns_verified, dns_verified_at, prerender_token")
        .eq("id", id)
        .maybeSingle();

      if (siteError || !siteData) {
        toast.error(t("siteDetails.notFound"));
        navigate("/dashboard");
        return;
      }

      setSite(siteData as Site);

      setLoading(false);
    };

    checkAuthAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, checkIfBlocked]);

  const handleStatusChange = async (checked: boolean) => {
    if (!site) return;

    if (checked && !site.dns_verified) {
      toast.error(t("siteDetails.dnsNotVerified"));
      return;
    }

    setUpdatingStatus(true);
    const newStatus = checked ? "active" : "pending";

    const { error } = await supabase.from("sites").update({ status: newStatus }).eq("id", site.id);

    if (error) toast.error(t("siteDetails.statusUpdateError"));
    else {
      setSite({ ...site, status: newStatus });
      toast.success(checked ? t("siteDetails.siteActivated") : t("siteDetails.siteDeactivated"));
    }

    setUpdatingStatus(false);
  };

  const handleVerifyDns = async () => {
    if (!site) return;

    setVerifyingDns(true);
    try {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        toast.error(t("siteDetails.sessionExpired"));
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      const session = refreshed?.session;
      if (!session?.access_token) {
        toast.error(t("siteDetails.sessionExpired"));
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-dns", {
        body: { siteId: site.id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.error?.includes("Authentication")) {
        toast.error(t("siteDetails.sessionExpired"));
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      if (data.verified) {
        setSite({
          ...site,
          dns_verified: true,
          dns_verified_at: new Date().toISOString(),
          status: "active",
          detected_txt_name: data.txt_record_name || null,
        });
        toast.success(t("siteDetails.dnsVerified"));
      } else {
        toast.error(data.message || t("siteDetails.dnsNotConfigured"));
      }
    } catch {
      toast.error(t("siteDetails.dnsVerifyError"));
    } finally {
      setVerifyingDns(false);
    }
  };


  const handleRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id, name, url, status, pages_rendered, last_crawl, created_at, cname_target, txt_record_token, dns_verified, dns_verified_at, prerender_token")
        .eq("id", id)
        .maybeSingle();

      if (siteError || !siteData) {
        toast.error(t("siteDetails.refreshError"));
        return;
      }

      setSite((prev) => ({ ...siteData, detected_txt_name: prev?.detected_txt_name } as Site));


      toast.success(t("siteDetails.dataRefreshed"));
    } catch {
      toast.error(t("siteDetails.refreshError"));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-code">{t("common.loading")}</div>
      </div>
    );
  }

  if (!site) return null;

  const domain = getDomain(site.url);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <PrerenderTestModal open={prerenderTestOpen} onOpenChange={setPrerenderTestOpen} defaultUrl={site?.url || ""} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-code text-foreground">{site.name}</h1>
                {site.url && (
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" className="font-code" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {t("siteDetails.refresh")}
              </Button>
              <Button variant="outline" size="sm" className="font-code" onClick={() => setPrerenderTestOpen(true)}>
                <Play className="w-4 h-4 mr-2" />
                {t("siteDetails.testPrerender")}
              </Button>
              <Button variant="outline" size="sm" className="font-code" onClick={() => setSimulateCrawlOpen(true)}>
                <Bot className="w-4 h-4 mr-2" />
                {t("siteDetails.simulateCrawl")}
              </Button>
            </div>
          </div>

          {/* Site Info Card */}
          <div className="p-4 lg:p-6 rounded-xl border border-border bg-card mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-2">
                  {site.status === "active" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : site.status === "pending" ? (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="font-code text-sm text-foreground">
                    {site.status === "active" ? t("siteDetails.active") : site.status === "pending" ? t("siteDetails.pending") : t("siteDetails.error")}
                  </span>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {!site.dns_verified && site.status !== "active" && <Lock className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm text-muted-foreground font-code">{t("siteDetails.activate")}</span>
                      <Switch
                        checked={site.status === "active"}
                        onCheckedChange={handleStatusChange}
                        disabled={updatingStatus || (!site.dns_verified && site.status !== "active")}
                      />
                    </div>
                  </TooltipTrigger>
                  {!site.dns_verified && site.status !== "active" && (
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm">{t("siteDetails.dnsTooltip")}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-code">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("siteDetails.createdOn")} {new Date(site.created_at).toLocaleDateString(dateLocale)}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {site.pages_rendered.toLocaleString()} {t("siteDetails.pagesRendered")}
              </div>
              {site.last_crawl && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t("siteDetails.lastCrawl")} {new Date(site.last_crawl).toLocaleString(dateLocale)}
                </div>
              )}
            </div>
          </div>

          {/* DNS Configuration */}
          <div className="mb-6">
            <DnsConfigCard
              dnsVerified={site.dns_verified}
              txtRecordToken={site.txt_record_token}
              status={site.status}
              onVerify={handleVerifyDns}
              isVerifying={verifyingDns}
              domain={domain}
              dnsVerifiedAt={site.dns_verified_at}
            />
          </div>

          {/* Integration Guide - Only show if DNS verified */}
          {site.dns_verified && site.prerender_token && (
            <div className="mb-6">
              <IntegrationGuide prerenderToken={site.prerender_token} siteUrl={site.url || ""} />
            </div>
          )}

          {/* Prerender Stats */}
          <div className="mb-6">
            <SitePrerenderStats siteId={site.id} />
          </div>

        </div>
      </main>

      <SimulateCrawlModal open={simulateCrawlOpen} onOpenChange={setSimulateCrawlOpen} siteId={site?.id || ""} siteName={site?.name || ""} siteToken={site?.prerender_token || ""} onSuccess={handleRefresh} />
    </div>
  );
};

export default SiteDetails;
