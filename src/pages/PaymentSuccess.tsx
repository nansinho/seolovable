import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Confetti } from '@/components/Confetti';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [planInfo, setPlanInfo] = useState<{ planType: string; sitesLimit: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error && data) {
          setPlanInfo({
            planType: data.planType || 'starter',
            sitesLimit: data.sitesLimit || 1,
          });
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'business': return 'Business';
      default: return planType;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      {showConfetti && <Confetti />}
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full p-8 text-center space-y-8 animate-scale-in border-primary/20 bg-card/50 backdrop-blur-sm">
          {/* Success Icon with Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium uppercase tracking-wider">Félicitations !</span>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Paiement réussi
            </h1>
            <p className="text-muted-foreground">
              Votre abonnement est maintenant actif
            </p>
          </div>

          {/* Plan Info */}
          {!loading && planInfo && (
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Plan {getPlanLabel(planInfo.planType)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant surveiller jusqu'à{' '}
                <span className="font-semibold text-foreground">
                  {planInfo.sitesLimit === 999 ? 'illimité' : planInfo.sitesLimit}
                </span>{' '}
                {planInfo.sitesLimit === 1 ? 'site' : 'sites'}
              </p>
            </div>
          )}

          {loading && (
            <div className="p-6 rounded-xl bg-muted/50 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="gap-2"
              size="lg"
            >
              Accéder au Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-muted-foreground">
            Un email de confirmation a été envoyé à votre adresse email.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
