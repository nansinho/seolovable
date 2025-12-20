import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale" | "blur";
}

export const AnimatedSection = ({ 
  children, 
  className = "", 
  delay = 0,
  animation = "fade-up" 
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation();

  const animations = {
    "fade-up": {
      hidden: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    "fade-left": {
      hidden: "opacity-0 -translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    "fade-right": {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    "scale": {
      hidden: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
    "blur": {
      hidden: "opacity-0 blur-sm",
      visible: "opacity-100 blur-0",
    },
  };

  const { hidden, visible } = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? visible : hidden
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale";
}

export const StaggeredList = ({
  children,
  className = "",
  itemClassName = "",
  staggerDelay = 100,
  animation = "fade-up",
}: StaggeredListProps) => {
  const { ref, isVisible } = useScrollAnimation();

  const animations = {
    "fade-up": {
      hidden: "opacity-0 translate-y-6",
      visible: "opacity-100 translate-y-0",
    },
    "fade-left": {
      hidden: "opacity-0 -translate-x-6",
      visible: "opacity-100 translate-x-0",
    },
    "fade-right": {
      hidden: "opacity-0 translate-x-6",
      visible: "opacity-100 translate-x-0",
    },
    "scale": {
      hidden: "opacity-0 scale-90",
      visible: "opacity-100 scale-100",
    },
  };

  const { hidden, visible } = animations[animation];

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-500 ease-out ${
            isVisible ? visible : hidden
          } ${itemClassName}`}
          style={{ transitionDelay: isVisible ? `${index * staggerDelay}ms` : "0ms" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
