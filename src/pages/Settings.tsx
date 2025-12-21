import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";
import { DashboardSidebar, MobileMenuButton } from "@/components/DashboardSidebar";
import { useI18n } from "@/lib/i18n";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReport: true,
    crawlAlerts: true,
  });

  const { checkIfBlocked } = useBlockedUserCheck();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const isBlocked = await checkIfBlocked(session.user.id);
      if (isBlocked) return;

      setUser(session.user);
      setFormData({
        fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
        email: session.user.email || "",
      });

      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate, checkIfBlocked]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: formData.fullName },
    });

    if (error) toast.error(t("settings.saveError"));
    else toast.success(t("settings.profileUpdated"));

    setSaving(false);
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const name = formData.fullName || user.email || "";
    if (name.includes("@")) return name[0].toUpperCase();
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground font-mono text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div>
              <h1 className="text-2xl font-bold font-code">{t("settings.title")}</h1>
              <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Profile */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold font-code text-foreground">{t("settings.profile")}</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={getUserAvatar() || undefined} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-code">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground font-code text-center">{t("settings.avatarSync")}</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-code">
                      {t("settings.fullName")}
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="font-code"
                      placeholder={t("settings.fullNamePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-code">
                      {t("settings.email")}
                    </Label>
                    <Input id="email" value={formData.email} disabled className="font-code bg-muted" />
                    <p className="text-xs text-muted-foreground">{t("settings.emailNotEditable")}</p>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="font-code">
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {t("settings.save")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold font-code text-foreground">{t("settings.notifications")}</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-code text-foreground">{t("settings.emailNotifications")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings.emailNotificationsDesc")}</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-code text-foreground">{t("settings.weeklyReport")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings.weeklyReportDesc")}</p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReport}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReport: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-code text-foreground">{t("settings.crawlAlerts")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings.crawlAlertsDesc")}</p>
                  </div>
                  <Switch
                    checked={preferences.crawlAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, crawlAlerts: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold font-code text-foreground">{t("settings.security")}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-code text-foreground">{t("settings.googleConnected")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings.linkedToGoogle")}</p>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-code">{t("settings.connected")}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <p className="font-code text-destructive mb-2">{t("settings.dangerZone")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("settings.deleteAccountWarning")}</p>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-code"
                  >
                    {t("settings.deleteAccount")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
