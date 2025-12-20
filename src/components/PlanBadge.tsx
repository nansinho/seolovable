import { cn } from "@/lib/utils";
import { Zap, Crown, Building2, Star } from "lucide-react";

interface PlanBadgeProps {
  plan: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const PLAN_CONFIG = {
  free: {
    label: "Free",
    icon: Star,
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-muted",
    ringColor: "ring-muted",
    gradientFrom: "from-muted",
    gradientTo: "to-muted/50",
  },
  starter: {
    label: "Starter",
    icon: Zap,
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500",
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-400",
  },
  pro: {
    label: "Pro",
    icon: Crown,
    bgColor: "bg-accent/10",
    textColor: "text-accent",
    borderColor: "border-accent/30",
    ringColor: "ring-accent",
    gradientFrom: "from-accent",
    gradientTo: "to-yellow-400",
  },
  business: {
    label: "Business",
    icon: Building2,
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    ringColor: "ring-purple-500",
    gradientFrom: "from-purple-500",
    gradientTo: "to-pink-400",
  },
};

export const PlanBadge = ({ 
  plan, 
  size = "sm", 
  showIcon = true, 
  showLabel = true,
  className 
}: PlanBadgeProps) => {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold rounded-full border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

interface AvatarRingProps {
  plan: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AvatarRing = ({ plan, children, size = "md", className }: AvatarRingProps) => {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
  
  const ringWidths = {
    sm: "ring-[2px]",
    md: "ring-2",
    lg: "ring-[3px]",
  };

  const paddings = {
    sm: "p-[1px]",
    md: "p-[2px]",
    lg: "p-[3px]",
  };

  // For free plan, no special ring
  if (plan === "free") {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative rounded-full",
        paddings[size],
        className
      )}
    >
      {/* Gradient ring effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br",
          config.gradientFrom,
          config.gradientTo
        )}
      />
      <div className="relative rounded-full bg-background">
        {children}
      </div>
    </div>
  );
};

export const getPlanConfig = (plan: string) => {
  return PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
};

export default PlanBadge;
