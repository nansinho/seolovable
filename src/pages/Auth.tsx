import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useBlockedUserCheck } from "@/hooks/useBlockedUserCheck";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

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
      loginSubtitle: "Accédez à votre dashboard en un clic",
      continueGoogle: "Continuer avec Google",
      terms: "En continuant, vous acceptez nos",
      termsLink: "Conditions d'utilisation",
      and: "et",
      privacyLink: "Politique de confidentialité",
      secureLogin: "Connexion sécurisée via Google",
      instantAccess: "Accès instantané à votre dashboard",
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
      loginSubtitle: "Access your dashboard in one click",
      continueGoogle: "Continue with Google",
      terms: "By continuing, you agree to our",
      termsLink: "Terms of Service",
      and: "and",
      privacyLink: "Privacy Policy",
      secureLogin: "Secure login via Google",
      instantAccess: "Instant access to your dashboard",
    },
  };

  const t = content[lang];
  const { checkIfBlocked } = useBlockedUserCheck();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float" />
        </div>
        
        <div className="relative z-10 max-w-xl">
          {/* Title with staggered animation */}
          <h1 className="text-4xl xl:text-5xl font-medium tracking-[-0.02em] leading-tight mb-6 animate-fade-in">
            {t.title}{" "}
            <span className="font-mono text-accent bg-accent/10 px-2 py-1 rounded inline-block animate-scale-in" style={{ animationDelay: '0.2s' }}>
              {t.titleAccent}
            </span>
            <br />
            <span className="inline-block animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {t.titleEnd}
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t.subtitle}
          </p>

          {/* Steps with staggered animation */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card border border-border text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full text-muted-foreground">
              {t.simpleSetup}
            </span>
            
            <div className="bg-card/50 border border-border rounded-xl p-6 pt-8 backdrop-blur-sm">
              <div className="space-y-6">
                {t.steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 animate-fade-in group"
                    style={{ animationDelay: `${0.6 + index * 0.15}s` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-medium transition-all duration-300 group-hover:scale-110 ${
                        index === 0 
                          ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30" 
                          : "bg-muted text-muted-foreground group-hover:bg-accent/20"
                      }`}>
                        {index + 1}
                      </div>
                      {index < t.steps.length - 1 && (
                        <div className="w-px h-8 bg-gradient-to-b from-border to-transparent mt-2" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="font-mono font-medium text-foreground group-hover:text-accent transition-colors">{step.title}</p>
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
      <div className="flex-1 lg:max-w-lg xl:max-w-xl flex items-center justify-center p-6 lg:p-12 bg-card/30 lg:border-l border-border relative overflow-hidden">
        {/* Animated background for right side */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="w-full max-w-sm relative z-10">
          {/* Logo with animation */}
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 mb-10 group animate-fade-in"
          >
            <span className="font-mono font-bold text-xl text-foreground group-hover:text-accent transition-colors duration-300">
              SEO Lovable
            </span>
          </Link>

          {/* Header with animation */}
          <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-medium text-foreground mb-3">
              {t.loginTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-14 font-medium text-base border-2 hover:border-accent hover:bg-accent/5 transition-all duration-300 group relative overflow-hidden"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <svg className="w-5 h-5 mr-3 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? (
                <span className="animate-pulse">Connexion...</span>
              ) : (
                t.continueGoogle
              )}
            </Button>

            {/* Features */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>{t.secureLogin}</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="mt-12 flex justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-2 h-2 rounded-full bg-accent/30 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-accent/70 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Terms */}
          <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.terms}{" "}
              <Link to="/cgv" className="text-accent hover:underline transition-colors">
                {t.termsLink}
              </Link>{" "}
              {t.and}{" "}
              <Link to="/confidentialite" className="text-accent hover:underline transition-colors">
                {t.privacyLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
