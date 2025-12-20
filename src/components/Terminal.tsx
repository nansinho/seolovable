import { cn } from "@/lib/utils";

interface TerminalProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Terminal = ({ children, title = "terminal", className }: TerminalProps) => {
  return (
    <div className={cn("terminal-window", className)}>
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="ml-4 text-xs text-muted-foreground font-code">{title}</span>
      </div>
      <div className="terminal-content">
        {children}
      </div>
    </div>
  );
};

export default Terminal;