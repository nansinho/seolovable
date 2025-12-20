import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Particles from "@/components/Particles";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useI18n } from "@/lib/i18n";

const MentionsLegales = () => {
  const { lang } = useI18n();

  const content = {
    fr: {
      eyebrow: "// Informations légales",
      title: "Mentions",
      titleAccent: "Légales",
      subtitle: "Informations relatives à l'éditeur et à l'hébergement du site",
      sections: [
        {
          title: "Éditeur du site",
          content: `Le site SEO Lovable est édité par :

**Agence HDS**
SIRET : 810 696 096 00041
Représentée par Mr HARUA NANS

Email : contact@harua-ds.com`
        },
        {
          title: "Directeur de la publication",
          content: `Le directeur de la publication est Mr HARUA NANS.`
        },
        {
          title: "Hébergement",
          content: `Le site est hébergé par :

**Hostinger International Ltd**
61 Lordou Vironos Street
6023 Larnaca, Chypre
https://www.hostinger.fr`
        },
        {
          title: "Propriété intellectuelle",
          content: `L'ensemble du contenu du site SEO Lovable (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive de l'Agence HDS, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.

Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de l'Agence HDS.`
        },
        {
          title: "Données personnelles",
          content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.

Pour exercer ces droits ou pour toute question relative à vos données personnelles, vous pouvez nous contacter à : contact@harua-ds.com

Pour plus d'informations, consultez notre [Politique de Confidentialité](/confidentialite).`
        },
        {
          title: "Cookies",
          content: `Le site SEO Lovable peut utiliser des cookies pour améliorer l'expérience utilisateur et analyser le trafic. Vous pouvez configurer votre navigateur pour refuser les cookies.`
        },
        {
          title: "Contact",
          content: `Pour toute question concernant le site, vous pouvez nous contacter à :

Email : contact@harua-ds.com`
        }
      ]
    },
    en: {
      eyebrow: "// Legal information",
      title: "Legal",
      titleAccent: "Notice",
      subtitle: "Information about the site publisher and hosting",
      sections: [
        {
          title: "Site Publisher",
          content: `The SEO Lovable website is published by:

**Agence HDS**
SIRET: 810 696 096 00041
Represented by Mr HARUA NANS

Email: contact@harua-ds.com`
        },
        {
          title: "Publication Director",
          content: `The publication director is Mr HARUA NANS.`
        },
        {
          title: "Hosting",
          content: `The site is hosted by:

**Hostinger International Ltd**
61 Lordou Vironos Street
6023 Larnaca, Cyprus
https://www.hostinger.fr`
        },
        {
          title: "Intellectual Property",
          content: `All content on the SEO Lovable website (texts, images, graphics, logo, icons, sounds, software, etc.) is the exclusive property of Agence HDS, except for trademarks, logos or content belonging to other partner companies or authors.

Any reproduction, distribution, modification, adaptation, retransmission or publication, even partial, of these elements is strictly prohibited without the express written consent of Agence HDS.`
        },
        {
          title: "Personal Data",
          content: `In accordance with the General Data Protection Regulation (GDPR), you have the right to access, rectify, delete and port your personal data.

To exercise these rights or for any questions regarding your personal data, you can contact us at: contact@harua-ds.com

For more information, please see our [Privacy Policy](/confidentialite).`
        },
        {
          title: "Cookies",
          content: `The SEO Lovable website may use cookies to improve user experience and analyze traffic. You can configure your browser to refuse cookies.`
        },
        {
          title: "Contact",
          content: `For any questions about the site, you can contact us at:

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
                <div className="mt-8 w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto animate-fade-up" style={{ animationDelay: "300ms" }} />
              </div>
            </AnimatedSection>
          </section>

          {/* Content */}
          <section className="max-w-4xl mx-auto">
            {t.sections.map((section, index) => (
              <AnimatedSection key={index}>
                <div className="mb-12 p-8 rounded-lg border border-border/50 bg-card/30">
                  <h2 className="text-2xl font-medium text-foreground mb-4">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line prose prose-invert prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
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

export default MentionsLegales;
