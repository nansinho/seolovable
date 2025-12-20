import { useI18n, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();

  const languages: { code: Language; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            "px-2 py-1 text-xs font-mono rounded transition-all",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
