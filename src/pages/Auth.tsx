import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang } = useI18n();
  
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const content = {
    fr: {
      title: "Rendez votre app",
      titleAccent: "visible",
      titleEnd: "partout",
      subtitle: "Boostez votre SEO avec le prerendering pour vos apps Lovable, Bolt ou React en quelques minutes.",
      steps: [
        { title: "Inscription", desc: "Créez votre compte" },
        { title: "Ajout domaine", desc: "Entrez votre domaine" },
        { title: "Go Live", desc: "On s'occupe du reste" },
      ],
      simpleSetup: "Configuration simple",
      loginTitle: "Connexion",
      signupTitle: "Créer un compte",
      loginSubtitle: "Accédez à votre dashboard",
      signupSubtitle: "Essai gratuit 14 jours",
      name: "Nom",
      namePlaceholder: "Votre nom",
      email: "Email",
      emailPlaceholder: "vous@exemple.com",
      password: "Mot de passe",
      loginBtn: "Se connecter",
      signupBtn: "Créer mon compte",
      noAccount: "Pas encore de compte ?",
      hasAccount: "Déjà un compte ?",
      signup: "S'inscrire",
      login: "Se connecter",
      terms: "En continuant, vous acceptez nos",
      termsLink: "Conditions d'utilisation",
      and: "et",
      privacyLink: "Politique de confidentialité",
      errors: {
        emailRequired: "L'email est requis",
        emailInvalid: "Email invalide",
        passwordRequired: "Le mot de passe est requis",
        passwordShort: "Le mot de passe doit faire au moins 6 caractères",
        nameRequired: "Le nom est requis",
      },
    },
    en: {
      title: "Make your app",
      titleAccent: "visible",
      titleEnd: "everywhere",
      subtitle: "Boost your SEO with prerendering for your Lovable, Bolt or React apps in minutes.",
      steps: [
        { title: "Sign Up", desc: "Create your account" },
        { title: "Add Domain", desc: "Enter your domain" },
        { title: "Go Live", desc: "We handle the rest" },
      ],
      simpleSetup: "Simple setup",
      loginTitle: "Sign In",
      signupTitle: "Create Account",
      loginSubtitle: "Access your dashboard",
      signupSubtitle: "14-day free trial",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      loginBtn: "Sign In",
      signupBtn: "Create Account",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      signup: "Sign up",
      login: "Sign in",
      terms: "By continuing, you agree to our",
      termsLink: "Terms of Service",
      and: "and",
      privacyLink: "Privacy Policy",
      errors: {
        emailRequired: "Email is required",
        emailInvalid: "Invalid email",
        passwordRequired: "Password is required",
        passwordShort: "Password must be at least 6 characters",
        nameRequired: "Name is required",
      },
    },
  };

  const t = content[lang];

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }
    
    if (!formData.password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.errors.passwordShort;
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = t.errors.nameRequired;
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
    <div className="min-h-screen h-screen bg-background flex overflow-hidden">
      {/* Left Side - Info */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          {/* Title */}
          <h1 className="text-4xl xl:text-5xl font-medium tracking-[-0.02em] leading-tight mb-6">
            {t.title}{" "}
            <span className="font-mono text-accent bg-accent/10 px-2 py-1 rounded">{t.titleAccent}</span>
            <br />
            {t.titleEnd}
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            {t.subtitle}
          </p>

          {/* Steps */}
          <div className="relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card border border-border text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full text-muted-foreground">
              {t.simpleSetup}
            </span>
            
            <div className="bg-card/50 border border-border rounded-xl p-6 pt-8">
              <div className="space-y-6">
                {t.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-medium ${
                        index === 0 
                          ? "bg-accent text-accent-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      {index < t.steps.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-mono font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 lg:max-w-lg xl:max-w-xl flex items-center justify-center p-6 lg:p-12 bg-card/30 lg:border-l border-border">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-10">
            <span className="font-mono font-bold text-xl text-foreground">
              SEO Lovable
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-foreground mb-2">
              {isLogin ? t.loginTitle : t.signupTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin ? t.loginSubtitle : t.signupSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t.name}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.namePlaceholder}
                    className="pl-10 h-11 bg-background border-border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="pl-10 h-11 bg-background border-border"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t.password}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-background border-border"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  {isLogin ? t.loginBtn : t.signupBtn}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? t.noAccount : t.hasAccount}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-accent hover:underline font-medium"
              >
                {isLogin ? t.signup : t.login}
              </button>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.terms}{" "}
              <Link to="/cgv" className="text-accent hover:underline">{t.termsLink}</Link>
              {" "}{t.and}{" "}
              <Link to="/confidentialite" className="text-accent hover:underline">{t.privacyLink}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
