import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (location.pathname) {
      setIsTransitioning(true);
      
      // Small delay to allow exit animation
      setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 150);
    }
  }, [location.pathname, children]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isTransitioning 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      {displayChildren}
    </div>
  );
};

// Scroll to top on page change
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Animated counter for grades/scores
export const AnimatedCounter = ({ value, duration = 1000, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}{suffix}</span>;
};

// Fade in on scroll
export const FadeInOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, delay]);

  return (
    <div
      ref={setRef}
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
};

// Stagger children animation
export const StaggerContainer = ({ children, staggerDelay = 50 }) => {
  return (
    <div className="stagger-container">
      {children}
    </div>
  );
};

export const StaggerItem = ({ children, index = 0 }) => {
  return (
    <div 
      className="stagger-item"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {children}
    </div>
  );
};

// Hover scale wrapper
export const HoverScale = ({ children, scale = 1.02 }) => {
  return (
    <div 
      className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
    >
      {children}
    </div>
  );
};

// Glass card effect
export const GlassCard = ({ children, className = '' }) => {
  return (
    <div 
      className={`backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-lg rounded-xl ${className}`}
    >
      {children}
    </div>
  );
};

// Floating animation wrapper
export const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <div 
      className="animate-float"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Pulse ring for notifications/badges
export const PulseRing = ({ children, color = 'bg-red-500' }) => {
  return (
    <div className="relative">
      <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-20`}></span>
      <span className={`absolute -inset-1 rounded-full ${color} animate-pulse opacity-10`}></span>
      {children}
    </div>
  );
};
