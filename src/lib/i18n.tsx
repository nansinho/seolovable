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

  // Dashboard chart
  "dashboard.chart.noData": { fr: "Aucune donnée disponible", en: "No data available" },
  "dashboard.chart.google": { fr: "Google", en: "Google" },
  "dashboard.chart.ai": { fr: "IA", en: "AI" },

  // Modals: SEO test
  "seoTest.title": { fr: "Analyse SEO", en: "SEO analysis" },
  "seoTest.siteAnalyzed": { fr: "Site analysé", en: "Analyzed site" },
  "seoTest.loading": { fr: "Analyse en cours...", en: "Analysis in progress..." },
  "seoTest.retry": { fr: "Réessayer", en: "Retry" },
  "seoTest.score": { fr: "Score SEO", en: "SEO score" },
  "seoTest.titleTag": { fr: "Balise title", en: "Title tag" },
  "seoTest.metaDescription": { fr: "Meta description", en: "Meta description" },
  "seoTest.h1Tag": { fr: "Balise H1", en: "H1 tag" },
  "seoTest.canonical": { fr: "Canonical", en: "Canonical" },
  "seoTest.needsPrerenderTitle": { fr: "Votre site a besoin de prerendering", en: "Your site needs prerendering" },
  "seoTest.needsPrerenderDesc": { fr: "Ajoutez votre site pour améliorer son indexation par les moteurs de recherche.", en: "Add your site to improve its indexing by search engines." },
  "seoTest.responseTime": { fr: "Temps de réponse:", en: "Response time:" },
  "seoTest.close": { fr: "Fermer", en: "Close" },
  "seoTest.addMySite": { fr: "Ajouter mon site", en: "Add my site" },
  "seoTest.toastSuccess": { fr: "Analyse SEO terminée !", en: "SEO analysis completed!" },
  "seoTest.error": { fr: "Erreur lors de l'analyse", en: "Error during analysis" },
  "seoTest.errorLater": { fr: "Erreur lors de l'analyse. Réessayez plus tard.", en: "Error during analysis. Please try again later." },

  // Modals: prerender test
  "prerenderTest.title": { fr: "Tester le Prerendering", en: "Test prerendering" },
  "prerenderTest.enterUrl": { fr: "Veuillez entrer une URL", en: "Please enter a URL" },
  "prerenderTest.test": { fr: "Tester", en: "Test" },
  "prerenderTest.testing": { fr: "Test...", en: "Testing..." },
  "prerenderTest.status": { fr: "Status:", en: "Status:" },
  "prerenderTest.rawHtml": { fr: "HTML Brut", en: "Raw HTML" },
  "prerenderTest.preview": { fr: "Aperçu", en: "Preview" },
  "prerenderTest.metadata": { fr: "Métadonnées", en: "Metadata" },
  "prerenderTest.noContent": { fr: "Aucun contenu", en: "No content" },
  "prerenderTest.iframeTitle": { fr: "Aperçu du prerendering", en: "Prerender preview" },
  "prerenderTest.noPreview": { fr: "Aucun aperçu disponible", en: "No preview available" },
  "prerenderTest.notDefined": { fr: "Non défini", en: "Not defined" },
  "prerenderTest.notDefinedF": { fr: "Non définie", en: "Not defined" },
  "prerenderTest.renderTime": { fr: "Temps de rendu", en: "Render time" },
  "prerenderTest.size": { fr: "Taille", en: "Size" },
  "prerenderTest.enterUrlHint": { fr: "Entrez une URL et cliquez sur \"Tester\" pour voir le résultat du prerendering", en: "Enter a URL and click \"Test\" to see the prerendering result" },
  "prerenderTest.rendering": { fr: "Rendu de la page en cours...", en: "Rendering page..." },
  "prerenderTest.successToast": { fr: "Prerendering réussi !", en: "Prerendering succeeded!" },
  "prerenderTest.failToast": { fr: "Échec du prerendering", en: "Prerendering failed" },
  "prerenderTest.errorToast": { fr: "Erreur lors du test", en: "Error during test" },
  "prerenderTest.unknownError": { fr: "Erreur inconnue", en: "Unknown error" },

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

  // Subscription Card
  "subscription.title": { fr: "Abonnement", en: "Subscription" },
  "subscription.details": { fr: "Détails de votre abonnement actif", en: "Your active subscription details" },
  "subscription.noActive": { fr: "Aucun abonnement actif", en: "No active subscription" },
  "subscription.periodStart": { fr: "Début période", en: "Period start" },
  "subscription.nextRenewal": { fr: "Prochain renouvellement", en: "Next renewal" },
  "subscription.cancelledOn": { fr: "Votre abonnement sera annulé le", en: "Your subscription will be cancelled on" },
  "subscription.nextInvoice": { fr: "Prochaine facture", en: "Next invoice" },
  "subscription.on": { fr: "le", en: "on" },
  "subscription.manage": { fr: "Gérer l'abonnement", en: "Manage subscription" },
  "subscription.changePlan": { fr: "Changer de plan", en: "Change plan" },
  "subscription.noSubscription": { fr: "Vous n'avez pas d'abonnement actif", en: "You don't have an active subscription" },
  "subscription.discover": { fr: "Découvrir nos offres", en: "Discover our offers" },
  "subscription.invoiceHistory": { fr: "Historique des factures", en: "Invoice history" },
  "subscription.lastInvoices": { fr: "dernières factures", en: "last invoices" },
  "subscription.noInvoices": { fr: "Aucune facture disponible", en: "No invoices available" },
  "subscription.paid": { fr: "Payée", en: "Paid" },
  "subscription.pending": { fr: "En attente", en: "Pending" },
  "subscription.draft": { fr: "Brouillon", en: "Draft" },
  "subscription.cancelled": { fr: "Annulée", en: "Cancelled" },
  "subscription.unpaid": { fr: "Impayée", en: "Unpaid" },
  "subscription.unknown": { fr: "Inconnu", en: "Unknown" },
  "subscription.invoice": { fr: "Facture", en: "Invoice" },
  "subscription.portalError": { fr: "Impossible d'ouvrir le portail de gestion", en: "Unable to open management portal" },
  "subscription.free": { fr: "Gratuit", en: "Free" },

  // Add Site Modal
  "addSite.title": { fr: "Ajouter un site", en: "Add a site" },
  "addSite.description": { fr: "Ajoutez un nouveau site à surveiller pour le SEO dynamique.", en: "Add a new site to monitor for dynamic SEO." },
  "addSite.dnsTitle": { fr: "Configuration DNS requise", en: "DNS configuration required" },
  "addSite.dnsDescription": { fr: "Suivez ces 3 étapes pour vérifier votre domaine", en: "Follow these 3 steps to verify your domain" },
  "addSite.step1Title": { fr: "Accédez à votre gestionnaire DNS", en: "Access your DNS manager" },
  "addSite.step1Desc": { fr: "Connectez-vous au panneau de contrôle de votre registrar (OVH, Cloudflare, Gandi, etc.)", en: "Log in to your registrar control panel (OVH, Cloudflare, Gandi, etc.)" },
  "addSite.step2Title": { fr: "Créez un enregistrement TXT", en: "Create a TXT record" },
  "addSite.type": { fr: "Type", en: "Type" },
  "addSite.name": { fr: "Nom / Host", en: "Name / Host" },
  "addSite.value": { fr: "Valeur", en: "Value" },
  "addSite.step3Title": { fr: "Sauvegardez et patientez", en: "Save and wait" },
  "addSite.step3Desc": { fr: "La propagation DNS peut prendre jusqu'à 48h. Nous vérifierons automatiquement votre configuration.", en: "DNS propagation can take up to 48h. We will automatically verify your configuration." },
  "addSite.whyVerify": { fr: "Pourquoi cette vérification ?", en: "Why this verification?" },
  "addSite.whyVerifyDesc": { fr: "L'enregistrement TXT prouve que vous êtes le propriétaire du domaine", en: "The TXT record proves that you own the domain" },
  "addSite.dnsConfigured": { fr: "J'ai configuré mon DNS", en: "I have configured my DNS" },
  "addSite.limitReached": { fr: "Vous avez atteint la limite de", en: "You have reached the limit of" },
  "addSite.siteFor": { fr: "site(s) pour votre plan", en: "site(s) for your plan" },
  "addSite.upgradePrompt": { fr: "Passez à un plan supérieur pour ajouter plus de sites.", en: "Upgrade to a higher plan to add more sites." },
  "addSite.unlimited": { fr: "sites disponibles (illimité)", en: "sites available (unlimited)" },
  "addSite.remaining": { fr: "site(s) restant(s) sur votre plan", en: "site(s) remaining on your plan" },
  "addSite.siteName": { fr: "Nom du site", en: "Site name" },
  "addSite.siteNamePlaceholder": { fr: "Mon site web", en: "My website" },
  "addSite.url": { fr: "URL", en: "URL" },
  "addSite.cancel": { fr: "Annuler", en: "Cancel" },
  "addSite.add": { fr: "Ajouter", en: "Add" },
  "addSite.success": { fr: "Site ajouté avec succès", en: "Site added successfully" },
  "addSite.error": { fr: "Erreur lors de l'ajout du site", en: "Error adding site" },
  "addSite.loginRequired": { fr: "Vous devez être connecté pour ajouter un site", en: "You must be logged in to add a site" },
  "addSite.nameCopied": { fr: "Nom copié !", en: "Name copied!" },
  "addSite.tokenCopied": { fr: "Token copié !", en: "Token copied!" },
  "addSite.siteNameRequired": { fr: "Le nom du site est requis", en: "Site name is required" },
  "addSite.siteNameMax": { fr: "Le nom doit faire moins de 100 caractères", en: "Name must be less than 100 characters" },
  "addSite.urlRequired": { fr: "L'URL est requise", en: "URL is required" },
  "addSite.urlInvalid": { fr: "L'URL doit être valide (ex: https://example.com)", en: "URL must be valid (e.g., https://example.com)" },
  "addSite.urlMax": { fr: "L'URL doit faire moins de 255 caractères", en: "URL must be less than 255 characters" },

  // Delete Site Dialog
  "deleteSite.title": { fr: "Supprimer le site", en: "Delete site" },
  "deleteSite.confirm": { fr: "Êtes-vous sûr de vouloir supprimer", en: "Are you sure you want to delete" },
  "deleteSite.irreversible": { fr: "Cette action est irréversible.", en: "This action is irreversible." },
  "deleteSite.cancel": { fr: "Annuler", en: "Cancel" },
  "deleteSite.delete": { fr: "Supprimer", en: "Delete" },
  "deleteSite.deleting": { fr: "Suppression...", en: "Deleting..." },

  // Site Details Page
  "siteDetails.notFound": { fr: "Site non trouvé", en: "Site not found" },
  "siteDetails.refresh": { fr: "Rafraîchir", en: "Refresh" },
  "siteDetails.testPrerender": { fr: "Test Prerender", en: "Test Prerender" },
  "siteDetails.simulateCrawl": { fr: "Simuler Crawl", en: "Simulate Crawl" },
  "siteDetails.active": { fr: "Actif", en: "Active" },
  "siteDetails.pending": { fr: "En attente", en: "Pending" },
  "siteDetails.error": { fr: "Erreur", en: "Error" },
  "siteDetails.activate": { fr: "Activer", en: "Activate" },
  "siteDetails.dnsTooltip": { fr: "Configurez et vérifiez votre DNS avant d'activer le site.", en: "Configure and verify your DNS before activating the site." },
  "siteDetails.createdOn": { fr: "Créé le", en: "Created on" },
  "siteDetails.pagesRendered": { fr: "pages rendues", en: "pages rendered" },
  "siteDetails.lastCrawl": { fr: "Dernier crawl:", en: "Last crawl:" },
  "siteDetails.dnsConfig": { fr: "Configuration DNS", en: "DNS configuration" },
  "siteDetails.copiedToken": { fr: "Token copié !", en: "Token copied!" },
  "siteDetails.copyToken": { fr: "Copier Token", en: "Copy Token" },
  "siteDetails.copied": { fr: "Copié", en: "Copied" },
  "siteDetails.verifiedOn": { fr: "Vérifié le", en: "Verified on" },
  "siteDetails.detectedRecord": { fr: "Enregistrement détecté :", en: "Detected record:" },
  "siteDetails.txtNameCopied": { fr: "Nom TXT copié !", en: "TXT name copied!" },
  "siteDetails.totalCrawls": { fr: "Total crawls", en: "Total crawls" },
  "siteDetails.pagesCrawled": { fr: "Pages crawlées", en: "Pages crawled" },
  "siteDetails.googleCrawls": { fr: "Google crawls", en: "Google crawls" },
  "siteDetails.aiCrawls": { fr: "AI crawls", en: "AI crawls" },
  "siteDetails.crawlHistory": { fr: "Historique des crawls", en: "Crawl history" },
  "siteDetails.activities": { fr: "activités", en: "activities" },
  "siteDetails.noActivity": { fr: "Aucune activité de bot détectée pour ce site.", en: "No bot activity detected for this site." },
  "siteDetails.searchEngine": { fr: "Moteur de recherche", en: "Search engine" },
  "siteDetails.ai": { fr: "IA", en: "AI" },
  "siteDetails.pages": { fr: "pages", en: "pages" },
  "siteDetails.dnsNotVerified": { fr: "Vous devez d'abord vérifier votre configuration DNS avant d'activer le site.", en: "You must first verify your DNS configuration before activating the site." },
  "siteDetails.statusUpdateError": { fr: "Erreur lors de la mise à jour du statut", en: "Error updating status" },
  "siteDetails.siteActivated": { fr: "Site activé", en: "Site activated" },
  "siteDetails.siteDeactivated": { fr: "Site désactivé", en: "Site deactivated" },
  "siteDetails.sessionExpired": { fr: "Session expirée. Veuillez vous reconnecter.", en: "Session expired. Please log in again." },
  "siteDetails.dnsVerified": { fr: "DNS vérifié avec succès !", en: "DNS verified successfully!" },
  "siteDetails.dnsNotConfigured": { fr: "Le DNS n'est pas encore configuré", en: "DNS is not configured yet" },
  "siteDetails.dnsVerifyError": { fr: "Erreur lors de la vérification DNS. Réessayez.", en: "Error verifying DNS. Please try again." },
  "siteDetails.refreshError": { fr: "Erreur lors du rafraîchissement", en: "Error refreshing" },
  "siteDetails.dataRefreshed": { fr: "Données rafraîchies !", en: "Data refreshed!" },

  // Analytics Page
  "analytics.title": { fr: "Analytics", en: "Analytics" },
  "analytics.subtitle": { fr: "Statistiques détaillées de crawl par bot et période", en: "Detailed crawl statistics by bot and period" },
  "analytics.allSites": { fr: "Tous les sites", en: "All sites" },
  "analytics.days7": { fr: "7 derniers jours", en: "Last 7 days" },
  "analytics.days14": { fr: "14 derniers jours", en: "Last 14 days" },
  "analytics.days30": { fr: "30 derniers jours", en: "Last 30 days" },
  "analytics.days90": { fr: "90 derniers jours", en: "Last 90 days" },
  "analytics.totalCrawls": { fr: "Total crawls", en: "Total crawls" },
  "analytics.engineCrawls": { fr: "Crawls moteurs", en: "Engine crawls" },
  "analytics.aiCrawls": { fr: "Crawls IA", en: "AI crawls" },
  "analytics.uniqueBots": { fr: "Bots uniques", en: "Unique bots" },
  "analytics.timeline": { fr: "Chronologie", en: "Timeline" },
  "analytics.byBot": { fr: "Par Bot", en: "By Bot" },
  "analytics.details": { fr: "Détails", en: "Details" },
  "analytics.crawlsByDay": { fr: "Crawls par jour", en: "Crawls by day" },
  "analytics.crawlsByDayDesc": { fr: "Évolution des crawls Google vs IA sur la période sélectionnée", en: "Evolution of Google vs AI crawls over the selected period" },
  "analytics.noDataPeriod": { fr: "Aucune donnée pour cette période", en: "No data for this period" },
  "analytics.searchEngines": { fr: "Moteurs de recherche", en: "Search engines" },
  "analytics.aiBots": { fr: "Bots IA", en: "AI bots" },
  "analytics.botDistribution": { fr: "Répartition par bot", en: "Distribution by bot" },
  "analytics.pagesCrawledByBot": { fr: "Pages crawlées par chaque bot", en: "Pages crawled by each bot" },
  "analytics.topBots": { fr: "Top bots", en: "Top bots" },
  "analytics.rankingByCrawls": { fr: "Classement par nombre de crawls", en: "Ranking by number of crawls" },
  "analytics.pagesCrawled": { fr: "Pages crawlées", en: "Pages crawled" },
  "analytics.recentActivity": { fr: "Activité récente", en: "Recent activity" },
  "analytics.last20crawls": { fr: "Les 20 derniers crawls détectés", en: "Last 20 detected crawls" },
  "analytics.noRecentActivity": { fr: "Aucune activité récente", en: "No recent activity" },
  "analytics.bot": { fr: "Bot", en: "Bot" },
  "analytics.type": { fr: "Type", en: "Type" },
  "analytics.pages": { fr: "Pages", en: "Pages" },
  "analytics.date": { fr: "Date", en: "Date" },
  "analytics.engine": { fr: "Moteur", en: "Engine" },
  "analytics.ai": { fr: "IA", en: "AI" },
  "analytics.loadError": { fr: "Erreur lors du chargement des données", en: "Error loading data" },

  // Settings Page
  "settings.title": { fr: "Paramètres", en: "Settings" },
  "settings.subtitle": { fr: "Gérez votre profil et vos préférences", en: "Manage your profile and preferences" },
  "settings.profile": { fr: "Profil", en: "Profile" },
  "settings.avatarSync": { fr: "Avatar synchronisé avec Google", en: "Avatar synchronized with Google" },
  "settings.fullName": { fr: "Nom complet", en: "Full name" },
  "settings.fullNamePlaceholder": { fr: "Votre nom", en: "Your name" },
  "settings.email": { fr: "Email", en: "Email" },
  "settings.emailNotEditable": { fr: "L'email ne peut pas être modifié", en: "Email cannot be changed" },
  "settings.save": { fr: "Sauvegarder", en: "Save" },
  "settings.saveError": { fr: "Erreur lors de la sauvegarde", en: "Error saving" },
  "settings.profileUpdated": { fr: "Profil mis à jour", en: "Profile updated" },
  "settings.notifications": { fr: "Notifications", en: "Notifications" },
  "settings.emailNotifications": { fr: "Notifications par email", en: "Email notifications" },
  "settings.emailNotificationsDesc": { fr: "Recevez des notifications importantes par email", en: "Receive important notifications by email" },
  "settings.weeklyReport": { fr: "Rapport hebdomadaire", en: "Weekly report" },
  "settings.weeklyReportDesc": { fr: "Recevez un résumé de vos statistiques chaque semaine", en: "Receive a summary of your statistics each week" },
  "settings.crawlAlerts": { fr: "Alertes de crawl", en: "Crawl alerts" },
  "settings.crawlAlertsDesc": { fr: "Soyez alerté lors d'une activité inhabituelle", en: "Be alerted when there is unusual activity" },
  "settings.security": { fr: "Sécurité", en: "Security" },
  "settings.googleConnected": { fr: "Connexion Google", en: "Google connection" },
  "settings.linkedToGoogle": { fr: "Votre compte est lié à Google", en: "Your account is linked to Google" },
  "settings.connected": { fr: "Connecté", en: "Connected" },
  "settings.dangerZone": { fr: "Zone dangereuse", en: "Danger zone" },
  "settings.deleteAccountWarning": { fr: "La suppression de votre compte est irréversible. Toutes vos données seront perdues.", en: "Deleting your account is irreversible. All your data will be lost." },
  "settings.deleteAccount": { fr: "Supprimer mon compte", en: "Delete my account" },

  // DNS Status Badge
  "dns.verified": { fr: "DNS vérifié", en: "DNS verified" },
  "dns.pendingVerification": { fr: "En attente de vérification DNS", en: "Pending DNS verification" },
  "dns.error": { fr: "Erreur DNS", en: "DNS error" },
  "dns.configRequired": { fr: "Configuration DNS requise", en: "DNS configuration required" },
  "dns.txtInstructions": { fr: "Configurez votre DNS avec l'enregistrement TXT suivant (le nom/host doit être", en: "Configure your DNS with the following TXT record (the name/host must be" },
  "dns.someRegistrars": { fr: "— certains registrars demandent", en: "— some registrars require" },
  "dns.type": { fr: "Type :", en: "Type:" },
  "dns.name": { fr: "Nom / Host :", en: "Name / Host:" },
  "dns.value": { fr: "Valeur :", en: "Value:" },
  "dns.verifying": { fr: "Vérification...", en: "Verifying..." },
  "dns.verify": { fr: "Vérifier DNS", en: "Verify DNS" },
  "dns.cnameInstructions": { fr: "Configurez votre DNS avec l'enregistrement CNAME suivant :", en: "Configure your DNS with the following CNAME record:" },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const defaultContext: I18nContextType = {
  lang: "fr",
  setLang: () => {},
  t: (key: string) => staticTranslations[key]?.fr || key,
  isLoading: false,
};

const I18nContext = createContext<I18nContextType>(defaultContext);

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
  return useContext(I18nContext);
};

// Export static translations for admin interface
export { staticTranslations };
