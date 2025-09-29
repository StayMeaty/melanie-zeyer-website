import React, { useState, useRef, useEffect } from 'react';
import { APP_CONFIG } from '../types';

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

interface SparkleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const SparkleButton: React.FC<SparkleButtonProps> = ({
  children,
  onClick,
  style = {},
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const sparkIdRef = useRef(0);

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    backgroundColor: APP_CONFIG.colors.accent,
    color: '#333',
    padding: '1rem 2rem',
    borderRadius: '2rem',
    border: 'none',
    fontWeight: '600',
    fontSize: '1.1rem',
    fontFamily: "'Arimo', sans-serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(232, 205, 140, 0.3)',
    opacity: disabled ? 0.6 : 1,
    overflow: 'hidden',
    ...style,
  };

  const canvasStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const contentStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
  };

  // Create new sparks around mouse position
  const createSparks = (mouseX: number, mouseY: number) => {
    if (disabled) return;
    
    const newSparks: Spark[] = [];
    const sparkCount = 3; // Create 3 sparks per frame when hovering
    
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1; // Random speed between 1-4
      const size = Math.random() * 3 + 1; // Random size between 1-4px
      
      newSparks.push({
        id: sparkIdRef.current++,
        x: mouseX + (Math.random() - 0.5) * 20, // Spread around mouse
        y: mouseY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 20, // 30-50 frames
        size: size,
        opacity: 1,
      });
    }
    
    setSparks(prevSparks => [...prevSparks, ...newSparks]);
  };

  // Animation loop
  const animate = () => {
    setSparks(prevSparks => {
      return prevSparks
        .map(spark => ({
          ...spark,
          x: spark.x + spark.vx,
          y: spark.y + spark.vy,
          vx: spark.vx * 0.98, // Slow down over time
          vy: spark.vy * 0.98,
          life: spark.life + 1,
          opacity: Math.max(0, 1 - (spark.life / spark.maxLife)),
        }))
        .filter(spark => spark.life < spark.maxLife && spark.opacity > 0);
    });

    if (isHovered) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Draw sparks on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match button
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sparks
    sparks.forEach(spark => {
      if (spark.opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = spark.opacity;
      ctx.fillStyle = APP_CONFIG.colors.accent;
      
      // Create a glowing effect
      ctx.shadowColor = APP_CONFIG.colors.accent;
      ctx.shadowBlur = spark.size * 2;
      
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }, [sparks]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isHovered) {
      createSparks(x, y);
    }
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (disabled) return;
    
    setIsHovered(true);
    
    // Start animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Stop creating new sparks, let existing ones fade out
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Continue animation for a bit to let sparks fade
    const fadeOut = () => {
      setSparks(prevSparks => {
        const updatedSparks = prevSparks
          .map(spark => ({
            ...spark,
            x: spark.x + spark.vx,
            y: spark.y + spark.vy,
            vx: spark.vx * 0.95,
            vy: spark.vy * 0.95,
            life: spark.life + 1,
            opacity: Math.max(0, spark.opacity - 0.05),
          }))
          .filter(spark => spark.opacity > 0);
        
        if (updatedSparks.length > 0) {
          requestAnimationFrame(fadeOut);
        }
        
        return updatedSparks;
      });
    };
    
    requestAnimationFrame(fadeOut);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...baseStyles,
        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered && !disabled 
          ? '0 6px 20px rgba(232, 205, 140, 0.4)' 
          : '0 4px 15px rgba(232, 205, 140, 0.3)',
      }}
      className={className}
      disabled={disabled}
    >
      <canvas
        ref={canvasRef}
        style={canvasStyles}
      />
      <span style={contentStyles}>
        {children}
      </span>
    </button>
  );
};

export default SparkleButton;