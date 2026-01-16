import React, { useEffect, useRef, useState } from 'react';

/**
 * CursorGlow - Interactive cursor glow effect
 * Creates a smooth, color-shifting glow that follows the cursor
 * Only activates over white/light backgrounds
 * Respects user's motion preferences
 */
export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth animation
      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });

        // Check if cursor is over a light/white background
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        if (elementUnderCursor) {
          const bgColor = window.getComputedStyle(elementUnderCursor).backgroundColor;
          const isLightBackground = checkIfLightBackground(bgColor, elementUnderCursor);
          setIsActive(isLightBackground);
        }
      });
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Calculate gradient color based on cursor position
  const getGradientColor = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Normalize position (0-1)
    const normalizedX = x / windowWidth;
    const normalizedY = y / windowHeight;
    
    // Create a combined factor for color interpolation
    const factor = (normalizedX + normalizedY) / 2;
    
    // Define gradient colors from tailwind config
    const colors = [
      { r: 14, g: 159, b: 168 },   // primary #0E9FA8
      { r: 58, g: 182, b: 137 },   // secondary #3AB689
      { r: 113, g: 210, b: 97 },   // accent #71D261
      { r: 85, g: 195, b: 118 }    // support #55C376
    ];
    
    // Interpolate between colors based on position
    let colorIndex = factor * (colors.length - 1);
    let lowerIndex = Math.floor(colorIndex);
    let upperIndex = Math.ceil(colorIndex);
    let blend = colorIndex - lowerIndex;
    
    lowerIndex = Math.max(0, Math.min(colors.length - 1, lowerIndex));
    upperIndex = Math.max(0, Math.min(colors.length - 1, upperIndex));
    
    const lowerColor = colors[lowerIndex];
    const upperColor = colors[upperIndex];
    
    const r = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * blend);
    const g = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * blend);
    const b = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * blend);
    
    return `rgba(${r}, ${g}, ${b}, 0.55)`;
  };

  // Check if background is light/white
  const checkIfLightBackground = (bgColor: string, element: Element): boolean => {
    // Parse RGB values from background color
    const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Consider it light if luminance > 0.65
      if (luminance > 0.65) {
        return true;
      }
    }
    
    // Check for transparent backgrounds by traversing up the DOM
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      const parent = element.parentElement;
      if (parent && parent !== document.body) {
        const parentBg = window.getComputedStyle(parent).backgroundColor;
        return checkIfLightBackground(parentBg, parent);
      }
      // Default to white background if we reach body
      return true;
    }
    
    return false;
  };

  const currentColor = getGradientColor(position.x, position.y);

  return (
    <div
      ref={glowRef}
      className="cursor-glow-effect"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentColor} 0%, transparent 65%)`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
        filter: 'blur(45px)',
        mixBlendMode: 'multiply',
        willChange: 'transform, opacity'
      }}
    />
  );
};

export default CursorGlow;
