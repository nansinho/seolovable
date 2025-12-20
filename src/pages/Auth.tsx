import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit faire au moins 6 caractères";
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = "Le nom est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate auth - will be replaced with Supabase
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: isLogin ? "Connexion réussie !" : "Compte créé !",
      description: "Redirection vers le dashboard...",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 matrix-bg">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center group-hover:glow-green transition-all">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <span className="font-code font-bold text-xl text-primary group-hover:text-glow-green transition-all">
            SEO Lovable
          </span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-lg border border-border bg-card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-code text-primary mb-2">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-sm text-muted-foreground font-code">
              {isLogin
                ? "Accédez à votre dashboard SEO"
                : "Essai gratuit 14 jours – Pas de carte requise"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-code text-sm">
                  Nom
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    className="pl-10 font-code bg-input border-border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive font-code flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-code text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="pl-10 font-code bg-input border-border"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-code flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-code text-sm">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 font-code bg-input border-border"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-code flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-code glow-green group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Chargement...</span>
              ) : (
                <>
                  {isLogin ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground font-code">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary hover:underline"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground font-code hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;