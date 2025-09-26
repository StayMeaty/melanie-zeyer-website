import React, { useEffect, useRef, useState, useCallback } from 'react';
import { APP_CONFIG, Particle, MousePosition } from '../types';

interface ParticleEffectProps {
  logoPosition: { x: number; y: number };
  maxParticles?: number;
  spawnRate?: number;
  particleSpeed?: number;
  repulsionRadius?: number;
  repulsionForce?: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  logoPosition,
  maxParticles = 75,
  spawnRate = 0.8,
  particleSpeed = 0.25,
  repulsionRadius = 100,
  repulsionForce = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>();
  const mousePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const lastSpawnTimeRef = useRef<number>(0);
  const particleIdRef = useRef<number>(0);

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

  // Create a new particle
  const createParticle = useCallback((): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = particleSpeed + Math.random() * particleSpeed;
    const size = 2 + Math.random() * 6;
    const maxLife = 200 + Math.random() * 100;

    return {
      id: particleIdRef.current++,
      x: logoPosition.x,
      y: logoPosition.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      opacity: 1,
      life: 0,
      maxLife,
    };
  }, [logoPosition, particleSpeed]);

  // Update particle positions and properties
  const updateParticle = useCallback((particle: Particle): Particle => {
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

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Update life and opacity
    particle.life++;
    particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));

    return particle;
  }, [repulsionRadius, repulsionForce]);

  // Check if particle should be removed
  const shouldRemoveParticle = useCallback((particle: Particle): boolean => {
    return (
      particle.life >= particle.maxLife ||
      particle.x < -50 ||
      particle.x > dimensions.width + 50 ||
      particle.y < -50 ||
      particle.y > dimensions.height + 50
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
  }, [createParticle, updateParticle, shouldRemoveParticle, render, spawnRate, maxParticles]);

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