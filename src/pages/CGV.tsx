import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useI18n } from "@/lib/i18n";

const CGV = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      eyebrow: "// Conditions contractuelles",
      title: "Conditions Générales",
      titleAccent: "de Vente",
      subtitle: "Les conditions qui régissent l'utilisation de nos services",
      lastUpdate: "Dernière mise à jour : Décembre 2024",
      sections: [
        {
          title: "Article 1 - Objet",
          content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre :

**Le Prestataire :**
Agence HDS
SIRET : 810 696 096 00041
Email : contact@harua-ds.com

**Et le Client :**
Toute personne physique ou morale souscrivant à un abonnement au service SEO Lovable.

Le service SEO Lovable est un service de prerendering permettant d'optimiser le référencement des sites web construits avec Lovable en les rendant accessibles aux robots d'indexation (Google, Bing, ChatGPT, Claude, etc.).`
        },
        {
          title: "Article 2 - Services proposés",
          content: `SEO Lovable propose les services suivants :

• **Prerendering à la demande** : génération de versions HTML statiques des pages pour les robots d'indexation
• **Gestion multi-sites** : possibilité de gérer plusieurs sites depuis un même compte
• **Statistiques des bots** : suivi des visites des robots d'indexation
• **Cache intelligent** : mise en cache optimisée des pages rendues
• **Support technique** : assistance par email ou prioritaire selon l'offre

Les fonctionnalités disponibles dépendent de l'offre souscrite (Starter, Pro, Business).`
        },
        {
          title: "Article 3 - Inscription et compte",
          content: `Pour utiliser nos services, le Client doit :

• Créer un compte en fournissant des informations exactes et complètes
• Être majeur ou avoir l'autorisation d'un représentant légal
• Accepter les présentes CGV et la Politique de Confidentialité

Le Client est responsable de la confidentialité de ses identifiants de connexion et de toutes les actions effectuées depuis son compte.`
        },
        {
          title: "Article 4 - Tarifs et paiement",
          content: `**Tarifs :**
Les tarifs en vigueur sont affichés sur la page Tarifs du site. Ils sont exprimés en euros TTC.

**Modalités de paiement :**
• Paiement par carte bancaire (Visa, Mastercard)
• Facturation mensuelle ou annuelle selon l'option choisie
• Prélèvement automatique à chaque échéance

**Essai gratuit :**
Un essai gratuit de 14 jours est proposé pour découvrir le service sans engagement. Aucune carte bancaire n'est requise pour l'essai.`
        },
        {
          title: "Article 5 - Durée et renouvellement",
          content: `**Durée :**
L'abonnement est souscrit pour une durée d'un mois ou d'un an selon l'option choisie.

**Renouvellement :**
L'abonnement est renouvelé automatiquement à chaque échéance, sauf résiliation par le Client.

**Modification de l'offre :**
Le Client peut à tout moment modifier son offre (upgrade ou downgrade). La modification prend effet au prochain cycle de facturation.`
        },
        {
          title: "Article 6 - Droit de rétractation",
          content: `Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services pleinement exécutés avant la fin du délai de rétractation.

Cependant, nous offrons une **garantie satisfait ou remboursé de 30 jours** : si vous n'êtes pas satisfait de nos services, vous pouvez demander un remboursement intégral dans les 30 jours suivant votre première souscription.`
        },
        {
          title: "Article 7 - Résiliation",
          content: `**Par le Client :**
Le Client peut résilier son abonnement à tout moment depuis son espace client. La résiliation prend effet à la fin de la période en cours.

**Par le Prestataire :**
Le Prestataire peut résilier l'abonnement en cas de :
• Non-paiement après relance
• Violation des présentes CGV
• Utilisation frauduleuse ou abusive du service

En cas de résiliation pour faute du Client, aucun remboursement ne sera effectué.`
        },
        {
          title: "Article 8 - Obligations du Client",
          content: `Le Client s'engage à :

• Utiliser le service conformément à sa destination
• Ne pas utiliser le service pour des contenus illicites
• Fournir des informations exactes et à jour
• Respecter les droits de propriété intellectuelle
• Ne pas tenter de contourner les limitations de son offre
• Ne pas revendre ou partager l'accès à son compte`
        },
        {
          title: "Article 9 - Responsabilité",
          content: `**Responsabilité du Prestataire :**
Le Prestataire s'engage à fournir le service avec diligence. Cependant, sa responsabilité ne saurait être engagée en cas de :
• Force majeure
• Dysfonctionnement du réseau Internet
• Problèmes liés à l'hébergement du site du Client
• Utilisation non conforme du service

La responsabilité du Prestataire est limitée au montant des sommes effectivement payées par le Client au cours des 12 derniers mois.

**Responsabilité du Client :**
Le Client est seul responsable du contenu de ses sites web et de leur conformité aux lois en vigueur.`
        },
        {
          title: "Article 10 - Disponibilité du service",
          content: `Le Prestataire s'efforce d'assurer une disponibilité optimale du service. Les offres Business bénéficient d'un SLA (Service Level Agreement) de 99.9% de disponibilité.

Des interruptions peuvent survenir pour maintenance. Le Client sera informé dans la mesure du possible.`
        },
        {
          title: "Article 11 - Propriété intellectuelle",
          content: `**Propriété du Prestataire :**
Le service SEO Lovable, son interface, son code source et sa documentation sont la propriété exclusive de l'Agence HDS.

**Propriété du Client :**
Le Client conserve tous les droits sur le contenu de ses sites web. L'utilisation du service n'entraîne aucun transfert de propriété intellectuelle.`
        },
        {
          title: "Article 12 - Protection des données",
          content: `Le Prestataire s'engage à protéger les données personnelles du Client conformément au RGPD et à sa Politique de Confidentialité.

Pour plus d'informations, consultez notre [Politique de Confidentialité](/confidentialite).`
        },
        {
          title: "Article 13 - Modification des CGV",
          content: `Le Prestataire se réserve le droit de modifier les présentes CGV. Les modifications seront notifiées au Client par email au moins 30 jours avant leur entrée en vigueur.

En cas de désaccord, le Client pourra résilier son abonnement sans frais.`
        },
        {
          title: "Article 14 - Loi applicable et juridiction",
          content: `Les présentes CGV sont soumises au droit français.

En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.`
        },
        {
          title: "Article 15 - Contact",
          content: `Pour toute question relative aux présentes CGV :

Email : contact@harua-ds.com`
        }
      ]
    },
    en: {
      eyebrow: "// Contractual terms",
      title: "Terms &",
      titleAccent: "Conditions",
      subtitle: "The terms governing the use of our services",
      lastUpdate: "Last updated: December 2024",
      sections: [
        {
          title: "Article 1 - Purpose",
          content: `These Terms and Conditions govern the contractual relationship between:

**The Provider:**
Agence HDS
SIRET: 810 696 096 00041
Email: contact@harua-ds.com

**And the Client:**
Any individual or legal entity subscribing to the SEO Lovable service.

SEO Lovable is a prerendering service designed to optimize the SEO of websites built with Lovable by making them accessible to indexing robots (Google, Bing, ChatGPT, Claude, etc.).`
        },
        {
          title: "Article 2 - Services Offered",
          content: `SEO Lovable offers the following services:

• **On-demand prerendering**: generation of static HTML versions of pages for indexing robots
• **Multi-site management**: ability to manage multiple sites from a single account
• **Bot statistics**: tracking of indexing robot visits
• **Smart cache**: optimized caching of rendered pages
• **Technical support**: email or priority assistance depending on the offer

Available features depend on the subscribed plan (Starter, Pro, Business).`
        },
        {
          title: "Article 3 - Registration and Account",
          content: `To use our services, the Client must:

• Create an account by providing accurate and complete information
• Be of legal age or have authorization from a legal representative
• Accept these Terms and the Privacy Policy

The Client is responsible for the confidentiality of their login credentials and all actions taken from their account.`
        },
        {
          title: "Article 4 - Pricing and Payment",
          content: `**Pricing:**
Current prices are displayed on the Pricing page of the website. They are expressed in euros including VAT.

**Payment methods:**
• Payment by credit card (Visa, Mastercard)
• Monthly or annual billing according to the chosen option
• Automatic debit at each due date

**Free trial:**
A 14-day free trial is offered to discover the service without commitment. No credit card is required for the trial.`
        },
        {
          title: "Article 5 - Duration and Renewal",
          content: `**Duration:**
The subscription is taken out for a period of one month or one year depending on the option chosen.

**Renewal:**
The subscription is automatically renewed at each due date, unless cancelled by the Client.

**Plan modification:**
The Client can modify their plan at any time (upgrade or downgrade). The modification takes effect at the next billing cycle.`
        },
        {
          title: "Article 6 - Right of Withdrawal",
          content: `In accordance with Article L221-28 of the French Consumer Code, the right of withdrawal does not apply to services fully performed before the end of the withdrawal period.

However, we offer a **30-day money-back guarantee**: if you are not satisfied with our services, you can request a full refund within 30 days of your first subscription.`
        },
        {
          title: "Article 7 - Termination",
          content: `**By the Client:**
The Client may terminate their subscription at any time from their client area. Termination takes effect at the end of the current period.

**By the Provider:**
The Provider may terminate the subscription in case of:
• Non-payment after reminder
• Violation of these Terms
• Fraudulent or abusive use of the service

In case of termination due to Client's fault, no refund will be made.`
        },
        {
          title: "Article 8 - Client Obligations",
          content: `The Client agrees to:

• Use the service in accordance with its intended purpose
• Not use the service for unlawful content
• Provide accurate and up-to-date information
• Respect intellectual property rights
• Not attempt to circumvent the limitations of their plan
• Not resell or share access to their account`
        },
        {
          title: "Article 9 - Liability",
          content: `**Provider's liability:**
The Provider commits to providing the service with diligence. However, its liability cannot be engaged in case of:
• Force majeure
• Internet network malfunction
• Problems related to the hosting of the Client's website
• Non-compliant use of the service

The Provider's liability is limited to the amount actually paid by the Client during the last 12 months.

**Client's liability:**
The Client is solely responsible for the content of their websites and their compliance with applicable laws.`
        },
        {
          title: "Article 10 - Service Availability",
          content: `The Provider strives to ensure optimal service availability. Business plans benefit from an SLA (Service Level Agreement) of 99.9% availability.

Interruptions may occur for maintenance. The Client will be informed whenever possible.`
        },
        {
          title: "Article 11 - Intellectual Property",
          content: `**Provider's property:**
The SEO Lovable service, its interface, source code and documentation are the exclusive property of Agence HDS.

**Client's property:**
The Client retains all rights to the content of their websites. Use of the service does not result in any transfer of intellectual property.`
        },
        {
          title: "Article 12 - Data Protection",
          content: `The Provider commits to protecting the Client's personal data in accordance with GDPR and its Privacy Policy.

For more information, please see our [Privacy Policy](/confidentialite).`
        },
        {
          title: "Article 13 - Modification of Terms",
          content: `The Provider reserves the right to modify these Terms. Modifications will be notified to the Client by email at least 30 days before their entry into force.

In case of disagreement, the Client may terminate their subscription without charge.`
        },
        {
          title: "Article 14 - Applicable Law and Jurisdiction",
          content: `These Terms are subject to French law.

In case of dispute, the parties will endeavor to find an amicable solution. Failing that, French courts shall have sole jurisdiction.`
        },
        {
          title: "Article 15 - Contact",
          content: `For any questions regarding these Terms:

Email: contact@harua-ds.com`
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <section className="relative overflow-hidden pb-20">
            <Particles count={30} />
            <AnimatedSection>
              <div className="text-center relative z-10">
                <p className="text-sm text-accent tracking-widest mb-6 font-mono uppercase animate-fade-up">
                  {t.eyebrow}
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
                  <span className="text-foreground">{t.title}</span>{" "}
                  <span className="font-mono text-accent animate-pulse-subtle">{t.titleAccent}</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
                  {t.subtitle}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-4 animate-fade-up" style={{ animationDelay: "250ms" }}>
                  {t.lastUpdate}
                </p>
                <div className="mt-8 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto animate-fade-up" style={{ animationDelay: "300ms" }} />
              </div>
            </AnimatedSection>
          </section>

          {/* Content */}
          <section className="max-w-4xl mx-auto">
            {t.sections.map((section, index) => (
              <AnimatedSection key={index}>
                <div className="mb-8 p-8 rounded-lg border border-border/50 bg-card/30">
                  <h2 className="text-xl font-medium text-foreground mb-4">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content.split(/(\[.*?\]\(.*?\))/).map((part, i) => {
                      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                      if (linkMatch) {
                        return (
                          <a key={i} href={linkMatch[2]} className="text-accent hover:underline">
                            {linkMatch[1]}
                          </a>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGV;
