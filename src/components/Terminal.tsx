import { cn } from "@/lib/utils";

interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Terminal = ({ title = "terminal", children, className }: TerminalProps) => {
  return (
    <div className={cn("terminal overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{title}</span>
        <div className="w-12" />
      </div>
      
      {/* Content */}
      <div className="p-4 font-mono text-sm">
        {children}
      </div>
    </div>
  );
};

export default Terminal;
