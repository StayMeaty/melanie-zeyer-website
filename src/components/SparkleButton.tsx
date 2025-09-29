import React, { useRef, useEffect, useState, useCallback } from 'react';
import { APP_CONFIG } from '../types';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  vx: number;  // velocity x
  vy: number;  // velocity y
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface SparkleButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

const SparkleButton: React.FC<SparkleButtonProps> = ({
  onClick,
  children,
  className = '',
  variant = 'primary',
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationIdRef = useRef<number>();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const nextIdRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [clickPhase, setClickPhase] = useState<'idle' | 'inflate' | 'explode'>('idle');
  const lastEmitRef = useRef(0);
  
  // Physics constants
  const GRAVITY = 0.3;
  const EMIT_RATE = 100; // ms between hover emissions
  const HOVER_PARTICLES = 3; // particles per hover emission
  const CLICK_PARTICLES = 25; // particles on click explosion
  
  // Create sparkle at position (with canvas offset compensation)
  const createSparkle = useCallback((x: number, y: number, explosive: boolean = false) => {
    const angleRange = explosive ? Math.PI * 2 : Math.PI; // Full circle for explosion, half for hover
    const angle = explosive 
      ? Math.random() * angleRange 
      : -Math.PI/2 - angleRange/4 + Math.random() * angleRange/2; // Upward bias for hover
    
    const speed = explosive 
      ? 2 + Math.random() * 6  // Higher speed for explosion
      : 1 + Math.random() * 3; // Gentler for hover
    
    return {
      id: nextIdRef.current++,
      x: x + 100, // Add padding offset
      y: y + 100, // Add padding offset
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (explosive ? 3 : 1), // Initial upward boost
      size: explosive ? 2 + Math.random() * 4 : 1 + Math.random() * 2,
      opacity: 1,
      life: 0,
      maxLife: explosive ? 40 + Math.random() * 20 : 20 + Math.random() * 20
    };
  }, []);
  
  // Handle mouse move on hover
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current || !isHovered) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Emit particles on hover at controlled rate
    const now = Date.now();
    if (now - lastEmitRef.current > EMIT_RATE) {
      for (let i = 0; i < HOVER_PARTICLES; i++) {
        sparklesRef.current.push(
          createSparkle(mousePositionRef.current.x, mousePositionRef.current.y, false)
        );
      }
      lastEmitRef.current = now;
    }
  }, [isHovered, createSparkle]);
  
  // Handle click explosion with enhanced animation
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Start inflation phase
    setClickPhase('inflate');
    setTimeout(() => setClickPhase('explode'), 150);
    setTimeout(() => setClickPhase('idle'), 300);
    
    // Get click position relative to button
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create explosion of sparkles
      for (let i = 0; i < CLICK_PARTICLES; i++) {
        sparklesRef.current.push(createSparkle(x, y, true));
      }
    }
    
    onClick?.();
  }, [onClick, disabled, createSparkle]);
  
  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw sparkles
    sparklesRef.current = sparklesRef.current.filter(sparkle => {
      // Apply gravity
      sparkle.vy += GRAVITY;
      
      // Update position
      sparkle.x += sparkle.vx;
      sparkle.y += sparkle.vy;
      
      // Update life
      sparkle.life++;
      
      // Calculate opacity based on life
      sparkle.opacity = 1 - (sparkle.life / sparkle.maxLife);
      
      // Remove if dead or out of bounds
      if (sparkle.opacity <= 0 || sparkle.y > canvas.height + 10) {
        return false;
      }
      
      // Draw sparkle with glow effect
      const gradient = ctx.createRadialGradient(
        sparkle.x, sparkle.y, 0,
        sparkle.x, sparkle.y, sparkle.size * 2
      );
      gradient.addColorStop(0, `rgba(232, 205, 140, ${sparkle.opacity})`);
      gradient.addColorStop(0.6, `rgba(232, 205, 140, ${sparkle.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(232, 205, 140, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw solid center
      ctx.fillStyle = `rgba(232, 205, 140, ${sparkle.opacity})`;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();
      
      return true;
    });
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, []);
  
  // Handle canvas resize with padding for particle overflow
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const padding = 100; // Extra space for particles
        canvasRef.current.width = rect.width + padding * 2;
        canvasRef.current.height = rect.height + padding * 2;
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // Start/stop animation
  useEffect(() => {
    if (sparklesRef.current.length > 0 || isHovered || clickPhase !== 'idle') {
      if (!animationIdRef.current) {
        animate();
      }
    } else if (animationIdRef.current && sparklesRef.current.length === 0) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = undefined;
    }
  }, [isHovered, clickPhase, animate]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);
  
  // Button colors based on variant
  const getButtonColor = () => {
    switch (variant) {
      case 'secondary':
        return APP_CONFIG.colors.secondary;
      case 'accent':
        return APP_CONFIG.colors.accent;
      default:
        return APP_CONFIG.colors.primary;
    }
  };
  
  const styles: Record<string, React.CSSProperties> = {
    container: {
      position: 'relative',
      display: 'inline-block',
      overflow: 'visible', // Allow particles to escape bounds
    },
    button: {
      backgroundColor: getButtonColor(),
      color: variant === 'accent' ? '#333' : '#FFFFFF',
      border: 'none',
      borderRadius: '2rem',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: 'Arimo, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring effect
      transform: clickPhase === 'inflate' 
        ? 'scale(1.15)' 
        : clickPhase === 'explode'
          ? 'scale(1.0)'
          : isHovered 
            ? 'scale(1.05) translateY(-2px)' 
            : 'scale(1)',
      boxShadow: isHovered 
        ? '0 8px 24px rgba(0, 151, 178, 0.4)' 
        : '0 4px 16px rgba(0, 151, 178, 0.3)',
      opacity: disabled ? 0.6 : 1,
      position: 'relative',
      zIndex: 1,
    },
    canvas: {
      position: 'absolute',
      top: '-100px',  // Offset by padding
      left: '-100px', // Offset by padding
      width: 'calc(100% + 200px)',
      height: 'calc(100% + 200px)',
      pointerEvents: 'none',
      zIndex: 2,
    }
  };
  
  return (
    <div 
      ref={buttonRef}
      style={styles.container}
      className={className}
    >
      <div
        style={styles.button}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          // Clear hover sparkles quickly when leaving
          sparklesRef.current = sparklesRef.current.filter(s => s.maxLife > 30);
        }}
        onMouseMove={handleMouseMove}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            const mouseEvent = {
              clientX: buttonRef.current?.getBoundingClientRect().left || 0,
              clientY: buttonRef.current?.getBoundingClientRect().top || 0,
              currentTarget: e.currentTarget
            } as React.MouseEvent<HTMLDivElement>;
            handleClick(mouseEvent);
          }
        }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        aria-hidden="true"
      />
    </div>
  );
};

export default SparkleButton;