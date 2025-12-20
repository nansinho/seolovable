import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  className?: string;
}

export const Particles = ({ count = 30, className = "" }: ParticlesProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.6 + 0.3,
      type: Math.random() > 0.7 ? 'glow' : 'dot',
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full animate-particle ${
            particle.type === 'glow' 
              ? 'bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.5)]' 
              : 'bg-accent/50'
          }`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
