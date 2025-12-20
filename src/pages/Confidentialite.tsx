import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useI18n } from "@/lib/i18n";

const Confidentialite = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      eyebrow: "// Protection des données",
      title: "Politique de",
      titleAccent: "Confidentialité",
      subtitle: "Comment nous collectons, utilisons et protégeons vos données personnelles",
      lastUpdate: "Dernière mise à jour : Décembre 2024",
      sections: [
        {
          title: "1. Responsable du traitement",
          content: `Le responsable du traitement des données personnelles collectées sur le site SEO Lovable est :

**Agence HDS**
SIRET : 810 696 096 00041
Représentée par Mr HARUA NANS
Email : contact@harua-ds.com`
        },
        {
          title: "2. Données collectées",
          content: `Nous collectons les données suivantes :

**Données d'identification :**
• Nom et prénom
• Adresse email
• Nom de l'entreprise (optionnel)

**Données de navigation :**
• Adresse IP
• Type de navigateur
• Pages visitées
• Date et heure de connexion

**Données techniques :**
• URLs des sites soumis au service
• Statistiques de prerendering`
        },
        {
          title: "3. Finalités du traitement",
          content: `Vos données sont collectées pour les finalités suivantes :

• Fournir et améliorer nos services de prerendering
• Gérer votre compte utilisateur
• Traiter vos paiements
• Vous envoyer des communications relatives à votre compte
• Analyser l'utilisation de nos services pour les améliorer
• Répondre à vos demandes de support
• Respecter nos obligations légales`
        },
        {
          title: "4. Base légale du traitement",
          content: `Le traitement de vos données repose sur :

• **L'exécution du contrat** : pour fournir nos services
• **Votre consentement** : pour les communications marketing
• **Notre intérêt légitime** : pour améliorer nos services et prévenir la fraude
• **Nos obligations légales** : pour la facturation et la comptabilité`
        },
        {
          title: "5. Durée de conservation",
          content: `Vos données sont conservées pendant :

• **Données de compte** : pendant toute la durée de votre abonnement, puis 3 ans après la fin de la relation commerciale
• **Données de facturation** : 10 ans (obligation légale)
• **Données de navigation** : 13 mois maximum
• **Cookies** : selon leur nature (voir section cookies)`
        },
        {
          title: "6. Destinataires des données",
          content: `Vos données peuvent être partagées avec :

• Nos sous-traitants techniques (hébergement, paiement)
• Les autorités compétentes en cas d'obligation légale

Nous ne vendons jamais vos données personnelles à des tiers.`
        },
        {
          title: "7. Transferts internationaux",
          content: `Vos données peuvent être transférées vers des pays situés en dehors de l'Union Européenne (notamment pour l'hébergement). Ces transferts sont encadrés par les clauses contractuelles types de la Commission Européenne ou d'autres mécanismes conformes au RGPD.`
        },
        {
          title: "8. Vos droits",
          content: `Conformément au RGPD, vous disposez des droits suivants :

• **Droit d'accès** : obtenir une copie de vos données
• **Droit de rectification** : corriger vos données inexactes
• **Droit à l'effacement** : demander la suppression de vos données
• **Droit à la limitation** : limiter le traitement de vos données
• **Droit à la portabilité** : recevoir vos données dans un format structuré
• **Droit d'opposition** : vous opposer au traitement de vos données
• **Droit de retirer votre consentement** : à tout moment

Pour exercer ces droits, contactez-nous à : contact@harua-ds.com

Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`
        },
        {
          title: "9. Cookies et traceurs",
          content: `Notre site utilise des cookies pour :

**Cookies essentiels :**
• Authentification et sécurité
• Préférences de langue

**Cookies analytiques :**
• Mesure d'audience et statistiques

**Cookies marketing (avec consentement) :**
• Personnalisation des publicités

Vous pouvez gérer vos préférences cookies via les paramètres de votre navigateur.`
        },
        {
          title: "10. Sécurité des données",
          content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction :

• Chiffrement SSL/TLS
• Accès restreint aux données
• Surveillance et journalisation des accès
• Sauvegardes régulières`
        },
        {
          title: "11. Modifications",
          content: `Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entrent en vigueur dès leur publication sur le site. Nous vous informerons des changements importants par email.`
        },
        {
          title: "12. Contact",
          content: `Pour toute question relative à cette politique ou à vos données personnelles :

Email : contact@harua-ds.com`
        }
      ]
    },
    en: {
      eyebrow: "// Data protection",
      title: "Privacy",
      titleAccent: "Policy",
      subtitle: "How we collect, use and protect your personal data",
      lastUpdate: "Last updated: December 2024",
      sections: [
        {
          title: "1. Data Controller",
          content: `The data controller for personal data collected on the SEO Lovable website is:

**Agence HDS**
SIRET: 810 696 096 00041
Represented by Mr HARUA NANS
Email: contact@harua-ds.com`
        },
        {
          title: "2. Data Collected",
          content: `We collect the following data:

**Identification data:**
• First and last name
• Email address
• Company name (optional)

**Navigation data:**
• IP address
• Browser type
• Pages visited
• Date and time of connection

**Technical data:**
• URLs of sites submitted to the service
• Prerendering statistics`
        },
        {
          title: "3. Purposes of Processing",
          content: `Your data is collected for the following purposes:

• Providing and improving our prerendering services
• Managing your user account
• Processing your payments
• Sending you communications regarding your account
• Analyzing the use of our services to improve them
• Responding to your support requests
• Complying with our legal obligations`
        },
        {
          title: "4. Legal Basis for Processing",
          content: `The processing of your data is based on:

• **Contract performance**: to provide our services
• **Your consent**: for marketing communications
• **Our legitimate interest**: to improve our services and prevent fraud
• **Our legal obligations**: for billing and accounting`
        },
        {
          title: "5. Data Retention Period",
          content: `Your data is retained for:

• **Account data**: for the duration of your subscription, then 3 years after the end of the business relationship
• **Billing data**: 10 years (legal obligation)
• **Navigation data**: maximum 13 months
• **Cookies**: depending on their nature (see cookies section)`
        },
        {
          title: "6. Data Recipients",
          content: `Your data may be shared with:

• Our technical subcontractors (hosting, payment)
• Competent authorities in case of legal obligation

We never sell your personal data to third parties.`
        },
        {
          title: "7. International Transfers",
          content: `Your data may be transferred to countries outside the European Union (notably for hosting). These transfers are governed by the European Commission's standard contractual clauses or other GDPR-compliant mechanisms.`
        },
        {
          title: "8. Your Rights",
          content: `Under the GDPR, you have the following rights:

• **Right of access**: obtain a copy of your data
• **Right of rectification**: correct inaccurate data
• **Right to erasure**: request deletion of your data
• **Right to restriction**: limit the processing of your data
• **Right to data portability**: receive your data in a structured format
• **Right to object**: object to the processing of your data
• **Right to withdraw consent**: at any time

To exercise these rights, contact us at: contact@harua-ds.com

You may also file a complaint with your local data protection authority.`
        },
        {
          title: "9. Cookies and Trackers",
          content: `Our website uses cookies for:

**Essential cookies:**
• Authentication and security
• Language preferences

**Analytical cookies:**
• Audience measurement and statistics

**Marketing cookies (with consent):**
• Ad personalization

You can manage your cookie preferences through your browser settings.`
        },
        {
          title: "10. Data Security",
          content: `We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, modification, disclosure or destruction:

• SSL/TLS encryption
• Restricted data access
• Access monitoring and logging
• Regular backups`
        },
        {
          title: "11. Modifications",
          content: `We reserve the right to modify this privacy policy at any time. Changes take effect upon publication on the website. We will inform you of significant changes by email.`
        },
        {
          title: "12. Contact",
          content: `For any questions regarding this policy or your personal data:

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
                    {section.content}
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

export default Confidentialite;
