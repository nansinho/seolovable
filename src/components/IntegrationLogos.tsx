import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import boltLogo from "@/assets/logos/bolt.svg";
import lovableLogo from "@/assets/logos/preview.svg";

interface IntegrationLogosProps {
  lang: "fr" | "en";
}

const IntegrationLogos = ({ lang }: IntegrationLogosProps) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const logos = [
    { src: boltLogo, alt: "Bolt.new", name: "bolt.new" },
    { src: lovableLogo, alt: "Lovable", name: "lovable.dev" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [logos.length]);

  const text = {
    fr: "Intégration possible sur",
    en: "Integration available on",
  };

  const suffix = {
    fr: "en 5 minutes",
    en: "in 5 minutes",
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg md:text-xl text-muted-foreground font-mono">
        {text[lang]}{" "}
        <span className="inline-flex items-center gap-2 align-middle">
          <span className="relative h-8 md:h-10 w-32 md:w-40 inline-flex items-center justify-center">
            {logos.map((logo, index) => (
              <img
                key={logo.name}
                src={logo.src}
                alt={logo.alt}
                className={cn(
                  "absolute h-6 md:h-8 w-auto max-w-full object-contain transition-all duration-500",
                  currentLogoIndex === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90"
                )}
              />
            ))}
          </span>
        </span>
        {" "}{suffix[lang]}
      </p>
    </div>
  );
};

export default IntegrationLogos;
