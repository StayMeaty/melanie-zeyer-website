import React, { useRef, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../types';

interface DesiresSectionProps {
  id?: string;
  className?: string;
  disableParticles?: boolean;
}

interface DesireBlock {
  title: string;
  description: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchorX: number;
  anchorY: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  floatAngle: number;
  floatSpeed: number;
  /** Color hue variation in degrees (0-30) for warm gold tones around accent color */
  hue: number;
}

// Particle interaction constants - calm, meditative movement
const SWARM_RADIUS = 40;                          // px - tight firefly swarm radius around anchor
const SWARM_SPRING_FORCE = 0.02;                  // gentle spring force for calm swarming (reduced from 0.05)
const SWARM_RANDOM_FORCE = 0.02;                  // minimal random movement for slow floating (reduced from 0.1)
const SWARM_DRAG = 0.92;                          // stronger drag for slower, calmer movement (increased dampening from 0.95)
const POINTER_ACTIVATION_RADIUS_DESKTOP = 200;    // px - pointer must be within this distance from anchor (desktop)
const POINTER_ACTIVATION_RADIUS_MOBILE = 150;     // px - pointer must be within this distance from anchor (mobile)
const ORBIT_RADIUS = 18;                          // px - tight orbit radius around pointer (reduced from 30 for closer hovering)
const POINTER_ATTRACTION_FORCE = 0.12;            // very gentle attraction to pointer (reduced from 0.25 for calmer movement)
const POINTER_ORBIT_FORCE = 0.08;                 // gentle orbit force (reduced from 0.15 for calmer circling)
const FLOAT_DAMPENING = 0.95;                     // velocity reduction when attracted
const OPACITY_DIM_OVER_TEXT = 0.3;                // opacity multiplier when over text
const OPACITY_RESTORE_RATE = 0.99;                // gradual opacity restoration
const TEXT_EXCLUSION_PADDING = 20;                // px - safety margin around text
const TWINKLE_PROBABILITY = 0.01;                 // 1% chance per frame

/**
 * DesiresSection Component
 *
 * Displays inspirational questions with subtle sparkle effects for visual appeal.
 * Features interactive particles that respond to mouse/touch input and remain
 * anchored to desire blocks. Fully accessible with ARIA labels and reduced motion support.
 *
 * @param id - Optional section ID for navigation
 * @param className - Optional CSS class for styling
 * @param disableParticles - Disable particle effects (useful for performance testing)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DesiresSection />
 *
 * // With custom ID and class
 * <DesiresSection id="desires" className="custom-section" />
 *
 * // With particles disabled for testing
 * <DesiresSection disableParticles={true} />
 * ```
 */
const DesiresSection: React.FC<DesiresSectionProps> = ({ id, className, disableParticles = false }) => {
  // Refs for canvas and particle system
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationIdRef = useRef<number>();
  const nextIdRef = useRef(0);
  const desireBlockRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const mousePositionRef = useRef({ x: -1000, y: -1000, active: false });
  const fpsRef = useRef({ lastTime: 0, frames: 0, fps: 60 });

  const styles: Record<string, React.CSSProperties> = {
    section: {
      position: 'relative',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      position: 'relative',
      zIndex: 2,
    },
    title: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontFamily: "'Sumana', serif",
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      textAlign: 'center',
      marginBottom: '4rem',
      lineHeight: '1.2',
    },
    timelineContainer: {
      position: 'relative',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 0',
    },
    centerLine: {
      position: 'absolute',
      left: '50%',
      top: 0,
      transform: 'translateX(-50%)',
      width: '3px',
      height: 'calc(100% - 100px)',
      background: `linear-gradient(180deg, ${APP_CONFIG.colors.accent}66 0%, ${APP_CONFIG.colors.accent}66 100%)`,
      zIndex: 1,
    },
    timelineItem: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      marginBottom: '2rem',
      minHeight: '200px',
    },
    desireBlock: {
      padding: '2.5rem',
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      position: 'relative',
      width: 'calc(50% - 80px)',
      zIndex: 2,
    },
    leftBlock: {
      marginRight: 'auto',
      textAlign: 'right',
      marginLeft: 0,
    },
    rightBlock: {
      marginLeft: 'auto',
      textAlign: 'left',
      marginRight: 0,
    },
    connector: {
      position: 'absolute',
      height: '2px',
      width: '50px',
      background: `${APP_CONFIG.colors.accent}66`,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1,
    },
    connectorLeft: {
      right: 'calc(50% - 10px)',
    },
    connectorRight: {
      left: 'calc(50% - 10px)',
    },
    node: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: APP_CONFIG.colors.accent,
      border: '4px solid white',
      boxShadow: `0 0 0 3px ${APP_CONFIG.colors.accent}33`,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 3,
    },
    desireTitle: {
      fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.75rem',
      lineHeight: '1.3',
    },
    desireDescription: {
      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
      fontFamily: "'Arimo', sans-serif",
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
    },
    spacer: {
      height: '3rem',
    },
    // CTA Container
    ctaContainer: {
      maxWidth: '1000px',
      margin: '4rem auto 0',
      padding: '0 2rem',
    },
    // CTA Card with Accent Glow
    ctaCard: {
      maxWidth: '900px',
      margin: '0 auto 3rem',
      padding: '3.5rem 3rem 3rem',
      background: `linear-gradient(135deg, ${APP_CONFIG.colors.background} 0%, ${APP_CONFIG.colors.primary}05 100%)`,
      borderRadius: '2rem',
      border: `2px solid ${APP_CONFIG.colors.accent}`,
      boxShadow: '0 8px 40px rgba(232, 205, 140, 0.15)',
      position: 'relative',
      textAlign: 'center',
    },
    ctaIntro: {
      fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)',
      color: APP_CONFIG.colors.secondary,
      lineHeight: 1.8,
      marginBottom: '0.5rem',
      fontFamily: "'Arimo', sans-serif",
    },
    ctaCourseType: {
      fontSize: 'clamp(1.4rem, 3.2vw, 1.8rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      lineHeight: 1.6,
      marginBottom: '1rem',
      fontFamily: "'Sumana', serif",
      letterSpacing: '0.5px',
    },
    ctaCourseTitle: {
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontStyle: 'normal',
      display: 'block',
      margin: '1rem 0 0.5rem',
      fontSize: 'clamp(1.2rem, 2.8vw, 1.5rem)',
      fontFamily: "'Sumana', serif",
      lineHeight: 1.5,
    },
    ctaCourseTitleSubtitle: {
      color: APP_CONFIG.colors.primary,
      fontWeight: '400',
      fontStyle: 'normal',
      display: 'block',
      margin: '0 0 2.5rem',
      fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
      fontFamily: "'Sumana', serif",
      lineHeight: 1.5,
    },
    ctaButton: {
      display: 'inline-block',
      padding: '1.1rem 2.8rem',
      background: APP_CONFIG.colors.accent,
      color: '#333',
      borderRadius: '3rem',
      fontWeight: '600',
      fontSize: '1.1rem',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 20px rgba(232, 205, 140, 0.4)',
      border: 'none',
      cursor: 'pointer',
      fontFamily: "'Arimo', sans-serif",
    },
  };

  const mobileStyles = `
    @media (max-width: 767px) {
      .timeline-item {
        flex-direction: column !important;
        align-items: center !important;
        margin-bottom: 1.5rem !important;
      }
      .desire-block {
        width: 90% !important;
        margin: 0 auto !important;
        text-align: center !important;
        padding: 2rem !important;
      }
      .center-line {
        left: 20px !important;
        transform: none !important;
      }
      .node {
        left: 20px !important;
        transform: translateY(-50%) !important;
      }
      .connector {
        display: none !important;
      }
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      .desire-block {
        width: calc(50% - 60px) !important;
      }
      .connector {
        width: 40px !important;
      }
    }
  `;

  const animationStyles = `
    /* Keyframe animations for scroll-triggered effects */
    @keyframes growLine {
      from {
        height: 0;
        opacity: 0;
      }
      to {
        height: calc(100% - 100px);
        opacity: 1;
      }
    }

    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    /* Initial hidden states */
    .center-line {
      height: 0;
      opacity: 0;
    }

    .timeline-item {
      opacity: 0;
    }

    .node {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }

    /* Animated states */
    .center-line.animated {
      animation: growLine 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .timeline-item.animated {
      animation: fadeSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      animation-delay: calc(var(--item-delay) * 0.2s);
    }

    .node.animated {
      animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      animation-delay: calc(var(--item-delay) * 0.2s + 0.4s);
    }

    /* Respect user's motion preferences */
    @media (prefers-reduced-motion: reduce) {
      .center-line,
      .timeline-item,
      .node {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
      }

      .center-line {
        height: calc(100% - 100px) !important;
      }

      .node {
        transform: translate(-50%, -50%) scale(1) !important;
      }
    }
  `;

  const desires: DesireBlock[] = [
    {
      title: 'Weniger Schuldgefühle',
      description: 'und das Vertrauen, dein Leben nach deinen eigenen Regeln zu führen?',
    },
    {
      title: 'Klare Grenzen zu setzen',
      description: 'und gleichzeitig Mitgefühl zu behalten – ohne dich selbst zu verlieren?',
    },
    {
      title: 'Alte Stimmen loszulassen',
      description: 'und deine eigene innere Wahrheit zu stärken?',
    },
    {
      title: 'Innere Ruhe & Freiheit',
      description: 'auch dann, wenn deine Eltern älter werden und Erwartungen an dich stellen?',
    },
  ];

  // Mouse event handler for pointer interaction
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current || !sectionRef.current) return;

    const sectionRect = sectionRef.current.getBoundingClientRect();

    // Convert mouse position to canvas coordinates
    mousePositionRef.current = {
      x: e.clientX - sectionRect.left,
      y: e.clientY - sectionRect.top,
      active: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = {
      x: -1000,
      y: -1000,
      active: false,
    };
  }, []);

  // Touch event handlers for mobile support
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canvasRef.current || !sectionRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const sectionRect = sectionRef.current.getBoundingClientRect();

    mousePositionRef.current = {
      x: touch.clientX - sectionRect.left,
      y: touch.clientY - sectionRect.top,
      active: true,
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    mousePositionRef.current = {
      x: -1000,
      y: -1000,
      active: false,
    };
  }, []);

  // Create sparkle particle with slow, calm initial velocity
  const createSparkle = useCallback((anchorX: number, anchorY: number): Sparkle => {
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    return {
      id: nextIdRef.current++,
      x: anchorX + offsetX,
      y: anchorY + offsetY,
      vx: (Math.random() - 0.5) * 0.1,    // much slower initial velocity (reduced from 0.5)
      vy: (Math.random() - 0.5) * 0.1,    // much slower initial velocity (reduced from 0.5)
      anchorX,
      anchorY,
      size: 1 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.3,
      life: 0,
      maxLife: Infinity,
      floatAngle: Math.random() * Math.PI * 2,
      floatSpeed: 0.3 + Math.random() * 0.3,  // slower float speed range 0.3-0.6 (reduced from 0.5-1.0)
      hue: Math.random() * 30,
    };
  }, []);

  /**
   * Get optimal particle count based on viewport width for performance
   * Mobile: 4 particles per block = 16 total
   * Tablet: 6 particles per block = 24 total
   * Desktop: 8 particles per block = 32 total
   */
  const getParticleCount = useCallback((): number => {
    const width = window.innerWidth;
    if (width < 768) return 4; // Mobile
    if (width < 1200) return 6; // Tablet
    return 8; // Desktop
  }, []);

  /**
   * Check if particle overlaps with text areas to reduce opacity
   * Ensures sparkles don't obscure readable content
   */
  const isOverlappingText = useCallback((x: number, y: number, size: number): boolean => {
    if (!desireBlockRefs.current || !sectionRef.current) return false;

    const sectionRect = sectionRef.current.getBoundingClientRect();

    for (const blockRef of desireBlockRefs.current) {
      if (!blockRef) continue;

      const rect = blockRef.getBoundingClientRect();

      // Convert to canvas coordinates
      const blockX = rect.left - sectionRect.left;
      const blockY = rect.top - sectionRect.top;
      const blockWidth = rect.width;
      const blockHeight = rect.height;

      if (
        x + size > blockX - TEXT_EXCLUSION_PADDING &&
        x - size < blockX + blockWidth + TEXT_EXCLUSION_PADDING &&
        y + size > blockY - TEXT_EXCLUSION_PADDING &&
        y - size < blockY + blockHeight + TEXT_EXCLUSION_PADDING
      ) {
        return true;
      }
    }
    return false;
  }, []);

  // Initialize sparkles based on desire block positions
  const initializeSparkles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newSparkles: Sparkle[] = [];
    const sparkleCount = getParticleCount();

    desireBlockRefs.current.forEach((block) => {
      if (!block) return;

      const rect = block.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      for (let i = 0; i < sparkleCount; i++) {
        const x = rect.left - canvasRect.left + Math.random() * rect.width;
        const y = rect.top - canvasRect.top + Math.random() * rect.height;
        newSparkles.push(createSparkle(x, y));
      }
    });

    sparklesRef.current = newSparkles;
  }, [createSparkle, getParticleCount]);

  /**
   * Track FPS for performance monitoring
   * Warns if FPS drops below 30 (performance issue indicator)
   */
  const trackFPS = useCallback((timestamp: number) => {
    fpsRef.current.frames++;
    if (timestamp - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.frames;
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = timestamp;

      // Log warning if FPS drops below 30
      if (fpsRef.current.fps < 30) {
        console.warn(`DesiresSection: Low FPS detected (${fpsRef.current.fps})`);
      }
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track FPS for performance monitoring
    trackFPS(performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = mousePositionRef.current;
    // Use smaller activation radius on mobile for better touch interaction
    const pointerActivationRadius = window.innerWidth < 768
      ? POINTER_ACTIVATION_RADIUS_MOBILE
      : POINTER_ACTIVATION_RADIUS_DESKTOP;

    sparklesRef.current.forEach(sparkle => {
      // Calculate distance from pointer to THIS sparkle's anchor point (not particle position)
      const dxPointerToAnchor = mouse.x - sparkle.anchorX;
      const dyPointerToAnchor = mouse.y - sparkle.anchorY;
      const distPointerToAnchor = Math.sqrt(
        dxPointerToAnchor * dxPointerToAnchor +
        dyPointerToAnchor * dyPointerToAnchor
      );

      // Check if pointer is active and near this particle's anchor
      const isPointerNearAnchor = mouse.active && distPointerToAnchor < pointerActivationRadius;

      if (isPointerNearAnchor) {
        // POINTER ATTRACTION MODE: Very gentle, calm response to pointer near anchor
        const dxToPointer = mouse.x - sparkle.x;
        const dyToPointer = mouse.y - sparkle.y;
        const distToPointer = Math.sqrt(dxToPointer * dxToPointer + dyToPointer * dyToPointer);

        if (distToPointer > 0) {
          // Very gentle attraction force for calm, slow movement
          const force = (1 - distPointerToAnchor / pointerActivationRadius) * POINTER_ATTRACTION_FORCE;

          if (distToPointer > ORBIT_RADIUS) {
            // Gently move toward pointer
            sparkle.vx += (dxToPointer / distToPointer) * force;
            sparkle.vy += (dyToPointer / distToPointer) * force;
          } else {
            // Calm orbit around pointer in tight radius
            sparkle.vx += (-dyToPointer / distToPointer) * POINTER_ORBIT_FORCE;
            sparkle.vy += (dxToPointer / distToPointer) * POINTER_ORBIT_FORCE;
          }

          // Dampen physics when attracted to pointer
          sparkle.floatSpeed *= FLOAT_DAMPENING;

          // Brighten sparkles during interaction
          const brightnessFactor = 1 + (1 - distPointerToAnchor / pointerActivationRadius) * 0.5;
          sparkle.opacity = Math.min(1.0, sparkle.opacity * brightnessFactor);
        }
      } else {
        // CALM SWARM MODE: Slow, lazy floating like calm fireflies at night
        const dxAnchor = sparkle.anchorX - sparkle.x;
        const dyAnchor = sparkle.anchorY - sparkle.y;
        const distFromAnchor = Math.sqrt(dxAnchor * dxAnchor + dyAnchor * dyAnchor);

        if (distFromAnchor > SWARM_RADIUS) {
          // Gently pull back toward anchor if outside swarm radius
          sparkle.vx += (dxAnchor / distFromAnchor) * SWARM_SPRING_FORCE;
          sparkle.vy += (dyAnchor / distFromAnchor) * SWARM_SPRING_FORCE;
        }

        // Minimal random movement for calm, organic floating
        sparkle.vx += (Math.random() - 0.5) * SWARM_RANDOM_FORCE;
        sparkle.vy += (Math.random() - 0.5) * SWARM_RANDOM_FORCE;

        // Apply drag to keep movement slow and meditative
        sparkle.vx *= SWARM_DRAG;
        sparkle.vy *= SWARM_DRAG;

        // Restore original opacity when in swarm mode
        if (sparkle.opacity > 0.7) {
          sparkle.opacity *= OPACITY_RESTORE_RATE;
        }

        // Slow, lazy floating physics for meditative calm (reduced from 0.01)
        sparkle.floatAngle += sparkle.floatSpeed * 0.01;
        sparkle.vx += Math.cos(sparkle.floatAngle) * 0.01;
        sparkle.vy += Math.sin(sparkle.floatAngle * 0.7) * 0.008;
      }

      // Update position
      sparkle.x += sparkle.vx;
      sparkle.y += sparkle.vy;

      // Soft boundaries (keep particles on canvas)
      const margin = 50;
      if (sparkle.x < margin) sparkle.vx += 0.1;
      else if (sparkle.x > canvas.width - margin) sparkle.vx -= 0.1;
      if (sparkle.y < margin) sparkle.vy += 0.1;
      else if (sparkle.y > canvas.height - margin) sparkle.vy -= 0.1;

      // Store original opacity for text overlap calculation
      const originalOpacity = sparkle.opacity;

      // Reduce opacity significantly when over text to maintain readability
      if (isOverlappingText(sparkle.x, sparkle.y, sparkle.size * 3)) {
        sparkle.opacity *= OPACITY_DIM_OVER_TEXT;
      }

      // Draw sparkle with radial gradient glow
      const gradient = ctx.createRadialGradient(
        sparkle.x, sparkle.y, 0,
        sparkle.x, sparkle.y, sparkle.size * 3
      );

      const baseHue = 43;
      const hue = baseHue + sparkle.hue - 15;

      gradient.addColorStop(0, `hsla(${hue}, 75%, 75%, ${sparkle.opacity})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 70%, 70%, ${sparkle.opacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${hue}, 65%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Restore original opacity for next frame
      sparkle.opacity = originalOpacity;

      // Occasional twinkle effect adds subtle life to particles
      if (Math.random() < TWINKLE_PROBABILITY) {
        sparkle.size = 1 + Math.random() * 2;
        sparkle.opacity = Math.max(0.4, Math.min(0.7, 0.4 + Math.random() * 0.3));
      }
    });

    animationIdRef.current = requestAnimationFrame(animate);
  }, [isOverlappingText, trackFPS]);

  // Resize canvas to match section dimensions
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const rect = section.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Reinitialize sparkles after resize
    if (sparklesRef.current.length > 0) {
      initializeSparkles();
    }
  }, [initializeSparkles]);

  // Setup canvas and animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip particle initialization if disabled or motion reduced
    if (disableParticles || prefersReducedMotion) {
      return;
    }

    resizeCanvas();

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      initializeSparkles();
      animationIdRef.current = requestAnimationFrame(animate);
    }, 100);

    // Add pointer event listeners
    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      section.addEventListener('mouseleave', handleMouseLeave);
      section.addEventListener('touchmove', handleTouchMove);
      section.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      clearTimeout(timer);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (section) {
        section.removeEventListener('mousemove', handleMouseMove);
        section.removeEventListener('mouseleave', handleMouseLeave);
        section.removeEventListener('touchmove', handleTouchMove);
        section.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [animate, initializeSparkles, resizeCanvas, handleMouseMove, handleMouseLeave, handleTouchMove, handleTouchEnd, disableParticles]);

  // Handle window resize with debouncing
  useEffect(() => {
    let resizeTimer: number;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
      }, 300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [resizeCanvas]);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    const observerOptions = {
      threshold: 0.15, // Trigger when 15% of element is visible
      rootMargin: '0px 0px -50px 0px', // Start slightly before element enters viewport
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Keep observing in case user scrolls back up
        }
      });
    }, observerOptions);

    // Observe center line (plant stem)
    const centerLine = document.querySelector('.center-line');
    if (centerLine) {
      observer.observe(centerLine);
    }

    // Observe timeline items and nodes
    const timelineItems = document.querySelectorAll('.timeline-item');
    const nodes = document.querySelectorAll('.node');

    timelineItems.forEach((item) => {
      observer.observe(item);
    });

    nodes.forEach((node) => {
      observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, []); // Run once on mount

  return (
    <>
      <style>{mobileStyles}</style>
      <style>{animationStyles}</style>

      <section
        ref={sectionRef}
        id={id || 'desires-section'}
        className={className}
        style={styles.section}
        aria-labelledby="desires-heading"
        aria-describedby="desires-description"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          role="presentation"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div style={styles.container}>
          <h1 id="desires-heading" style={styles.title}>Wünschst du dir …</h1>

          {/* Hidden description for screen readers */}
          <div
            id="desires-description"
            style={{
              position: 'absolute',
              left: '-10000px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            Inspirierende Fragen mit dezenten, dekorativen Funkeleffekten zur persönlichen Entwicklung und Befreiung von belastenden Elternbeziehungen.
          </div>

          <div className="timeline-container" style={styles.timelineContainer}>
            {/* Vertical center line (plant stem) */}
            <div className="center-line" style={styles.centerLine} aria-hidden="true" />

            {desires.map((desire, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className="timeline-item"
                  style={{
                    ...styles.timelineItem,
                    // @ts-ignore - CSS custom property
                    '--item-delay': index,
                  }}
                >
                  {/* Left-side blocks (index 0, 2) */}
                  {isLeft && (
                    <>
                      <article
                        ref={(el) => (desireBlockRefs.current[index] = el)}
                        className="desire-block"
                        style={{ ...styles.desireBlock, ...styles.leftBlock }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 151, 178, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <h2 style={styles.desireTitle}>{desire.title}</h2>
                        <p style={styles.desireDescription}>{desire.description}</p>
                      </article>
                      <div className="connector" style={{ ...styles.connector, ...styles.connectorLeft }} aria-hidden="true" />
                      <div className="node" style={styles.node} aria-hidden="true" />
                    </>
                  )}

                  {/* Right-side blocks (index 1, 3) */}
                  {!isLeft && (
                    <>
                      <div className="node" style={styles.node} aria-hidden="true" />
                      <div className="connector" style={{ ...styles.connector, ...styles.connectorRight }} aria-hidden="true" />
                      <article
                        ref={(el) => (desireBlockRefs.current[index] = el)}
                        className="desire-block"
                        style={{ ...styles.desireBlock, ...styles.rightBlock }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 151, 178, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <h2 style={styles.desireTitle}>{desire.title}</h2>
                        <p style={styles.desireDescription}>{desire.description}</p>
                      </article>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.spacer}></div>

          {/* CTA Section */}
          <div style={styles.ctaContainer}>
            <div style={styles.ctaCard}>
              <div style={styles.ctaIntro}>
                Dann starte jetzt deinen Weg in die Freiheit mit dem
              </div>
              <div style={styles.ctaCourseType}>
                8-Wochen-Live Onlinekurs
              </div>
              <div style={styles.ctaCourseTitle}>
                „Eltern werden alt, du wirst frei.
              </div>
              <div style={styles.ctaCourseTitleSubtitle}>
                Raus aus einer belastenden Elternbeziehung, rein in deine neue Freiheit: Löse dich aus Schuld, Pflicht und Verstrickung"
              </div>
              <button
                style={styles.ctaButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(232, 205, 140, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(232, 205, 140, 0.4)';
                }}
              >
                Jetzt starten
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DesiresSection;
