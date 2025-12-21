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
  // Navigation
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.how": { fr: "Comment ça marche", en: "How it works" },
  "nav.pricing": { fr: "Tarifs", en: "Pricing" },
  "nav.login": { fr: "Connexion", en: "Login" },
  "nav.trial": { fr: "Essai gratuit", en: "Free trial" },

  // Hero Section
  "hero.tag": { fr: "// Prerender pour Lovable", en: "// Prerender for Lovable" },
  "hero.title1": { fr: "Soyez visible partout où vos clients", en: "Be found everywhere your audience" },
  "hero.title2": { fr: "cherchent", en: "searches" },
  "hero.subtitle": { fr: "Ne perdez plus de trafic à cause de votre plateforme IA. Rendez vos sites Lovable visibles sur Google, ChatGPT, Claude et Perplexity.", en: "Don't lose traffic because of your AI coding platform. Make your Lovable sites visible to Google, ChatGPT, Claude and Perplexity." },
  "hero.cta": { fr: "Démarrer l'essai gratuit", en: "Start free trial" },
  "hero.cta2": { fr: "Comment ça marche", en: "How it works" },
  "hero.trusted": { fr: "Compatible avec:", en: "Trusted by:" },

  // Problem Section
  "problem.title1": { fr: "Vos Apps IA sont", en: "Your AI-Built Apps Are" },
  "problem.title2": { fr: "Invisibles", en: "Invisible" },
  "problem.subtitle": { fr: "Google et les réseaux sociaux ne voient pas ce que vous avez créé - juste des pages vides.", en: "Google and social media can't see what you built - just empty pages." },
  "problem.desc": { fr: "Quand vous partagez votre lien sur les réseaux sociaux, l'aperçu est cassé. Quand Google essaie d'indexer vos pages, il ne voit rien. C'est parce que votre contenu se charge avec JavaScript - et les bots n'attendent pas.", en: "When you share your app link on any social media platform, it looks broken. When Google tries to index your pages, it sees nothing. That's because your content loads with JavaScript - and bots don't wait around." },
  "problem.bots": { fr: "Ce que les bots voient:", en: "What bots see:" },
  "problem.indexed": { fr: "Ce qui devrait être indexé:", en: "What should be indexed:" },

  // Solution Section
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

  // Features Section
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

  // Pricing Section
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

  // Footer
  "footer.desc": { fr: "Prerender pour sites Lovable. Rendez votre contenu visible pour Google et les AI crawlers.", en: "Prerender for Lovable sites. Make your content visible to Google and AI crawlers." },
  "footer.product": { fr: "Produit", en: "Product" },
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.privacy": { fr: "Confidentialité", en: "Privacy" },
  "footer.terms": { fr: "CGV", en: "Terms" },
  "footer.legalNotice": { fr: "Mentions légales", en: "Legal Notice" },

  // Sidebar Navigation
  "sidebar.dashboard": { fr: "Dashboard", en: "Dashboard" },
  "sidebar.analytics": { fr: "Analytics", en: "Analytics" },
  "sidebar.subscription": { fr: "Abonnement", en: "Subscription" },
  "sidebar.settings": { fr: "Paramètres", en: "Settings" },
  "sidebar.admin": { fr: "Administration", en: "Administration" },
  "sidebar.users": { fr: "Utilisateurs", en: "Users" },
  "sidebar.allSites": { fr: "Tous les sites", en: "All sites" },
  "sidebar.translations": { fr: "Traductions", en: "Translations" },
  "sidebar.logout": { fr: "Déconnexion", en: "Logout" },

  // Dashboard
  "dashboard.title": { fr: "Dashboard", en: "Dashboard" },
  "dashboard.subtitle": { fr: "Vue d'ensemble de vos sites et statistiques", en: "Overview of your sites and statistics" },
  "dashboard.testPrerender": { fr: "Test Prerender", en: "Test Prerender" },
  "dashboard.addSite": { fr: "Ajouter un site", en: "Add a site" },
  "dashboard.siteQuota": { fr: "Quota de sites", en: "Site quota" },
  "dashboard.plan": { fr: "Plan", en: "Plan" },
  "dashboard.upgrade": { fr: "Passer au supérieur", en: "Upgrade" },
  "dashboard.manageSub": { fr: "Gérer mon abonnement", en: "Manage subscription" },
  "dashboard.unlimitedSites": { fr: "Sites illimités", en: "Unlimited sites" },
  "dashboard.sitesCreated": { fr: "site(s) créé(s)", en: "site(s) created" },
  "dashboard.sitesUsed": { fr: "sites utilisés", en: "sites used" },
  "dashboard.remaining": { fr: "restant(s)", en: "remaining" },
  "dashboard.noDataToday": { fr: "Aucune donnée disponible pour aujourd'hui", en: "No data available for today" },
  "dashboard.pagesRendered": { fr: "Pages rendues", en: "Pages rendered" },
  "dashboard.botsToday": { fr: "Bots aujourd'hui", en: "Bots today" },
  "dashboard.googleCrawls": { fr: "Google crawls", en: "Google crawls" },
  "dashboard.aiCrawls": { fr: "AI crawls", en: "AI crawls" },
  "dashboard.crawlsEvolution": { fr: "Évolution des crawls", en: "Crawls evolution" },
  "dashboard.last7days": { fr: "7 derniers jours", en: "Last 7 days" },
  "dashboard.mySites": { fr: "Mes sites", en: "My sites" },
  "dashboard.sites": { fr: "sites", en: "sites" },
  "dashboard.noSites": { fr: "Aucun site ajouté. Cliquez sur \"Ajouter un site\" pour commencer.", en: "No sites added. Click \"Add a site\" to get started." },
  "dashboard.active": { fr: "Actif", en: "Active" },
  "dashboard.pending": { fr: "En attente", en: "Pending" },
  "dashboard.error": { fr: "Erreur", en: "Error" },
  "dashboard.lastCrawl": { fr: "Dernier crawl", en: "Last crawl" },
  "dashboard.never": { fr: "Jamais", en: "Never" },
  "dashboard.recentActivity": { fr: "Activité récente", en: "Recent activity" },
  "dashboard.noRecentActivity": { fr: "Aucune activité récente", en: "No recent activity" },

  // Admin Users
  "admin.users.title": { fr: "Utilisateurs", en: "Users" },
  "admin.users.subtitle": { fr: "Gestion des utilisateurs et des rôles", en: "User and role management" },
  "admin.users.search": { fr: "Rechercher un utilisateur...", en: "Search for a user..." },
  "admin.users.email": { fr: "Email", en: "Email" },
  "admin.users.status": { fr: "Statut", en: "Status" },
  "admin.users.plan": { fr: "Plan", en: "Plan" },
  "admin.users.sites": { fr: "Sites", en: "Sites" },
  "admin.users.registeredOn": { fr: "Inscrit le", en: "Registered on" },
  "admin.users.actions": { fr: "Actions", en: "Actions" },
  "admin.users.noUsers": { fr: "Aucun utilisateur trouvé", en: "No users found" },
  "admin.users.admin": { fr: "Admin", en: "Admin" },
  "admin.users.blocked": { fr: "Bloqué", en: "Blocked" },
  "admin.users.user": { fr: "Utilisateur", en: "User" },
  "admin.users.unlimited": { fr: "Illimité (Admin)", en: "Unlimited (Admin)" },
  "admin.users.available": { fr: "dispo", en: "available" },
  "admin.users.limit": { fr: "limite", en: "limit" },
  "admin.users.promoteAdmin": { fr: "Promouvoir admin", en: "Promote to admin" },
  "admin.users.removeAdmin": { fr: "Retirer admin", en: "Remove admin" },
  "admin.users.block": { fr: "Bloquer", en: "Block" },
  "admin.users.unblock": { fr: "Débloquer", en: "Unblock" },
  "admin.users.totalUsers": { fr: "Utilisateurs", en: "Users" },
  "admin.users.totalSites": { fr: "Sites totaux", en: "Total sites" },
  "admin.users.totalPages": { fr: "Pages rendues", en: "Pages rendered" },
  "admin.users.totalCrawls": { fr: "Total crawls", en: "Total crawls" },

  // Admin Sites
  "admin.sites.title": { fr: "Tous les sites", en: "All sites" },
  "admin.sites.total": { fr: "sites au total", en: "total sites" },
  "admin.sites.search": { fr: "Rechercher par site, URL ou propriétaire...", en: "Search by site, URL or owner..." },
  "admin.sites.addSite": { fr: "Ajouter un site", en: "Add a site" },
  "admin.sites.site": { fr: "Site", en: "Site" },
  "admin.sites.owner": { fr: "Propriétaire", en: "Owner" },
  "admin.sites.status": { fr: "Status", en: "Status" },
  "admin.sites.pages": { fr: "Pages", en: "Pages" },
  "admin.sites.createdOn": { fr: "Créé le", en: "Created on" },
  "admin.sites.lastCrawl": { fr: "Dernier crawl", en: "Last crawl" },
  "admin.sites.actions": { fr: "Actions", en: "Actions" },
  "admin.sites.noSites": { fr: "Aucun site trouvé", en: "No sites found" },
  "admin.sites.active": { fr: "Actif", en: "Active" },
  "admin.sites.pending": { fr: "En attente", en: "Pending" },
  "admin.sites.error": { fr: "Erreur", en: "Error" },
  "admin.sites.never": { fr: "Jamais", en: "Never" },
  "admin.sites.unknownUser": { fr: "Utilisateur inconnu", en: "Unknown user" },
  "admin.sites.deleteSite": { fr: "Supprimer le site ?", en: "Delete site?" },
  "admin.sites.deleteConfirm": { fr: "Êtes-vous sûr de vouloir supprimer", en: "Are you sure you want to delete" },
  "admin.sites.irreversible": { fr: "Cette action est irréversible.", en: "This action is irreversible." },
  "admin.sites.cancel": { fr: "Annuler", en: "Cancel" },
  "admin.sites.delete": { fr: "Supprimer", en: "Delete" },
  "admin.sites.deleting": { fr: "Suppression...", en: "Deleting..." },

  // Admin Translations
  "admin.translations.title": { fr: "Gestion des traductions", en: "Translation management" },
  "admin.translations.count": { fr: "traductions en base", en: "translations in database" },
  "admin.translations.keys": { fr: "clés uniques", en: "unique keys" },
  "admin.translations.importStatic": { fr: "Importer statiques", en: "Import static" },
  "admin.translations.translateMissing": { fr: "Traduire manquantes", en: "Translate missing" },
  "admin.translations.searchKey": { fr: "Rechercher une clé...", en: "Search for a key..." },
  "admin.translations.all": { fr: "Toutes", en: "All" },
  "admin.translations.auto": { fr: "Auto", en: "Auto" },
  "admin.translations.manual": { fr: "Manuelles", en: "Manual" },
  "admin.translations.missing": { fr: "Manquantes", en: "Missing" },
  "admin.translations.static": { fr: "Statique", en: "Static" },
  "admin.translations.notDefined": { fr: "Non défini", en: "Not defined" },

  // Common
  "common.loading": { fr: "Chargement...", en: "Loading..." },
  "common.error": { fr: "Erreur", en: "Error" },
  "common.success": { fr: "Succès", en: "Success" },
  "common.save": { fr: "Enregistrer", en: "Save" },
  "common.cancel": { fr: "Annuler", en: "Cancel" },
  "common.delete": { fr: "Supprimer", en: "Delete" },
  "common.edit": { fr: "Modifier", en: "Edit" },
  "common.close": { fr: "Fermer", en: "Close" },
  "common.confirm": { fr: "Confirmer", en: "Confirm" },
  "common.checkingAdmin": { fr: "Vérification des droits admin...", en: "Checking admin rights..." },
  "common.checkingRights": { fr: "Vérification des droits...", en: "Checking rights..." },

  // Toast messages
  "toast.deleteError": { fr: "Erreur lors de la suppression", en: "Error during deletion" },
  "toast.deleteSuccess": { fr: "Site supprimé", en: "Site deleted" },
  "toast.loadError": { fr: "Erreur lors du chargement", en: "Error during loading" },
  "toast.planChanged": { fr: "Plan modifié en", en: "Plan changed to" },
  "toast.planError": { fr: "Erreur lors de la modification du plan", en: "Error changing plan" },
  "toast.alreadyAdmin": { fr: "Cet utilisateur est déjà admin", en: "This user is already admin" },
  "toast.promoteError": { fr: "Erreur lors de la promotion", en: "Error during promotion" },
  "toast.promoteSuccess": { fr: "Utilisateur promu admin", en: "User promoted to admin" },
  "toast.cannotRemoveSelf": { fr: "Vous ne pouvez pas vous retirer les droits admin", en: "You cannot remove your own admin rights" },
  "toast.removeAdminError": { fr: "Erreur lors de la suppression des droits", en: "Error removing rights" },
  "toast.removeAdminSuccess": { fr: "Droits admin retirés", en: "Admin rights removed" },
  "toast.cannotBlockSelf": { fr: "Vous ne pouvez pas vous bloquer vous-même", en: "You cannot block yourself" },
  "toast.alreadyBlocked": { fr: "Cet utilisateur est déjà bloqué", en: "This user is already blocked" },
  "toast.blockError": { fr: "Erreur lors du blocage", en: "Error during blocking" },
  "toast.blockSuccess": { fr: "Utilisateur bloqué", en: "User blocked" },
  "toast.unblockError": { fr: "Erreur lors du déblocage", en: "Error during unblocking" },
  "toast.unblockSuccess": { fr: "Utilisateur débloqué", en: "User unblocked" },
  "toast.logoutError": { fr: "Erreur lors de la déconnexion", en: "Error during logout" },
  "toast.logoutSuccess": { fr: "Déconnexion réussie", en: "Logout successful" },
  "toast.translationSaved": { fr: "Traduction sauvegardée", en: "Translation saved" },
  "toast.syncComplete": { fr: "Synchronisation terminée", en: "Synchronization complete" },
  "toast.translationsAdded": { fr: "traductions ajoutées", en: "translations added" },
  "toast.translationsImported": { fr: "traductions importées", en: "translations imported" },
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
