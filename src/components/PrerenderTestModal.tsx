import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, Code, Eye, FileText, CheckCircle, XCircle, Clock, HardDrive, Copy, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";

// Simple HTML formatter with proper indentation
function formatHtml(html: string): string {
  if (!html) return "";

  const INLINE_TAGS = new Set([
    "a", "abbr", "b", "bdo", "br", "button", "cite", "code", "dfn", "em", "i",
    "img", "input", "kbd", "label", "map", "object", "q", "samp", "script",
    "select", "small", "span", "strong", "sub", "sup", "textarea", "tt", "var",
  ]);

  let formatted = "";
  let indent = 0;
  const TAB = "  ";

  // Normalize whitespace
  const normalized = html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

  // Split into tokens (tags and text)
  const tokens = normalized.match(/(<[^>]+>|[^<]+)/g) || [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("</")) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      formatted += TAB.repeat(indent) + trimmed + "\n";
    } else if (trimmed.startsWith("<")) {
      // Opening or self-closing tag
      const tagMatch = trimmed.match(/^<(\w+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
      const isSelfClosing = trimmed.endsWith("/>") || ["meta", "link", "br", "hr", "img", "input", "!doctype"].includes(tagName);
      const isInline = INLINE_TAGS.has(tagName);

      formatted += TAB.repeat(indent) + trimmed + "\n";

      if (!isSelfClosing && !isInline && !trimmed.startsWith("<!")) {
        indent++;
      }
    } else {
      // Text content
      formatted += TAB.repeat(indent) + trimmed + "\n";
    }
  }

  return formatted.trim();
}

// Syntax highlighter for HTML - returns JSX elements with colors
function SyntaxHighlightedHtml({ html }: { html: string }) {
  const lines = html.split("\n");

  const highlightLine = (line: string, lineIndex: number) => {
    const elements: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Match DOCTYPE
      const doctypeMatch = remaining.match(/^(<!DOCTYPE[^>]*>)/i);
      if (doctypeMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">
            {doctypeMatch[1]}
          </span>
        );
        remaining = remaining.slice(doctypeMatch[1].length);
        continue;
      }

      // Match comment
      const commentMatch = remaining.match(/^(<!--[\s\S]*?-->)/);
      if (commentMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground italic">
            {commentMatch[1]}
          </span>
        );
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Match closing tag
      const closingTagMatch = remaining.match(/^(<\/)([\w-]+)(>)/);
      if (closingTagMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&lt;/</span>,
          <span key={`${lineIndex}-${keyIndex++}`} className="text-pink-400">{closingTagMatch[2]}</span>,
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&gt;</span>
        );
        remaining = remaining.slice(closingTagMatch[0].length);
        continue;
      }

      // Match opening tag with attributes
      const openingTagMatch = remaining.match(/^(<)([\w-]+)/);
      if (openingTagMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&lt;</span>,
          <span key={`${lineIndex}-${keyIndex++}`} className="text-pink-400">{openingTagMatch[2]}</span>
        );
        remaining = remaining.slice(openingTagMatch[0].length);

        // Parse attributes until we hit > or />
        while (remaining.length > 0) {
          // Match end of tag
          const endTagMatch = remaining.match(/^(\s*)(\/?>)/);
          if (endTagMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{endTagMatch[1]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">{endTagMatch[2]}</span>
            );
            remaining = remaining.slice(endTagMatch[0].length);
            break;
          }

          // Match attribute with value (double quotes)
          const attrDoubleMatch = remaining.match(/^(\s+)([\w:-]+)(=)("([^"]*)")/);
          if (attrDoubleMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{attrDoubleMatch[1]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-sky-400">{attrDoubleMatch[2]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">=</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-amber-400">{attrDoubleMatch[4]}</span>
            );
            remaining = remaining.slice(attrDoubleMatch[0].length);
            continue;
          }

          // Match attribute with value (single quotes)
          const attrSingleMatch = remaining.match(/^(\s+)([\w:-]+)(=)('([^']*)')/);
          if (attrSingleMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{attrSingleMatch[1]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-sky-400">{attrSingleMatch[2]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">=</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-amber-400">{attrSingleMatch[4]}</span>
            );
            remaining = remaining.slice(attrSingleMatch[0].length);
            continue;
          }

          // Match boolean attribute
          const boolAttrMatch = remaining.match(/^(\s+)([\w:-]+)(?=\s|\/?>)/);
          if (boolAttrMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{boolAttrMatch[1]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-sky-400">{boolAttrMatch[2]}</span>
            );
            remaining = remaining.slice(boolAttrMatch[0].length);
            continue;
          }

          // Fallback: take one character
          elements.push(
            <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{remaining[0]}</span>
          );
          remaining = remaining.slice(1);
        }
        continue;
      }

      // Match text content (everything until next tag)
      const textMatch = remaining.match(/^([^<]+)/);
      if (textMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{textMatch[1]}</span>
        );
        remaining = remaining.slice(textMatch[1].length);
        continue;
      }

      // Fallback
      elements.push(
        <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{remaining[0]}</span>
      );
      remaining = remaining.slice(1);
    }

    return elements;
  };

  return (
    <code className="block">
      {lines.map((line, i) => (
        <div key={i} className="leading-relaxed flex">
          <span className="select-none w-10 pr-3 text-right text-muted-foreground/50 border-r border-border/30 mr-3 shrink-0">
            {i + 1}
          </span>
          <span className="flex-1">{highlightLine(line, i)}</span>
        </div>
      ))}
    </code>
  );
}

// Syntax highlighter with search highlight
function SyntaxHighlightedHtmlWithSearch({ html, searchQuery }: { html: string; searchQuery: string }) {
  const lines = html.split("\n");
  const lowerQuery = searchQuery.toLowerCase();

  const highlightLine = (line: string, lineIndex: number) => {
    const elements: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    // Helper to wrap text with search highlight if needed
    const wrapWithSearchHighlight = (text: string, className: string, key: string) => {
      if (!searchQuery || !text.toLowerCase().includes(lowerQuery)) {
        return <span key={key} className={className}>{text}</span>;
      }

      // Split and highlight matches
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      const lowerText = text.toLowerCase();
      let matchIndex = lowerText.indexOf(lowerQuery, lastIndex);
      let partKey = 0;

      while (matchIndex !== -1) {
        if (matchIndex > lastIndex) {
          parts.push(
            <span key={`${key}-${partKey++}`} className={className}>
              {text.slice(lastIndex, matchIndex)}
            </span>
          );
        }
        parts.push(
          <span key={`${key}-${partKey++}`} className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">
            {text.slice(matchIndex, matchIndex + searchQuery.length)}
          </span>
        );
        lastIndex = matchIndex + searchQuery.length;
        matchIndex = lowerText.indexOf(lowerQuery, lastIndex);
      }

      if (lastIndex < text.length) {
        parts.push(
          <span key={`${key}-${partKey++}`} className={className}>
            {text.slice(lastIndex)}
          </span>
        );
      }

      return <>{parts}</>;
    };

    while (remaining.length > 0) {
      // Match DOCTYPE
      const doctypeMatch = remaining.match(/^(<!DOCTYPE[^>]*>)/i);
      if (doctypeMatch) {
        elements.push(wrapWithSearchHighlight(doctypeMatch[1], "text-muted-foreground", `${lineIndex}-${keyIndex++}`));
        remaining = remaining.slice(doctypeMatch[1].length);
        continue;
      }

      // Match comment
      const commentMatch = remaining.match(/^(<!--[\s\S]*?-->)/);
      if (commentMatch) {
        elements.push(wrapWithSearchHighlight(commentMatch[1], "text-muted-foreground italic", `${lineIndex}-${keyIndex++}`));
        remaining = remaining.slice(commentMatch[1].length);
        continue;
      }

      // Match closing tag
      const closingTagMatch = remaining.match(/^(<\/)([\w-]+)(>)/);
      if (closingTagMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&lt;/</span>,
          wrapWithSearchHighlight(closingTagMatch[2], "text-pink-400", `${lineIndex}-${keyIndex++}`),
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&gt;</span>
        );
        remaining = remaining.slice(closingTagMatch[0].length);
        continue;
      }

      // Match opening tag with attributes
      const openingTagMatch = remaining.match(/^(<)([\w-]+)/);
      if (openingTagMatch) {
        elements.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">&lt;</span>,
          wrapWithSearchHighlight(openingTagMatch[2], "text-pink-400", `${lineIndex}-${keyIndex++}`)
        );
        remaining = remaining.slice(openingTagMatch[0].length);

        // Parse attributes until we hit > or />
        while (remaining.length > 0) {
          // Match end of tag
          const endTagMatch = remaining.match(/^(\s*)(\/?>)/);
          if (endTagMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{endTagMatch[1]}</span>,
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">{endTagMatch[2]}</span>
            );
            remaining = remaining.slice(endTagMatch[0].length);
            break;
          }

          // Match attribute with value (double quotes)
          const attrDoubleMatch = remaining.match(/^(\s+)([\w:-]+)(=)("([^"]*)")/);
          if (attrDoubleMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{attrDoubleMatch[1]}</span>,
              wrapWithSearchHighlight(attrDoubleMatch[2], "text-sky-400", `${lineIndex}-${keyIndex++}`),
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">=</span>,
              wrapWithSearchHighlight(attrDoubleMatch[4], "text-amber-400", `${lineIndex}-${keyIndex++}`)
            );
            remaining = remaining.slice(attrDoubleMatch[0].length);
            continue;
          }

          // Match attribute with value (single quotes)
          const attrSingleMatch = remaining.match(/^(\s+)([\w:-]+)(=)('([^']*)')/);
          if (attrSingleMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{attrSingleMatch[1]}</span>,
              wrapWithSearchHighlight(attrSingleMatch[2], "text-sky-400", `${lineIndex}-${keyIndex++}`),
              <span key={`${lineIndex}-${keyIndex++}`} className="text-muted-foreground">=</span>,
              wrapWithSearchHighlight(attrSingleMatch[4], "text-amber-400", `${lineIndex}-${keyIndex++}`)
            );
            remaining = remaining.slice(attrSingleMatch[0].length);
            continue;
          }

          // Match boolean attribute
          const boolAttrMatch = remaining.match(/^(\s+)([\w:-]+)(?=\s|\/?>)/);
          if (boolAttrMatch) {
            elements.push(
              <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{boolAttrMatch[1]}</span>,
              wrapWithSearchHighlight(boolAttrMatch[2], "text-sky-400", `${lineIndex}-${keyIndex++}`)
            );
            remaining = remaining.slice(boolAttrMatch[0].length);
            continue;
          }

          // Fallback: take one character
          elements.push(
            <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{remaining[0]}</span>
          );
          remaining = remaining.slice(1);
        }
        continue;
      }

      // Match text content (everything until next tag)
      const textMatch = remaining.match(/^([^<]+)/);
      if (textMatch) {
        elements.push(wrapWithSearchHighlight(textMatch[1], "text-foreground", `${lineIndex}-${keyIndex++}`));
        remaining = remaining.slice(textMatch[1].length);
        continue;
      }

      // Fallback
      elements.push(
        <span key={`${lineIndex}-${keyIndex++}`} className="text-foreground">{remaining[0]}</span>
      );
      remaining = remaining.slice(1);
    }

    return elements;
  };

  // Check if line contains the search query
  const lineContainsMatch = (line: string) => {
    if (!searchQuery) return false;
    return line.toLowerCase().includes(lowerQuery);
  };

  // Count matches
  const matchCount = useMemo(() => {
    if (!searchQuery) return 0;
    return lines.filter(line => line.toLowerCase().includes(lowerQuery)).length;
  }, [lines, lowerQuery, searchQuery]);

  return (
    <>
      {searchQuery && (
        <div className="absolute top-2 left-2 z-10 text-xs text-muted-foreground font-code bg-zinc-900/80 px-2 py-1 rounded">
          {matchCount} ligne{matchCount > 1 ? "s" : ""} trouvée{matchCount > 1 ? "s" : ""}
        </div>
      )}
      <code className="block">
        {lines.map((line, i) => (
          <div 
            key={i} 
            className={`leading-relaxed flex ${lineContainsMatch(line) ? "bg-yellow-500/10" : ""}`}
          >
            <span className={`select-none w-10 pr-3 text-right border-r border-border/30 mr-3 shrink-0 ${lineContainsMatch(line) ? "text-yellow-400" : "text-muted-foreground/50"}`}>
              {i + 1}
            </span>
            <span className="flex-1">{highlightLine(line, i)}</span>
          </div>
        ))}
      </code>
    </>
  );
}

interface PrerenderTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUrl?: string;
}

interface PrerenderResult {
  success: boolean;
  html: string;
  status: number;
  renderTime: number;
  title: string;
  description: string;
  size: string;
  error?: string;
}

export const PrerenderTestModal = ({ open, onOpenChange, defaultUrl = "" }: PrerenderTestModalProps) => {
  const { t } = useI18n();

  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrerenderResult | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [htmlSearch, setHtmlSearch] = useState("");

  // Format the HTML for better readability
  const formattedHtml = useMemo(() => {
    if (!result?.html) return result?.error || "";
    return formatHtml(result.html);
  }, [result]);

  const handleCopyHtml = async () => {
    if (!result?.html) return;
    await navigator.clipboard.writeText(result.html);
    setCopiedHtml(true);
    toast.success("HTML copié !");
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleTest = async () => {
    if (!url) {
      toast.error(t("prerenderTest.enterUrl"));
      return;
    }

    let testUrl = url;
    if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
      testUrl = "https://" + testUrl;
    }

    setLoading(true);
    setResult(null);

    const TIMEOUT_MS = 25_000;

    try {
      const invokePromise = supabase.functions.invoke("test-prerender", {
        body: { url: testUrl },
      });

      const { data, error } = await Promise.race([
        invokePromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout après ${Math.round(TIMEOUT_MS / 1000)}s`)), TIMEOUT_MS)
        ),
      ]);

      if (error) throw error;

      setResult(data);

      if (data.success) toast.success(t("prerenderTest.successToast"));
      else toast.error(data.error || t("prerenderTest.failToast"));
    } catch (error) {
      console.error("Prerender test error:", error);
      const message = error instanceof Error ? error.message : t("prerenderTest.unknownError");
      toast.error(message);
      setResult({
        success: false,
        html: "",
        status: 0,
        renderTime: 0,
        title: "",
        description: "",
        size: "0",
        error: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleTest();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-code flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            {t("prerenderTest.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-code"
            />
            <Button onClick={handleTest} disabled={loading} className="font-code glow-green min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("prerenderTest.testing")}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t("prerenderTest.test")}
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border font-code text-sm">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span>
                  {t("prerenderTest.status")} {result.status || t("common.error")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{(result.renderTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span>{result.size} KB</span>
              </div>
            </div>
          )}

          {result && (
            <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html" className="font-code text-xs">
                  <Code className="w-4 h-4 mr-2" />
                  {t("prerenderTest.rawHtml")}
                </TabsTrigger>
                <TabsTrigger value="preview" className="font-code text-xs">
                  <Eye className="w-4 h-4 mr-2" />
                  {t("prerenderTest.preview")}
                </TabsTrigger>
                <TabsTrigger value="metadata" className="font-code text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  {t("prerenderTest.metadata")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="flex-1 min-h-0 mt-4">
                <div className="relative flex flex-col gap-2">
                  {/* Search bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher dans le HTML..."
                        value={htmlSearch}
                        onChange={(e) => setHtmlSearch(e.target.value)}
                        className="pl-9 pr-8 font-code text-xs h-8"
                      />
                      {htmlSearch && (
                        <button
                          onClick={() => setHtmlSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyHtml}
                      className="font-code text-xs h-8"
                    >
                      {copiedHtml ? (
                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      {copiedHtml ? "Copié" : "Copier"}
                    </Button>
                  </div>

                  {/* Code view */}
                  <div className="relative">
                    <ScrollArea className="h-[360px] rounded-lg border border-border bg-zinc-950 p-4">
                      <pre className="font-mono text-xs whitespace-pre">
                        {formattedHtml ? (
                          <SyntaxHighlightedHtmlWithSearch html={formattedHtml} searchQuery={htmlSearch} />
                        ) : (
                          <span className="text-muted-foreground">{t("prerenderTest.noContent")}</span>
                        )}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
                <div className="h-[400px] rounded-lg border border-border bg-background overflow-hidden">
                  {result.html ? (
                    <iframe
                      srcDoc={result.html}
                      className="w-full h-full bg-white"
                      sandbox="allow-same-origin"
                      title={t("prerenderTest.iframeTitle")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-code">
                      {t("prerenderTest.noPreview")}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="flex-1 min-h-0 mt-4">
                <div className="space-y-4 p-4 rounded-lg border border-border bg-background">
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">Title</label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.title || t("prerenderTest.notDefined")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-code block mb-1">Meta Description</label>
                    <p className="font-code text-sm text-foreground bg-muted/50 p-2 rounded">
                      {result.description || t("prerenderTest.notDefinedF")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">HTTP</label>
                      <p className="font-code text-lg font-bold text-primary">{result.status || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        {t("prerenderTest.renderTime")}
                      </label>
                      <p className="font-code text-lg font-bold text-primary">
                        {(result.renderTime / 1000).toFixed(2)}s
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-code block mb-1">
                        {t("prerenderTest.size")}
                      </label>
                      <p className="font-code text-lg font-bold text-primary">{result.size} KB</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!result && !loading && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-code text-sm">
              {t("prerenderTest.enterUrlHint")}
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground font-code text-sm">{t("prerenderTest.rendering")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
