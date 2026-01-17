import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0.15);
  const hueRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        const isLight = bgColor.includes('255') || bgColor.includes('rgb(246');
        setIntensity(isLight ? 0.25 : 0.15);
      }
    };

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.12;

      hueRef.current = (hueRef.current + 0.5) % 360;

      if (glowRef.current) {
        const hue = hueRef.current;
        glowRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
        glowRef.current.style.background = `radial-gradient(circle, 
          hsla(${120 + hue * 0.3}, 70%, 60%, ${intensity}) 0%, 
          hsla(${180 + hue * 0.5}, 65%, 55%, ${intensity * 0.7}) 40%, 
          hsla(${200 + hue * 0.4}, 60%, 50%, ${intensity * 0.4}) 60%, 
          transparent 80%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300"
      style={{
        filter: 'blur(60px)',
        willChange: 'transform',
        opacity: intensity > 0.2 ? 1 : 0.8,
      }}
    />
  );
}
