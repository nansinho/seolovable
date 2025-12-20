import { useI18n, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();

  const languages: { code: Language; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <div className="flex items-center gap-1">
      {languages.map((l, i) => (
        <>
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              "text-sm transition-colors",
              lang === l.code
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l.label}
          </button>
          {i === 0 && <span className="text-muted-foreground/50">/</span>}
        </>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
