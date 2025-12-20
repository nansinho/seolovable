import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Terminal,
  ArrowLeft,
  User,
  Bell,
  Shield,
  Loader2,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Settings = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      setFormData({
        fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
        email: session.user.email || "",
      });

      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.fullName,
      },
    });

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Profil mis à jour");
    }
    setSaving(false);
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const name = formData.fullName || user.email || "";
    if (name.includes("@")) return name[0].toUpperCase();
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-code">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-code font-bold text-primary">SEO Lovable</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-code text-primary mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </div>

        {/* Profile Section */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-code text-foreground">Profil</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={getUserAvatar() || undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-code">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-code text-center">
                Avatar synchronisé avec Google
              </p>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-code">Nom complet</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="font-code"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-code">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="font-code bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="font-code glow-green"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-code text-foreground">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-code text-foreground">Notifications par email</p>
                <p className="text-sm text-muted-foreground">Recevez des notifications importantes par email</p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-code text-foreground">Rapport hebdomadaire</p>
                <p className="text-sm text-muted-foreground">Recevez un résumé de vos statistiques chaque semaine</p>
              </div>
              <Switch
                checked={preferences.weeklyReport}
                onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReport: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-code text-foreground">Alertes de crawl</p>
                <p className="text-sm text-muted-foreground">Soyez alerté lors d'une activité inhabituelle</p>
              </div>
              <Switch
                checked={preferences.crawlAlerts}
                onCheckedChange={(checked) => setPreferences({ ...preferences, crawlAlerts: checked })}
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-code text-foreground">Sécurité</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-code text-foreground">Connexion Google</p>
                <p className="text-sm text-muted-foreground">Votre compte est lié à Google</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Check className="w-4 h-4" />
                <span className="text-sm font-code">Connecté</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="font-code text-destructive mb-2">Zone dangereuse</p>
              <p className="text-sm text-muted-foreground mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
              </p>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-code">
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
