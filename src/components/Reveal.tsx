import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Delay in ms before the reveal starts once visible. */
  delay?: number;
  /** Motion style of the entrance. */
  variant?: 'up' | 'fade' | 'scale';
  className?: string;
}

const HIDDEN: Record<NonNullable<RevealProps['variant']>, string> = {
  up: 'opacity-0 translate-y-8',
  fade: 'opacity-0',
  scale: 'opacity-0 scale-95',
};

/** Reveals its children with a subtle entrance once they scroll into view. */
export const Reveal = ({ children, delay = 0, variant = 'up', className = '' }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? 'opacity-100 translate-y-0 scale-100' : HIDDEN[variant]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;