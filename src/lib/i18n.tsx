import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Language = "fr" | "en";

interface TranslationRow {
  key: string;
  lang: string;
  value: string;
}

// Fallback static translations
const staticTranslations: Record<string, Record<Language, string>> = {
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.how": { fr: "Comment ça marche", en: "How it works" },
  "nav.pricing": { fr: "Tarifs", en: "Pricing" },
  "nav.login": { fr: "Connexion", en: "Login" },
  "nav.trial": { fr: "Essai gratuit", en: "Free trial" },
  "hero.tag": { fr: "// Prerender pour Lovable", en: "// Prerender for Lovable" },
  "hero.title1": { fr: "Soyez visible partout où vos clients", en: "Be found everywhere your audience" },
  "hero.title2": { fr: "cherchent", en: "searches" },
  "hero.subtitle": { fr: "Ne perdez plus de trafic à cause de votre plateforme IA. Rendez vos sites Lovable visibles sur Google, ChatGPT, Claude et Perplexity.", en: "Don't lose traffic because of your AI coding platform. Make your Lovable sites visible to Google, ChatGPT, Claude and Perplexity." },
  "hero.cta": { fr: "Démarrer l'essai gratuit", en: "Start free trial" },
  "hero.cta2": { fr: "Comment ça marche", en: "How it works" },
  "hero.trusted": { fr: "Compatible avec:", en: "Trusted by:" },
  "problem.title1": { fr: "Vos Apps IA sont", en: "Your AI-Built Apps Are" },
  "problem.title2": { fr: "Invisibles", en: "Invisible" },
  "problem.subtitle": { fr: "Google et les réseaux sociaux ne voient pas ce que vous avez créé - juste des pages vides.", en: "Google and social media can't see what you built - just empty pages." },
  "problem.desc": { fr: "Quand vous partagez votre lien sur les réseaux sociaux, l'aperçu est cassé. Quand Google essaie d'indexer vos pages, il ne voit rien. C'est parce que votre contenu se charge avec JavaScript - et les bots n'attendent pas.", en: "When you share your app link on any social media platform, it looks broken. When Google tries to index your pages, it sees nothing. That's because your content loads with JavaScript - and bots don't wait around." },
  "problem.bots": { fr: "Ce que les bots voient:", en: "What bots see:" },
  "problem.indexed": { fr: "Ce qui devrait être indexé:", en: "What should be indexed:" },
  "solution.tag": { fr: "// Comment ça marche", en: "// How it works" },
  "solution.title": { fr: "4 étapes vers la visibilité SEO", en: "4 steps to SEO visibility" },
  "step.1.title": { fr: "Inscription", en: "Sign up" },
  "step.1.desc": { fr: "Créez votre compte et ajoutez votre URL Lovable", en: "Create your account and add your Lovable URL" },
  "step.2.title": { fr: "Ajoutez le CNAME", en: "Add CNAME" },
  "step.2.desc": { fr: "Configuration DNS simple, copier-coller en 30 secondes", en: "Simple DNS config, copy-paste in 30 seconds" },
  "step.3.title": { fr: "Vérification auto", en: "Auto verification" },
  "step.3.desc": { fr: "Notre système valide votre configuration", en: "Our system validates your configuration" },
  "step.4.title": { fr: "Vous êtes en ligne", en: "You're live" },
  "step.4.desc": { fr: "Votre site est maintenant indexable par tous les bots", en: "Your site is now indexable by all bots" },
  "features.title": { fr: "Tout ce dont vous avez besoin", en: "Everything you need" },
  "features.subtitle": { fr: "Des fonctionnalités puissantes pour un SEO Lovable parfait", en: "Powerful features for perfect Lovable SEO" },
  "feature.1.title": { fr: "Prerender à la demande", en: "On-demand prerender" },
  "feature.1.desc": { fr: "Cache intelligent qui génère le HTML à la volée pour chaque page", en: "Smart cache that generates HTML on the fly for each page" },
  "feature.2.title": { fr: "Multi-sites", en: "Multi-site support" },
  "feature.2.desc": { fr: "Gérez tous vos projets Lovable depuis un seul dashboard", en: "Manage all your Lovable projects from one dashboard" },
  "feature.3.title": { fr: "Stats bots temps réel", en: "Real-time bot stats" },
  "feature.3.desc": { fr: "Suivez les crawls de Google, Bing, ChatGPT, Claude", en: "Track crawls from Google, Bing, ChatGPT, Claude" },
  "feature.4.title": { fr: "SSL gratuit & RGPD", en: "Free SSL & GDPR safe" },
  "feature.4.desc": { fr: "Certificat SSL auto, aucune donnée personnelle stockée", en: "Auto SSL certificate, no personal data stored" },
  "feature.5.title": { fr: "Config en 5 min", en: "5-minute setup" },
  "feature.5.desc": { fr: "Configuration ultra-rapide sans toucher à votre code", en: "Ultra-fast configuration without touching your code" },
  "feature.6.title": { fr: "Intégration IA", en: "AI Integration" },
  "feature.6.desc": { fr: "L'IA analyse et optimise votre contenu SEO", en: "AI analyzes and optimizes your SEO content" },
  "pricing.title": { fr: "Tarifs simples", en: "Simple pricing" },
  "pricing.subtitle": { fr: "Promo lancement - Offre limitée", en: "Launch promo - Limited time" },
  "pricing.popular": { fr: "Populaire", en: "Popular" },
  "pricing.cta": { fr: "Commencer", en: "Get started" },
  "pricing.cancel": { fr: "Annulez quand vous voulez", en: "Cancel anytime" },
  "pricing.refund": { fr: "Remboursement 30 jours", en: "30-day refund" },
  "pricing.trial": { fr: "14 jours d'essai gratuit", en: "14-day free trial" },
  "plan.starter": { fr: "Starter", en: "Starter" },
  "plan.starter.desc": { fr: "Idéal pour démarrer", en: "Perfect to get started" },
  "plan.starter.f1": { fr: "1 site web", en: "1 website" },
  "plan.starter.f2": { fr: "10 000 pages/mois", en: "10,000 pages/month" },
  "plan.starter.f3": { fr: "Support par email", en: "Email support" },
  "plan.starter.f4": { fr: "Rapports basiques", en: "Basic reports" },
  "plan.starter.f5": { fr: "SSL inclus", en: "SSL included" },
  "plan.pro": { fr: "Pro", en: "Pro" },
  "plan.pro.desc": { fr: "Pour les équipes ambitieuses", en: "For ambitious teams" },
  "plan.pro.f1": { fr: "5 sites web", en: "5 websites" },
  "plan.pro.f2": { fr: "Pages illimitées", en: "Unlimited pages" },
  "plan.pro.f3": { fr: "Analytics avancés", en: "Advanced analytics" },
  "plan.pro.f4": { fr: "Support prioritaire", en: "Priority support" },
  "plan.pro.f5": { fr: "Accès API", en: "API access" },
  "plan.pro.f6": { fr: "Webhooks", en: "Webhooks" },
  "plan.business": { fr: "Business", en: "Business" },
  "plan.business.desc": { fr: "Solution entreprise", en: "Enterprise solution" },
  "plan.business.f1": { fr: "Sites illimités", en: "Unlimited sites" },
  "plan.business.f2": { fr: "Rapports SEO détaillés", en: "Detailed SEO reports" },
  "plan.business.f3": { fr: "Support 24/7", en: "24/7 support" },
  "plan.business.f4": { fr: "API complète", en: "Full API" },
  "plan.business.f5": { fr: "Manager dédié", en: "Dedicated manager" },
  "plan.business.f6": { fr: "SLA 99.9%", en: "99.9% SLA" },
  "footer.desc": { fr: "Prerender pour sites Lovable. Rendez votre contenu visible pour Google et les AI crawlers.", en: "Prerender for Lovable sites. Make your content visible to Google and AI crawlers." },
  "footer.product": { fr: "Produit", en: "Product" },
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.privacy": { fr: "Confidentialité", en: "Privacy" },
  "footer.terms": { fr: "CGV", en: "Terms" },
  "footer.legalNotice": { fr: "Mentions légales", en: "Legal Notice" },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "seolovable-lang";

async function fetchTranslations(): Promise<TranslationRow[]> {
  const { data, error } = await supabase
    .from("translations")
    .select("key, lang, value");
  
  if (error) {
    console.error("Error fetching translations:", error);
    return [];
  }
  return data || [];
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") return saved;
    const browserLang = navigator.language.substring(0, 2);
    return browserLang === "en" ? "en" : "fr";
  });

  const { data: dbTranslations, isLoading } = useQuery({
    queryKey: ["translations"],
    queryFn: fetchTranslations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  const t = (key: string): string => {
    // First try database translations
    if (dbTranslations) {
      const dbValue = dbTranslations.find((t) => t.key === key && t.lang === lang);
      if (dbValue) return dbValue.value;
    }
    // Fallback to static translations
    return staticTranslations[key]?.[lang] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

// Export static translations for admin interface
export { staticTranslations };
