import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0.2);
  const colorIndexRef = useRef(0);

  // Gradient colors from the page theme
  const gradientColors = [
    { r: 14, g: 159, b: 168 },    // primary #0E9FA8
    { r: 58, g: 182, b: 137 },    // secondary #3AB689
    { r: 85, g: 195, b: 118 },    // support #55C376
    { r: 37, g: 170, b: 152 },    // support2 #25AA98
    { r: 113, g: 210, b: 97 },    // accent #71D261
    { r: 183, g: 229, b: 206 },   // light-green #B7E5CE
  ];

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
        setIntensity(isLight ? 0.3 : 0.2);
      }
    };

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.15;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.15;

      // Smoothly transition between gradient colors
      colorIndexRef.current = (colorIndexRef.current + 0.01) % gradientColors.length;
      
      const currentIndex = Math.floor(colorIndexRef.current);
      const nextIndex = (currentIndex + 1) % gradientColors.length;
      const blend = colorIndexRef.current - currentIndex;

      const color1 = gradientColors[currentIndex];
      const color2 = gradientColors[nextIndex];
      const color3 = gradientColors[(nextIndex + 1) % gradientColors.length];

      // Interpolate between colors
      const r1 = color1.r + (color2.r - color1.r) * blend;
      const g1 = color1.g + (color2.g - color1.g) * blend;
      const b1 = color1.b + (color2.b - color1.b) * blend;

      const r2 = color2.r + (color3.r - color2.r) * blend;
      const g2 = color2.g + (color3.g - color2.g) * blend;
      const b2 = color2.b + (color3.b - color2.b) * blend;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
        glowRef.current.style.background = `radial-gradient(circle, 
          rgba(${r1}, ${g1}, ${b1}, ${intensity}) 0%, 
          rgba(${r2}, ${g2}, ${b2}, ${intensity * 0.7}) 40%, 
          rgba(${r1 * 0.8}, ${g1 * 0.8}, ${b1 * 0.8}, ${intensity * 0.4}) 60%, 
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
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300"
      style={{
        filter: 'blur(70px)',
        willChange: 'transform',
        opacity: intensity > 0.25 ? 1 : 0.85,
      }}
    />
  );
}
