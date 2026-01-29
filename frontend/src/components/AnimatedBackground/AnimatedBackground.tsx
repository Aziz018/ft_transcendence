/**
 * ANIMATED BACKGROUND - Premium Gaming Aesthetic
 * Particle effect, grid, and aurora-like background
 */


import React, { useEffect, useRef } from "react";
interface AnimatedBackgroundProps {
  type?: "particles" | "grid" | "aurora" | "combined";
  intensity?: "light" | "medium" | "heavy";
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  type = "combined",
  intensity = "medium",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle configuration
    const particleCount =
      intensity === "light"
        ? 20
        : intensity === "medium"
          ? 50
          : 100;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }

    const particles: Particle[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color:
          Math.random() > 0.5
            ? "rgba(0, 240, 255"
            : "rgba(170, 0, 255",
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = "rgba(10, 14, 39, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (type === "particles" || type === "combined") {
        // Draw and update particles
        particles.forEach((particle) => {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Wrap around edges
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.y > canvas.height) particle.y = 0;
          if (particle.y < 0) particle.y = canvas.height;

          // Pulse opacity
          particle.opacity += (Math.random() - 0.5) * 0.02;
          particle.opacity = Math.max(0.1, Math.min(0.6, particle.opacity));

          // Draw particle
          ctx.fillStyle = `${particle.color}, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (type === "grid" || type === "combined") {
        // Draw animated grid
        const gridSize = 50;
        ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
        ctx.lineWidth = 1;

        const offsetX = (Date.now() * 0.01) % gridSize;
        const offsetY = (Date.now() * 0.005) % gridSize;

        for (let x = -gridSize + offsetX; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        for (let y = -gridSize + offsetY; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      if (type === "aurora" || type === "combined") {
        // Draw aurora effect
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const time = Date.now() * 0.0005;

        gradient.addColorStop(0, `rgba(0, 240, 255, ${Math.sin(time) * 0.05})`);
        gradient.addColorStop(0.5, `rgba(170, 0, 255, ${Math.sin(time + Math.PI / 2) * 0.05})`);
        gradient.addColorStop(1, `rgba(57, 255, 20, ${Math.sin(time + Math.PI) * 0.05})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [type, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      style={{ background: "linear-gradient(135deg, #0A0E27 0%, #12182F 100%)" }}
    />
  );
};

export default AnimatedBackground;
