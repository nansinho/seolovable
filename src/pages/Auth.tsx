import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";

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
      or: "ou",
      continueGoogle: "Continuer avec Google",
      continueGithub: "Continuer avec GitHub",
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
      or: "or",
      continueGoogle: "Continue with Google",
      continueGithub: "Continue with GitHub",
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
  const { checkIfBlocked } = useBlockedUserCheck();

  // Check for existing session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Check if user is blocked before allowing access
        const isBlocked = await checkIfBlocked(session.user.id);
        if (!isBlocked) {
          navigate("/dashboard");
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isBlocked = await checkIfBlocked(session.user.id);
        if (!isBlocked) {
          navigate("/dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, checkIfBlocked]);

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

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connexion réussie !",
            description: "Redirection vers le dashboard...",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Compte créé !",
            description: "Redirection vers le dashboard...",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.continueGoogle}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t.continueGithub}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/30 px-3 text-muted-foreground">{t.or}</span>
            </div>
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
