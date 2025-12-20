import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "fr" | "en";

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const translations: Translations = {
  // Header
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.how": { fr: "Comment ça marche", en: "How it works" },
  "nav.pricing": { fr: "Tarifs", en: "Pricing" },
  "nav.login": { fr: "Connexion", en: "Login" },
  "nav.trial": { fr: "Essai gratuit", en: "Free trial" },

  // Hero
  "hero.tag": { fr: "// Prerender pour Lovable", en: "// Prerender for Lovable" },
  "hero.title1": { fr: "Soyez visible partout où vos clients", en: "Be found everywhere your audience" },
  "hero.title2": { fr: "cherchent", en: "searches" },
  "hero.subtitle": { fr: "Ne perdez plus de trafic à cause de votre plateforme IA. Rendez vos sites Lovable visibles sur Google, ChatGPT, Claude et Perplexity.", en: "Don't lose traffic because of your AI coding platform. Make your Lovable sites visible to Google, ChatGPT, Claude and Perplexity." },
  "hero.cta": { fr: "Démarrer l'essai gratuit", en: "Start free trial" },
  "hero.cta2": { fr: "Comment ça marche", en: "How it works" },
  "hero.trusted": { fr: "Compatible avec:", en: "Trusted by:" },

  // Problem
  "problem.title1": { fr: "Vos Apps IA sont", en: "Your AI-Built Apps Are" },
  "problem.title2": { fr: "Invisibles", en: "Invisible" },
  "problem.subtitle": { fr: "Google et les réseaux sociaux ne voient pas ce que vous avez créé - juste des pages vides.", en: "Google and social media can't see what you built - just empty pages." },
  "problem.desc": { fr: "Quand vous partagez votre lien sur les réseaux sociaux, l'aperçu est cassé. Quand Google essaie d'indexer vos pages, il ne voit rien. C'est parce que votre contenu se charge avec JavaScript - et les bots n'attendent pas.", en: "When you share your app link on any social media platform, it looks broken. When Google tries to index your pages, it sees nothing. That's because your content loads with JavaScript - and bots don't wait around." },
  "problem.bots": { fr: "Ce que les bots voient:", en: "What bots see:" },
  "problem.indexed": { fr: "Ce qui devrait être indexé:", en: "What should be indexed:" },

  // Solution
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

  // Features
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

  // Pricing
  "pricing.title": { fr: "Tarifs simples", en: "Simple pricing" },
  "pricing.subtitle": { fr: "Promo lancement - Offre limitée", en: "Launch promo - Limited time" },
  "pricing.popular": { fr: "Populaire", en: "Popular" },
  "pricing.cta": { fr: "Commencer", en: "Get started" },
  "pricing.cancel": { fr: "Annulez quand vous voulez", en: "Cancel anytime" },
  "pricing.refund": { fr: "Remboursement 30 jours", en: "30-day refund" },
  "pricing.trial": { fr: "14 jours d'essai gratuit", en: "14-day free trial" },
  
  "plan.basic": { fr: "Basic", en: "Basic" },
  "plan.basic.desc": { fr: "Parfait pour tester", en: "Perfect for testing" },
  "plan.basic.f1": { fr: "1 site Lovable", en: "1 Lovable site" },
  "plan.basic.f2": { fr: "10 000 pages/mois", en: "10,000 pages/month" },
  "plan.basic.f3": { fr: "Prerender basique", en: "Basic prerender" },
  "plan.basic.f4": { fr: "Support email", en: "Email support" },
  
  "plan.pro": { fr: "Pro", en: "Pro" },
  "plan.pro.desc": { fr: "+200% trafic garanti", en: "+200% traffic guaranteed" },
  "plan.pro.f1": { fr: "5 sites Lovable", en: "5 Lovable sites" },
  "plan.pro.f2": { fr: "Pages illimitées", en: "Unlimited pages" },
  "plan.pro.f3": { fr: "Dashboard stats bots", en: "Bot stats dashboard" },
  "plan.pro.f4": { fr: "Cache intelligent", en: "Smart cache" },
  "plan.pro.f5": { fr: "Support prioritaire", en: "Priority support" },
  "plan.pro.f6": { fr: "Accès API", en: "API access" },
  
  "plan.enterprise": { fr: "Enterprise", en: "Enterprise" },
  "plan.enterprise.desc": { fr: "Pour les pros Lovable", en: "For Lovable pros" },
  "plan.enterprise.f1": { fr: "Sites illimités", en: "Unlimited sites" },
  "plan.enterprise.f2": { fr: "Rapports SEO mensuels", en: "Monthly SEO reports" },
  "plan.enterprise.f3": { fr: "Support 24/7", en: "24/7 support" },
  "plan.enterprise.f4": { fr: "Intégration IA", en: "AI integration" },
  "plan.enterprise.f5": { fr: "Fonctionnalités custom", en: "Custom features" },
  "plan.enterprise.f6": { fr: "SLA 99.9%", en: "99.9% SLA" },

  // Footer
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
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("fr");

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
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
