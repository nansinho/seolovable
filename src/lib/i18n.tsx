import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Language = "fr" | "en";

interface TranslationRow {
  key: string;
  lang: string;
  value: string;
}

/**
 * RÈGLE IMPORTANTE : 100% LibreTranslate
 * 
 * Ce fichier contient UNIQUEMENT les traductions françaises (source).
 * Toutes les traductions anglaises sont générées par LibreTranslate et stockées en base de données.
 * 
 * Pour ajouter une nouvelle traduction :
 * 1. Ajouter la clé française ici
 * 2. Aller sur /admin/translations et cliquer "Importer FR + Traduire EN"
 * 3. LibreTranslate génèrera automatiquement la version anglaise
 * 
 * NE JAMAIS ajouter de traductions anglaises manuellement dans ce fichier !
 */

// Fallback static translations - FRENCH ONLY (EN comes from LibreTranslate via DB)
const staticTranslations: Record<string, Record<Language, string>> = {
  // Integration Panel
  "integration.title": { fr: "Intégration Prerender", en: "" },
  "integration.yourToken": { fr: "Votre token Prerender", en: "" },
  "integration.tokenCopied": { fr: "Token copié !", en: "" },
  "integration.copied": { fr: "Copié", en: "" },
  "integration.copy": { fr: "Copier", en: "" },
  "integration.copyCode": { fr: "Copier le code", en: "" },
  "integration.codeCopied": { fr: "Code copié !", en: "" },
  "integration.instructions": { fr: "Instructions", en: "" },
  "integration.instructionsDetail": { fr: "Copiez ce fichier middleware.ts à la racine de votre projet Next.js. Il détectera automatiquement les bots et servira le contenu prérendu.", en: "" },
  "integration.middlewareTitle": { fr: "Middleware Next.js", en: "" },
  "integration.copyAll": { fr: "Copier tout", en: "" },
  "integration.allCopied": { fr: "Tout copié !", en: "" },

  // Prerender Stats
  "prerenderStats.title": { fr: "Statistiques Prerender", en: "" },
  "prerenderStats.total": { fr: "Total rendus", en: "" },
  "prerenderStats.cached": { fr: "Cache", en: "" },
  "prerenderStats.fresh": { fr: "Frais", en: "" },
  "prerenderStats.cacheRate": { fr: "Taux de cache", en: "" },
  "prerenderStats.last6months": { fr: "6 derniers mois", en: "" },
  "prerenderStats.recentLogs": { fr: "Derniers logs", en: "" },
  "prerenderStats.noLogs": { fr: "Aucun log pour le moment", en: "" },

  // Dashboard extras
  "dashboard.renders": { fr: "rendus", en: "" },
  "dashboard.chart.cached": { fr: "Cache", en: "" },
  "dashboard.chart.fresh": { fr: "Frais", en: "" },
  "dashboard.chart.noData": { fr: "Aucune donnée disponible", en: "" },

  // Navigation
  "nav.home": { fr: "Accueil", en: "" },
  "nav.how": { fr: "Comment ça marche", en: "" },
  "nav.pricing": { fr: "Tarifs", en: "" },
  "nav.login": { fr: "Connexion", en: "" },
  "nav.trial": { fr: "Essai gratuit", en: "" },

  // Hero Section
  "hero.tag": { fr: "// Prerender pour Lovable", en: "" },
  "hero.title1": { fr: "Soyez visible partout où vos clients", en: "" },
  "hero.title2": { fr: "cherchent", en: "" },
  "hero.subtitle": { fr: "Ne perdez plus de trafic à cause de votre plateforme IA. Rendez vos sites Lovable visibles sur Google, ChatGPT, Claude et Perplexity.", en: "" },
  "hero.cta": { fr: "Démarrer l'essai gratuit", en: "" },
  "hero.cta2": { fr: "Comment ça marche", en: "" },
  "hero.trusted": { fr: "Compatible avec:", en: "" },

  // Problem Section
  "problem.title1": { fr: "Vos Apps IA sont", en: "" },
  "problem.title2": { fr: "Invisibles", en: "" },
  "problem.subtitle": { fr: "Google et les réseaux sociaux ne voient pas ce que vous avez créé - juste des pages vides.", en: "" },
  "problem.desc": { fr: "Quand vous partagez votre lien sur les réseaux sociaux, l'aperçu est cassé. Quand Google essaie d'indexer vos pages, il ne voit rien. C'est parce que votre contenu se charge avec JavaScript - et les bots n'attendent pas.", en: "" },
  "problem.bots": { fr: "Ce que les bots voient:", en: "" },
  "problem.indexed": { fr: "Ce qui devrait être indexé:", en: "" },

  // Solution Section
  "solution.tag": { fr: "// Comment ça marche", en: "" },
  "solution.title": { fr: "4 étapes vers la visibilité SEO", en: "" },
  "step.1.title": { fr: "Inscription", en: "" },
  "step.1.desc": { fr: "Créez votre compte et ajoutez votre URL Lovable", en: "" },
  "step.2.title": { fr: "Ajoutez le CNAME", en: "" },
  "step.2.desc": { fr: "Configuration DNS simple, copier-coller en 30 secondes", en: "" },
  "step.3.title": { fr: "Vérification auto", en: "" },
  "step.3.desc": { fr: "Notre système valide votre configuration", en: "" },
  "step.4.title": { fr: "Vous êtes en ligne", en: "" },
  "step.4.desc": { fr: "Votre site est maintenant indexable par tous les bots", en: "" },

  // Features Section
  "features.title": { fr: "Tout ce dont vous avez besoin", en: "" },
  "features.subtitle": { fr: "Des fonctionnalités puissantes pour un SEO Lovable parfait", en: "" },
  "feature.1.title": { fr: "Prerender à la demande", en: "" },
  "feature.1.desc": { fr: "Cache intelligent qui génère le HTML à la volée pour chaque page", en: "" },
  "feature.2.title": { fr: "Multi-sites", en: "" },
  "feature.2.desc": { fr: "Gérez tous vos projets Lovable depuis un seul dashboard", en: "" },
  "feature.3.title": { fr: "Stats bots temps réel", en: "" },
  "feature.3.desc": { fr: "Suivez les crawls de Google, Bing, ChatGPT, Claude", en: "" },
  "feature.4.title": { fr: "SSL gratuit & RGPD", en: "" },
  "feature.4.desc": { fr: "Certificat SSL auto, aucune donnée personnelle stockée", en: "" },
  "feature.5.title": { fr: "Config en 5 min", en: "" },
  "feature.5.desc": { fr: "Configuration ultra-rapide sans toucher à votre code", en: "" },
  "feature.6.title": { fr: "Intégration IA", en: "" },
  "feature.6.desc": { fr: "L'IA analyse et optimise votre contenu SEO", en: "" },

  // Pricing Section
  "pricing.title": { fr: "Tarifs simples", en: "" },
  "pricing.subtitle": { fr: "Promo lancement - Offre limitée", en: "" },
  "pricing.popular": { fr: "Populaire", en: "" },
  "pricing.cta": { fr: "Commencer", en: "" },
  "pricing.cancel": { fr: "Annulez quand vous voulez", en: "" },
  "pricing.refund": { fr: "Remboursement 30 jours", en: "" },
  "pricing.trial": { fr: "14 jours d'essai gratuit", en: "" },
  "plan.starter": { fr: "Starter", en: "" },
  "plan.starter.desc": { fr: "Idéal pour démarrer", en: "" },
  "plan.starter.f1": { fr: "1 site web", en: "" },
  "plan.starter.f2": { fr: "10 000 pages/mois", en: "" },
  "plan.starter.f3": { fr: "Support par email", en: "" },
  "plan.starter.f4": { fr: "Rapports basiques", en: "" },
  "plan.starter.f5": { fr: "SSL inclus", en: "" },
  "plan.pro": { fr: "Pro", en: "" },
  "plan.pro.desc": { fr: "Pour les équipes ambitieuses", en: "" },
  "plan.pro.f1": { fr: "5 sites web", en: "" },
  "plan.pro.f2": { fr: "Pages illimitées", en: "" },
  "plan.pro.f3": { fr: "Analytics avancés", en: "" },
  "plan.pro.f4": { fr: "Support prioritaire", en: "" },
  "plan.pro.f5": { fr: "Accès API", en: "" },
  "plan.pro.f6": { fr: "Webhooks", en: "" },
  "plan.business": { fr: "Business", en: "" },
  "plan.business.desc": { fr: "Solution entreprise", en: "" },
  "plan.business.f1": { fr: "Sites illimités", en: "" },
  "plan.business.f2": { fr: "Rapports SEO détaillés", en: "" },
  "plan.business.f3": { fr: "Support 24/7", en: "" },
  "plan.business.f4": { fr: "API complète", en: "" },
  "plan.business.f5": { fr: "Manager dédié", en: "" },
  "plan.business.f6": { fr: "SLA 99.9%", en: "" },

  // Footer
  "footer.desc": { fr: "Prerender pour sites Lovable. Rendez votre contenu visible pour Google et les AI crawlers.", en: "" },
  "footer.product": { fr: "Produit", en: "" },
  "footer.legal": { fr: "Légal", en: "" },
  "footer.privacy": { fr: "Confidentialité", en: "" },
  "footer.terms": { fr: "CGV", en: "" },
  "footer.legalNotice": { fr: "Mentions légales", en: "" },

  // Sidebar Navigation
  "sidebar.dashboard": { fr: "Dashboard", en: "" },
  "sidebar.analytics": { fr: "Analytics", en: "" },
  "sidebar.subscription": { fr: "Abonnement", en: "" },
  "sidebar.settings": { fr: "Paramètres", en: "" },
  "sidebar.admin": { fr: "Administration", en: "" },
  "sidebar.users": { fr: "Utilisateurs", en: "" },
  "sidebar.allSites": { fr: "Tous les sites", en: "" },
  "sidebar.translations": { fr: "Traductions", en: "" },
  "sidebar.logout": { fr: "Déconnexion", en: "" },

  // Dashboard
  "dashboard.title": { fr: "Dashboard", en: "" },
  "dashboard.subtitle": { fr: "Vue d'ensemble de vos sites et statistiques", en: "" },
  "dashboard.testPrerender": { fr: "Test Prerender", en: "" },
  "dashboard.addSite": { fr: "Ajouter un site", en: "" },
  "dashboard.siteQuota": { fr: "Quota de sites", en: "" },
  "dashboard.plan": { fr: "Plan", en: "" },
  "dashboard.upgrade": { fr: "Passer au supérieur", en: "" },
  "dashboard.manageSub": { fr: "Gérer mon abonnement", en: "" },
  "dashboard.unlimitedSites": { fr: "Sites illimités", en: "" },
  "dashboard.sitesCreated": { fr: "site(s) créé(s)", en: "" },
  "dashboard.sitesUsed": { fr: "sites utilisés", en: "" },
  "dashboard.remaining": { fr: "restant(s)", en: "" },
  "dashboard.noDataToday": { fr: "Aucune donnée disponible pour aujourd'hui", en: "" },
  "dashboard.pagesRendered": { fr: "Pages rendues", en: "" },
  "dashboard.botsToday": { fr: "Bots aujourd'hui", en: "" },
  "dashboard.googleCrawls": { fr: "Google crawls", en: "" },
  "dashboard.aiCrawls": { fr: "AI crawls", en: "" },
  "dashboard.crawlsEvolution": { fr: "Évolution des crawls", en: "" },
  "dashboard.last7days": { fr: "7 derniers jours", en: "" },
  "dashboard.mySites": { fr: "Mes sites", en: "" },
  "dashboard.sites": { fr: "sites", en: "" },
  "dashboard.noSites": { fr: "Aucun site ajouté. Cliquez sur \"Ajouter un site\" pour commencer.", en: "" },
  "dashboard.active": { fr: "Actif", en: "" },
  "dashboard.pending": { fr: "En attente", en: "" },
  "dashboard.error": { fr: "Erreur", en: "" },
  "dashboard.dnsRequired": { fr: "Config DNS requise", en: "" },
  "dashboard.lastCrawl": { fr: "Dernier crawl", en: "" },
  "dashboard.never": { fr: "Jamais", en: "" },
  "dashboard.recentActivity": { fr: "Activité récente", en: "" },
  "dashboard.noRecentActivity": { fr: "Aucune activité récente", en: "" },
  "dashboard.chart.google": { fr: "Google", en: "" },
  "dashboard.chart.ai": { fr: "IA", en: "" },

  // Modals: SEO test
  "seoTest.title": { fr: "Analyse SEO", en: "" },
  "seoTest.siteAnalyzed": { fr: "Site analysé", en: "" },
  "seoTest.loading": { fr: "Analyse en cours...", en: "" },
  "seoTest.retry": { fr: "Réessayer", en: "" },
  "seoTest.score": { fr: "Score SEO", en: "" },
  "seoTest.titleTag": { fr: "Balise title", en: "" },
  "seoTest.metaDescription": { fr: "Meta description", en: "" },
  "seoTest.h1Tag": { fr: "Balise H1", en: "" },
  "seoTest.canonical": { fr: "Canonical", en: "" },
  "seoTest.needsPrerenderTitle": { fr: "Votre site a besoin de prerendering", en: "" },
  "seoTest.needsPrerenderDesc": { fr: "Ajoutez votre site pour améliorer son indexation par les moteurs de recherche.", en: "" },
  "seoTest.responseTime": { fr: "Temps de réponse:", en: "" },
  "seoTest.close": { fr: "Fermer", en: "" },
  "seoTest.addMySite": { fr: "Ajouter mon site", en: "" },
  "seoTest.toastSuccess": { fr: "Analyse SEO terminée !", en: "" },
  "seoTest.error": { fr: "Erreur lors de l'analyse", en: "" },
  "seoTest.errorLater": { fr: "Erreur lors de l'analyse. Réessayez plus tard.", en: "" },
  "seoTest.rateLimited": { fr: "Limite atteinte. Créez un compte gratuit pour plus de tests.", en: "" },

  // Modals: prerender test
  "prerenderTest.title": { fr: "Tester le Prerendering", en: "" },
  "prerenderTest.enterUrl": { fr: "Veuillez entrer une URL", en: "" },
  "prerenderTest.test": { fr: "Tester", en: "" },
  "prerenderTest.testing": { fr: "Test...", en: "" },
  "prerenderTest.status": { fr: "Status:", en: "" },
  "prerenderTest.rawHtml": { fr: "HTML Brut", en: "" },
  "prerenderTest.preview": { fr: "Aperçu", en: "" },
  "prerenderTest.metadata": { fr: "Métadonnées", en: "" },
  "prerenderTest.noContent": { fr: "Aucun contenu", en: "" },
  "prerenderTest.iframeTitle": { fr: "Aperçu du prerendering", en: "" },
  "prerenderTest.noPreview": { fr: "Aucun aperçu disponible", en: "" },
  "prerenderTest.notDefined": { fr: "Non défini", en: "" },
  "prerenderTest.notDefinedF": { fr: "Non définie", en: "" },
  "prerenderTest.renderTime": { fr: "Temps de rendu", en: "" },
  "prerenderTest.size": { fr: "Taille", en: "" },
  "prerenderTest.enterUrlHint": { fr: "Entrez une URL et cliquez sur \"Tester\" pour voir le résultat du prerendering", en: "" },
  "prerenderTest.rendering": { fr: "Rendu de la page en cours...", en: "" },
  "prerenderTest.successToast": { fr: "Prerendering réussi !", en: "" },
  "prerenderTest.failToast": { fr: "Échec du prerendering", en: "" },
  "prerenderTest.errorToast": { fr: "Erreur lors du test", en: "" },
  "prerenderTest.unknownError": { fr: "Erreur inconnue", en: "" },

  // Admin Users
  "admin.users.title": { fr: "Utilisateurs", en: "" },
  "admin.users.subtitle": { fr: "Gestion des utilisateurs et des rôles", en: "" },
  "admin.users.search": { fr: "Rechercher un utilisateur...", en: "" },
  "admin.users.email": { fr: "Email", en: "" },
  "admin.users.status": { fr: "Statut", en: "" },
  "admin.users.plan": { fr: "Plan", en: "" },
  "admin.users.sites": { fr: "Sites", en: "" },
  "admin.users.registeredOn": { fr: "Inscrit le", en: "" },
  "admin.users.actions": { fr: "Actions", en: "" },
  "admin.users.noUsers": { fr: "Aucun utilisateur trouvé", en: "" },
  "admin.users.admin": { fr: "Admin", en: "" },
  "admin.users.blocked": { fr: "Bloqué", en: "" },
  "admin.users.user": { fr: "Utilisateur", en: "" },
  "admin.users.unlimited": { fr: "Illimité (Admin)", en: "" },
  "admin.users.available": { fr: "dispo", en: "" },
  "admin.users.limit": { fr: "limite", en: "" },
  "admin.users.promoteAdmin": { fr: "Promouvoir admin", en: "" },
  "admin.users.removeAdmin": { fr: "Retirer admin", en: "" },
  "admin.users.block": { fr: "Bloquer", en: "" },
  "admin.users.unblock": { fr: "Débloquer", en: "" },
  "admin.users.totalUsers": { fr: "Utilisateurs", en: "" },
  "admin.users.totalSites": { fr: "Sites totaux", en: "" },
  "admin.users.totalPages": { fr: "Pages rendues", en: "" },
  "admin.users.totalCrawls": { fr: "Total crawls", en: "" },

  // Admin Sites
  "admin.sites.title": { fr: "Tous les sites", en: "" },
  "admin.sites.total": { fr: "sites au total", en: "" },
  "admin.sites.search": { fr: "Rechercher par site, URL ou propriétaire...", en: "" },
  "admin.sites.addSite": { fr: "Ajouter un site", en: "" },
  "admin.sites.site": { fr: "Site", en: "" },
  "admin.sites.owner": { fr: "Propriétaire", en: "" },
  "admin.sites.status": { fr: "Status", en: "" },
  "admin.sites.pages": { fr: "Pages", en: "" },
  "admin.sites.createdOn": { fr: "Créé le", en: "" },
  "admin.sites.lastCrawl": { fr: "Dernier crawl", en: "" },
  "admin.sites.actions": { fr: "Actions", en: "" },
  "admin.sites.noSites": { fr: "Aucun site trouvé", en: "" },
  "admin.sites.active": { fr: "Actif", en: "" },
  "admin.sites.pending": { fr: "En attente", en: "" },
  "admin.sites.error": { fr: "Erreur", en: "" },
  "admin.sites.never": { fr: "Jamais", en: "" },
  "admin.sites.unknownUser": { fr: "Utilisateur inconnu", en: "" },
  "admin.sites.deleteSite": { fr: "Supprimer le site ?", en: "" },
  "admin.sites.deleteConfirm": { fr: "Êtes-vous sûr de vouloir supprimer", en: "" },
  "admin.sites.irreversible": { fr: "Cette action est irréversible.", en: "" },
  "admin.sites.cancel": { fr: "Annuler", en: "" },
  "admin.sites.delete": { fr: "Supprimer", en: "" },
  "admin.sites.deleting": { fr: "Suppression...", en: "" },

  // Admin Translations
  "admin.translations.title": { fr: "Gestion des traductions", en: "" },
  "admin.translations.count": { fr: "traductions en base", en: "" },
  "admin.translations.keys": { fr: "clés uniques", en: "" },
  "admin.translations.importStatic": { fr: "Importer statiques", en: "" },
  "admin.translations.translateMissing": { fr: "Traduire manquantes", en: "" },
  "admin.translations.searchKey": { fr: "Rechercher une clé...", en: "" },
  "admin.translations.all": { fr: "Toutes", en: "" },
  "admin.translations.auto": { fr: "Auto", en: "" },
  "admin.translations.manual": { fr: "Manuelles", en: "" },
  "admin.translations.missing": { fr: "Manquantes", en: "" },
  "admin.translations.static": { fr: "Statique", en: "" },
  "admin.translations.notDefined": { fr: "Non défini", en: "" },

  // Common
  "common.loading": { fr: "Chargement...", en: "" },
  "common.error": { fr: "Erreur", en: "" },
  "common.success": { fr: "Succès", en: "" },
  "common.save": { fr: "Enregistrer", en: "" },
  "common.cancel": { fr: "Annuler", en: "" },
  "common.delete": { fr: "Supprimer", en: "" },
  "common.edit": { fr: "Modifier", en: "" },
  "common.close": { fr: "Fermer", en: "" },
  "common.confirm": { fr: "Confirmer", en: "" },
  "common.checkingAdmin": { fr: "Vérification des droits admin...", en: "" },
  "common.checkingRights": { fr: "Vérification des droits...", en: "" },

  // Toast messages
  "toast.deleteError": { fr: "Erreur lors de la suppression", en: "" },
  "toast.deleteSuccess": { fr: "Site supprimé", en: "" },
  "toast.loadError": { fr: "Erreur lors du chargement", en: "" },
  "toast.planChanged": { fr: "Plan modifié en", en: "" },
  "toast.planError": { fr: "Erreur lors de la modification du plan", en: "" },
  "toast.alreadyAdmin": { fr: "Cet utilisateur est déjà admin", en: "" },
  "toast.promoteError": { fr: "Erreur lors de la promotion", en: "" },
  "toast.promoteSuccess": { fr: "Utilisateur promu admin", en: "" },
  "toast.cannotRemoveSelf": { fr: "Vous ne pouvez pas vous retirer les droits admin", en: "" },
  "toast.removeAdminError": { fr: "Erreur lors de la suppression des droits", en: "" },
  "toast.removeAdminSuccess": { fr: "Droits admin retirés", en: "" },
  "toast.cannotBlockSelf": { fr: "Vous ne pouvez pas vous bloquer vous-même", en: "" },
  "toast.alreadyBlocked": { fr: "Cet utilisateur est déjà bloqué", en: "" },
  "toast.blockError": { fr: "Erreur lors du blocage", en: "" },
  "toast.blockSuccess": { fr: "Utilisateur bloqué", en: "" },
  "toast.unblockError": { fr: "Erreur lors du déblocage", en: "" },
  "toast.unblockSuccess": { fr: "Utilisateur débloqué", en: "" },
  "toast.logoutError": { fr: "Erreur lors de la déconnexion", en: "" },
  "toast.logoutSuccess": { fr: "Déconnexion réussie", en: "" },
  "toast.translationSaved": { fr: "Traduction sauvegardée", en: "" },
  "toast.syncComplete": { fr: "Synchronisation terminée", en: "" },
  "toast.translationsAdded": { fr: "traductions ajoutées", en: "" },
  "toast.translationsImported": { fr: "traductions importées", en: "" },

  // Subscription Card
  "subscription.title": { fr: "Abonnement", en: "" },
  "subscription.details": { fr: "Détails de votre abonnement actif", en: "" },
  "subscription.noActive": { fr: "Aucun abonnement actif", en: "" },
  "subscription.periodStart": { fr: "Début période", en: "" },
  "subscription.nextRenewal": { fr: "Prochain renouvellement", en: "" },
  "subscription.cancelledOn": { fr: "Votre abonnement sera annulé le", en: "" },
  "subscription.nextInvoice": { fr: "Prochaine facture", en: "" },
  "subscription.on": { fr: "le", en: "" },
  "subscription.manage": { fr: "Gérer l'abonnement", en: "" },
  "subscription.changePlan": { fr: "Changer de plan", en: "" },
  "subscription.noSubscription": { fr: "Vous n'avez pas d'abonnement actif", en: "" },
  "subscription.discover": { fr: "Découvrir nos offres", en: "" },
  "subscription.invoiceHistory": { fr: "Historique des factures", en: "" },
  "subscription.lastInvoices": { fr: "dernières factures", en: "" },
  "subscription.noInvoices": { fr: "Aucune facture disponible", en: "" },
  "subscription.paid": { fr: "Payée", en: "" },
  "subscription.pending": { fr: "En attente", en: "" },
  "subscription.draft": { fr: "Brouillon", en: "" },
  "subscription.cancelled": { fr: "Annulée", en: "" },
  "subscription.unpaid": { fr: "Impayée", en: "" },
  "subscription.unknown": { fr: "Inconnu", en: "" },
  "subscription.invoice": { fr: "Facture", en: "" },
  "subscription.portalError": { fr: "Impossible d'ouvrir le portail de gestion", en: "" },
  "subscription.free": { fr: "Gratuit", en: "" },

  // Add Site Modal
  "addSite.title": { fr: "Ajouter un site", en: "" },
  "addSite.description": { fr: "Ajoutez un nouveau site à surveiller pour le SEO dynamique.", en: "" },
  "addSite.dnsTitle": { fr: "Configuration DNS requise", en: "" },
  "addSite.dnsDescription": { fr: "Suivez ces 3 étapes pour vérifier votre domaine", en: "" },
  "addSite.step1Title": { fr: "Accédez à votre gestionnaire DNS", en: "" },
  "addSite.step1Desc": { fr: "Connectez-vous au panneau de contrôle de votre registrar (OVH, Cloudflare, Gandi, etc.)", en: "" },
  "addSite.step2Title": { fr: "Créez un enregistrement TXT", en: "" },
  "addSite.type": { fr: "Type", en: "" },
  "addSite.name": { fr: "Nom / Host", en: "" },
  "addSite.value": { fr: "Valeur", en: "" },
  "addSite.step3Title": { fr: "Sauvegardez et patientez", en: "" },
  "addSite.step3Desc": { fr: "La propagation DNS peut prendre jusqu'à 48h. Nous vérifierons automatiquement votre configuration.", en: "" },
  "addSite.whyVerify": { fr: "Pourquoi cette vérification ?", en: "" },
  "addSite.whyVerifyDesc": { fr: "L'enregistrement TXT prouve que vous êtes le propriétaire du domaine", en: "" },
  "addSite.dnsConfigured": { fr: "J'ai configuré mon DNS", en: "" },
  "addSite.limitReached": { fr: "Vous avez atteint la limite de", en: "" },
  "addSite.siteFor": { fr: "site(s) pour votre plan", en: "" },
  "addSite.upgradePrompt": { fr: "Passez à un plan supérieur pour ajouter plus de sites.", en: "" },
  "addSite.unlimited": { fr: "sites disponibles (illimité)", en: "" },
  "addSite.remaining": { fr: "site(s) restant(s) sur votre plan", en: "" },
  "addSite.siteName": { fr: "Nom du site", en: "" },
  "addSite.siteNamePlaceholder": { fr: "Mon site web", en: "" },
  "addSite.url": { fr: "URL", en: "" },
  "addSite.cancel": { fr: "Annuler", en: "" },
  "addSite.add": { fr: "Ajouter", en: "" },
  "addSite.success": { fr: "Site ajouté avec succès", en: "" },
  "addSite.error": { fr: "Erreur lors de l'ajout du site", en: "" },
  "addSite.loginRequired": { fr: "Vous devez être connecté pour ajouter un site", en: "" },
  "addSite.nameCopied": { fr: "Nom copié !", en: "" },
  "addSite.tokenCopied": { fr: "Token copié !", en: "" },
  "addSite.siteNameRequired": { fr: "Le nom du site est requis", en: "" },
  "addSite.siteNameMax": { fr: "Le nom doit faire moins de 100 caractères", en: "" },
  "addSite.urlRequired": { fr: "L'URL est requise", en: "" },
  "addSite.urlInvalid": { fr: "L'URL doit être valide (ex: https://example.com)", en: "" },
  "addSite.urlMax": { fr: "L'URL doit faire moins de 255 caractères", en: "" },

  // Delete Site Dialog
  "deleteSite.title": { fr: "Supprimer le site", en: "" },
  "deleteSite.confirm": { fr: "Êtes-vous sûr de vouloir supprimer", en: "" },
  "deleteSite.irreversible": { fr: "Cette action est irréversible.", en: "" },
  "deleteSite.cancel": { fr: "Annuler", en: "" },
  "deleteSite.delete": { fr: "Supprimer", en: "" },
  "deleteSite.deleting": { fr: "Suppression...", en: "" },

  // Site Details Page
  "siteDetails.notFound": { fr: "Site non trouvé", en: "" },
  "siteDetails.refresh": { fr: "Rafraîchir", en: "" },
  "siteDetails.testPrerender": { fr: "Test Prerender", en: "" },
  "siteDetails.simulateCrawl": { fr: "Simuler Crawl", en: "" },
  "siteDetails.active": { fr: "Actif", en: "" },
  "siteDetails.pending": { fr: "En attente", en: "" },
  "siteDetails.error": { fr: "Erreur", en: "" },
  "siteDetails.activate": { fr: "Activer", en: "" },
  "siteDetails.dnsTooltip": { fr: "Configurez et vérifiez votre DNS avant d'activer le site.", en: "" },
  "siteDetails.createdOn": { fr: "Créé le", en: "" },
  "siteDetails.pagesRendered": { fr: "pages rendues", en: "" },
  "siteDetails.lastCrawl": { fr: "Dernier crawl:", en: "" },
  "siteDetails.dnsConfig": { fr: "Configuration DNS", en: "" },
  "siteDetails.copiedToken": { fr: "Token copié !", en: "" },
  "siteDetails.copyToken": { fr: "Copier Token", en: "" },
  "siteDetails.copied": { fr: "Copié", en: "" },
  "siteDetails.verifiedOn": { fr: "Vérifié le", en: "" },
  "siteDetails.detectedRecord": { fr: "Enregistrement détecté :", en: "" },
  "siteDetails.txtNameCopied": { fr: "Nom TXT copié !", en: "" },
  "siteDetails.totalCrawls": { fr: "Total crawls", en: "" },
  "siteDetails.pagesCrawled": { fr: "Pages crawlées", en: "" },
  "siteDetails.googleCrawls": { fr: "Google crawls", en: "" },
  "siteDetails.aiCrawls": { fr: "AI crawls", en: "" },
  "siteDetails.crawlHistory": { fr: "Historique des crawls", en: "" },
  "siteDetails.activities": { fr: "activités", en: "" },
  "siteDetails.noActivity": { fr: "Aucune activité de bot détectée pour ce site.", en: "" },
  "siteDetails.searchEngine": { fr: "Moteur de recherche", en: "" },
  "siteDetails.ai": { fr: "IA", en: "" },
  "siteDetails.pages": { fr: "pages", en: "" },
  "siteDetails.dnsNotVerified": { fr: "Vous devez d'abord vérifier votre configuration DNS avant d'activer le site.", en: "" },
  "siteDetails.statusUpdateError": { fr: "Erreur lors de la mise à jour du statut", en: "" },
  "siteDetails.siteActivated": { fr: "Site activé", en: "" },
  "siteDetails.siteDeactivated": { fr: "Site désactivé", en: "" },
  "siteDetails.sessionExpired": { fr: "Session expirée. Veuillez vous reconnecter.", en: "" },
  "siteDetails.dnsVerified": { fr: "DNS vérifié avec succès !", en: "" },
  "siteDetails.dnsNotConfigured": { fr: "Le DNS n'est pas encore configuré", en: "" },
  "siteDetails.dnsVerifyError": { fr: "Erreur lors de la vérification DNS. Réessayez.", en: "" },
  "siteDetails.refreshError": { fr: "Erreur lors du rafraîchissement", en: "" },
  "siteDetails.dataRefreshed": { fr: "Données rafraîchies !", en: "" },
  "siteDetails.stepTest": { fr: "Tester le prerendering", en: "" },
  "siteDetails.stepTestDesc": { fr: "Vérifiez que votre site fonctionne correctement avec notre service de prerendering avant de continuer.", en: "" },
  "siteDetails.stepDns": { fr: "Configurer le DNS", en: "" },
  "siteDetails.stepIntegration": { fr: "Intégrer sur votre serveur", en: "" },

  "analytics.title": { fr: "Analytics", en: "" },
  "analytics.subtitle": { fr: "Statistiques détaillées de crawl par bot et période", en: "" },
  "analytics.allSites": { fr: "Tous les sites", en: "" },
  "analytics.days7": { fr: "7 derniers jours", en: "" },
  "analytics.days14": { fr: "14 derniers jours", en: "" },
  "analytics.days30": { fr: "30 derniers jours", en: "" },
  "analytics.days90": { fr: "90 derniers jours", en: "" },
  "analytics.totalCrawls": { fr: "Total crawls", en: "" },
  "analytics.engineCrawls": { fr: "Crawls moteurs", en: "" },
  "analytics.aiCrawls": { fr: "Crawls IA", en: "" },
  "analytics.uniqueBots": { fr: "Bots uniques", en: "" },
  "analytics.timeline": { fr: "Chronologie", en: "" },
  "analytics.byBot": { fr: "Par Bot", en: "" },
  "analytics.details": { fr: "Détails", en: "" },
  "analytics.crawlsByDay": { fr: "Crawls par jour", en: "" },
  "analytics.crawlsByDayDesc": { fr: "Évolution des crawls Google vs IA sur la période sélectionnée", en: "" },
  "analytics.noDataPeriod": { fr: "Aucune donnée pour cette période", en: "" },
  "analytics.searchEngines": { fr: "Moteurs de recherche", en: "" },
  "analytics.aiBots": { fr: "Bots IA", en: "" },
  "analytics.botDistribution": { fr: "Répartition par bot", en: "" },
  "analytics.pagesCrawledByBot": { fr: "Pages crawlées par chaque bot", en: "" },
  "analytics.topBots": { fr: "Top bots", en: "" },
  "analytics.rankingByCrawls": { fr: "Classement par nombre de crawls", en: "" },
  "analytics.pagesCrawled": { fr: "Pages crawlées", en: "" },
  "analytics.recentActivity": { fr: "Activité récente", en: "" },
  "analytics.last20crawls": { fr: "Les 20 derniers crawls détectés", en: "" },
  "analytics.noRecentActivity": { fr: "Aucune activité récente", en: "" },
  "analytics.bot": { fr: "Bot", en: "" },
  "analytics.type": { fr: "Type", en: "" },
  "analytics.pages": { fr: "Pages", en: "" },
  "analytics.date": { fr: "Date", en: "" },
  "analytics.engine": { fr: "Moteur", en: "" },
  "analytics.ai": { fr: "IA", en: "" },
  "analytics.loadError": { fr: "Erreur lors du chargement des données", en: "" },

  // Settings Page
  "settings.title": { fr: "Paramètres", en: "" },
  "settings.subtitle": { fr: "Gérez votre profil et vos préférences", en: "" },
  "settings.profile": { fr: "Profil", en: "" },
  "settings.avatarSync": { fr: "Avatar synchronisé avec Google", en: "" },
  "settings.fullName": { fr: "Nom complet", en: "" },
  "settings.fullNamePlaceholder": { fr: "Votre nom", en: "" },
  "settings.email": { fr: "Email", en: "" },
  "settings.emailNotEditable": { fr: "L'email ne peut pas être modifié", en: "" },
  "settings.save": { fr: "Sauvegarder", en: "" },
  "settings.saveError": { fr: "Erreur lors de la sauvegarde", en: "" },
  "settings.profileUpdated": { fr: "Profil mis à jour", en: "" },
  "settings.notifications": { fr: "Notifications", en: "" },
  "settings.emailNotifications": { fr: "Notifications par email", en: "" },
  "settings.emailNotificationsDesc": { fr: "Recevez des notifications importantes par email", en: "" },
  "settings.weeklyReport": { fr: "Rapport hebdomadaire", en: "" },
  "settings.weeklyReportDesc": { fr: "Recevez un résumé de vos statistiques chaque semaine", en: "" },
  "settings.crawlAlerts": { fr: "Alertes de crawl", en: "" },
  "settings.crawlAlertsDesc": { fr: "Soyez alerté lors d'une activité inhabituelle", en: "" },
  "settings.security": { fr: "Sécurité", en: "" },
  "settings.googleConnected": { fr: "Connexion Google", en: "" },
  "settings.linkedToGoogle": { fr: "Votre compte est lié à Google", en: "" },
  "settings.connected": { fr: "Connecté", en: "" },
  "settings.dangerZone": { fr: "Zone dangereuse", en: "" },
  "settings.deleteAccountWarning": { fr: "La suppression de votre compte est irréversible. Toutes vos données seront perdues.", en: "" },
  "settings.deleteAccount": { fr: "Supprimer mon compte", en: "" },

  // DNS Status Badge
  "dns.verified": { fr: "DNS vérifié", en: "" },
  "dns.pendingVerification": { fr: "En attente de vérification DNS", en: "" },
  "dns.error": { fr: "Erreur DNS", en: "" },
  "dns.configRequired": { fr: "Configuration DNS requise", en: "" },
  "dns.txtInstructions": { fr: "Configurez votre DNS avec l'enregistrement TXT suivant (le nom/host doit être", en: "" },
  "dns.someRegistrars": { fr: "— certains registrars demandent", en: "" },
  "dns.type": { fr: "Type :", en: "" },
  "dns.name": { fr: "Nom / Host :", en: "" },
  "dns.value": { fr: "Valeur :", en: "" },
  "dns.verifying": { fr: "Vérification...", en: "" },
  "dns.verify": { fr: "Vérifier DNS", en: "" },
  "dns.cnameInstructions": { fr: "Configurez votre DNS avec l'enregistrement CNAME suivant :", en: "" },

  // Auth Page
  "auth.title": { fr: "Connexion", en: "" },
  "auth.subtitle": { fr: "Connectez-vous pour accéder à votre dashboard", en: "" },
  "auth.googleButton": { fr: "Continuer avec Google", en: "" },
  "auth.terms": { fr: "En vous connectant, vous acceptez nos", en: "" },
  "auth.termsLink": { fr: "conditions d'utilisation", en: "" },
  "auth.and": { fr: "et notre", en: "" },
  "auth.privacyLink": { fr: "politique de confidentialité", en: "" },

  // Upgrade Page
  "upgrade.title": { fr: "Changer de plan", en: "" },
  "upgrade.subtitle": { fr: "Choisissez le plan qui correspond à vos besoins", en: "" },
  "upgrade.currentPlan": { fr: "Plan actuel", en: "" },
  "upgrade.recommended": { fr: "Recommandé", en: "" },
  "upgrade.perMonth": { fr: "/mois", en: "" },
  "upgrade.selectPlan": { fr: "Sélectionner", en: "" },
  "upgrade.currentPlanBadge": { fr: "Actuel", en: "" },
  "upgrade.processing": { fr: "Traitement...", en: "" },

  // How It Works Page
  "howItWorks.title": { fr: "Comment ça marche", en: "" },
  "howItWorks.subtitle": { fr: "Découvrez comment SEO Lovable rend vos sites visibles", en: "" },
  "howItWorks.step1Title": { fr: "Le problème des SPA", en: "" },
  "howItWorks.step1Desc": { fr: "Les applications Single Page (SPA) comme celles créées avec Lovable chargent leur contenu via JavaScript. Les bots de recherche (Google, Bing) et les crawlers IA (ChatGPT, Claude) ne peuvent pas voir ce contenu.", en: "" },
  "howItWorks.step2Title": { fr: "Notre solution", en: "" },
  "howItWorks.step2Desc": { fr: "SEO Lovable intercepte les requêtes des bots et leur sert une version pré-rendue de vos pages. Le contenu est généré à la volée et mis en cache pour des performances optimales.", en: "" },
  "howItWorks.step3Title": { fr: "Configuration simple", en: "" },
  "howItWorks.step3Desc": { fr: "Ajoutez simplement un enregistrement DNS et notre système s'occupe du reste. Aucune modification de code requise, votre site reste exactement comme il est.", en: "" },
  "howItWorks.cta": { fr: "Commencer maintenant", en: "" },

  // Legal Pages
  "legal.cgv.title": { fr: "Conditions Générales de Vente", en: "" },
  "legal.privacy.title": { fr: "Politique de Confidentialité", en: "" },
  "legal.mentions.title": { fr: "Mentions Légales", en: "" },
  "legal.backHome": { fr: "Retour à l'accueil", en: "" },

  // Not Found Page
  "notFound.title": { fr: "Page non trouvée", en: "" },
  "notFound.description": { fr: "La page que vous recherchez n'existe pas ou a été déplacée.", en: "" },
  "notFound.backHome": { fr: "Retour à l'accueil", en: "" },
  "notFound.backDashboard": { fr: "Retour au dashboard", en: "" },

  // Simulate Crawl Modal
  "simulateCrawl.title": { fr: "Simuler un crawl", en: "" },
  "simulateCrawl.description": { fr: "Simulez un crawl de bot sur votre site pour tester le prerendering.", en: "" },
  "simulateCrawl.selectBot": { fr: "Sélectionnez un bot", en: "" },
  "simulateCrawl.url": { fr: "URL à crawler", en: "" },
  "simulateCrawl.simulate": { fr: "Simuler", en: "" },
  "simulateCrawl.simulating": { fr: "Simulation...", en: "" },
  "simulateCrawl.success": { fr: "Crawl simulé avec succès !", en: "" },
  "simulateCrawl.error": { fr: "Erreur lors de la simulation", en: "" },

  // Clients Admin
  "admin.clients.title": { fr: "Clients", en: "" },
  "admin.clients.subtitle": { fr: "Gestion des clients et de leurs domaines", en: "" },
  "admin.clients.search": { fr: "Rechercher un client...", en: "" },
  "admin.clients.addClient": { fr: "Ajouter un client", en: "" },
  "admin.clients.noClients": { fr: "Aucun client trouvé", en: "" },
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
    // Fallback to static French only (EN should come from DB via LibreTranslate)
    const staticValue = staticTranslations[key]?.fr;
    if (staticValue && lang === "fr") return staticValue;
    // For EN, if not in DB, show the French version or key
    if (lang === "en" && staticValue) return staticValue; // Fallback to FR if EN not in DB
    return key;
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
