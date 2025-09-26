import React, { useEffect, useRef, useState, useCallback } from 'react';
import { APP_CONFIG, Particle, MousePosition } from '../types';

interface ParticleEffectProps {
  logoPosition: { x: number; y: number };
  maxParticles?: number;
  spawnRate?: number;
  particleSpeed?: number;
  repulsionRadius?: number;
  repulsionForce?: number;
  ambientParticles?: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  logoPosition,
  maxParticles = 375,
  spawnRate = 4,
  particleSpeed = 0.25,
  repulsionRadius = 100,
  repulsionForce = 0.3,
  ambientParticles = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>();
  const mousePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const lastSpawnTimeRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    mousePositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  // Create an ambient floating particle
  const createAmbientParticle = useCallback((): Particle => {
    const size = 2 + Math.random() * 6;
    const x = Math.random() * dimensions.width;
    const y = Math.random() * dimensions.height;
    const floatAngle = Math.random() * Math.PI * 2;
    const floatSpeed = 0.1 + Math.random() * 0.2;

    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: 0,
      vy: 0,
      size,
      opacity: 0.6 + Math.random() * 0.4,
      life: 0,
      maxLife: 1500 + Math.random() * 1000, // Ambient particles live 25-42 seconds
      isFloating: true,
      floatAngle,
      floatSpeed,
    };
  }, [dimensions]);

  // Create a new particle from logo
  const createParticle = useCallback((): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = particleSpeed * 2; // Increase base speed
    const speed = baseSpeed + Math.random() * baseSpeed;
    const size = 2 + Math.random() * 6;
    const maxLife = 100 + Math.random() * 50; // Shorter life before transitioning to floating
    const totalLife = maxLife + 800 + Math.random() * 400; // Total lifespan including floating phase (15-20 seconds total)

    return {
      id: particleIdRef.current++,
      x: logoPosition.x,
      y: logoPosition.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      opacity: 1,
      life: 0,
      maxLife: totalLife,
      isFloating: false,
      floatAngle: Math.random() * Math.PI * 2,
      floatSpeed: 0.1 + Math.random() * 0.2,
    };
  }, [logoPosition, particleSpeed]);

  // Initialize ambient particles
  const initializeAmbientParticles = useCallback(() => {
    if (!initializedRef.current) {
      for (let i = 0; i < ambientParticles; i++) {
        particlesRef.current.push(createAmbientParticle());
      }
      initializedRef.current = true;
    }
  }, [ambientParticles, createAmbientParticle]);

  // Update particle positions and properties
  const updateParticle = useCallback((particle: Particle): Particle => {
    // Transition to floating after initial burst phase (around 100-150 frames)
    if (!particle.isFloating && particle.life >= 125) {
      particle.isFloating = true;
      particle.vx *= 0.1; // Slow down dramatically
      particle.vy *= 0.1;
    }

    // Apply mouse repulsion
    const dx = particle.x - mousePositionRef.current.x;
    const dy = particle.y - mousePositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius && distance > 0) {
      const force = repulsionForce * (1 - distance / repulsionRadius);
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      particle.vx += normalizedDx * force;
      particle.vy += normalizedDy * force;
    }

    // Apply floating behavior
    if (particle.isFloating) {
      // Gentle floating motion like leaves on water
      particle.floatAngle += particle.floatSpeed * 0.02;
      particle.vx += Math.cos(particle.floatAngle) * 0.02;
      particle.vy += Math.sin(particle.floatAngle * 0.7) * 0.015;
      
      // Apply drag to floating particles
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      // Keep particles within bounds with soft boundaries
      const margin = 50;
      if (particle.x < margin) {
        particle.vx += 0.1;
      } else if (particle.x > dimensions.width - margin) {
        particle.vx -= 0.1;
      }
      if (particle.y < margin) {
        particle.vy += 0.1;
      } else if (particle.y > dimensions.height - margin) {
        particle.vy -= 0.1;
      }
    }

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Update life and opacity
    particle.life++;
    
    // Fade out particles approaching end of life
    const fadeStart = particle.maxLife * 0.8; // Start fading at 80% of life
    if (particle.life > fadeStart) {
      const fadeProgress = (particle.life - fadeStart) / (particle.maxLife - fadeStart);
      particle.opacity = Math.max(0, (1 - fadeProgress) * 0.8);
    } else if (!particle.isFloating) {
      // Initial spawn phase opacity
      particle.opacity = Math.max(0.6, 1 - (particle.life / 100) * 0.4);
    }

    return particle;
  }, [repulsionRadius, repulsionForce, dimensions]);

  // Check if particle should be removed
  const shouldRemoveParticle = useCallback((particle: Particle): boolean => {
    // Remove particles that exceeded their lifespan
    if (particle.life >= particle.maxLife) {
      return true;
    }
    
    // Also remove if they go too far out of bounds
    return (
      particle.x < -100 ||
      particle.x > dimensions.width + 100 ||
      particle.y < -100 ||
      particle.y > dimensions.height + 100
    );
  }, [dimensions]);

  // Render particles on canvas with subtle glow effect
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw particles with subtle glow
    particlesRef.current.forEach((particle) => {
      const alpha = particle.opacity;
      const radius = particle.size / 2;
      
      // Create gradient for subtle glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, radius * 2
      );
      gradient.addColorStop(0, `rgba(232, 205, 140, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(232, 205, 140, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(232, 205, 140, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw solid center
      ctx.globalAlpha = alpha;
      ctx.fillStyle = APP_CONFIG.colors.accent;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }, [dimensions]);

  // Animation loop with performance optimizations
  const animate = useCallback((currentTime: number) => {
    // Initialize ambient particles on first frame
    initializeAmbientParticles();

    // Throttle spawning to improve performance
    if (
      currentTime - lastSpawnTimeRef.current > 1000 / (spawnRate * 8) &&
      particlesRef.current.length < maxParticles
    ) {
      particlesRef.current.push(createParticle());
      lastSpawnTimeRef.current = currentTime;
    }

    // Update particles in-place for better performance
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      updateParticle(particle);
      
      if (shouldRemoveParticle(particle)) {
        particles.splice(i, 1);
      }
    }

    // Render only if we have particles
    if (particles.length > 0) {
      render();
    }

    // Continue animation
    animationIdRef.current = requestAnimationFrame(animate);
  }, [createParticle, updateParticle, shouldRemoveParticle, render, spawnRate, maxParticles, initializeAmbientParticles]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
  }, [dimensions]);

  // Start animation and event listeners
  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      // Start animation loop
      animationIdRef.current = requestAnimationFrame(animate);
    }

    // Add event listeners
    window.addEventListener('resize', handleResize);
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      particlesRef.current = [];
      initializedRef.current = false;
    };
  }, [animate, handleResize, handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
};

export default ParticleEffect;