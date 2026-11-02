import styled from "styled-components";
import { useEffect, useRef, useState } from "react";

export const GravityStarsBackground = ({ className }) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const starsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const starCount = 80;
    starsRef.current = [];
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      star.style.left = x + '%';
      star.style.top = y + '%';
      star.style.animationDelay = Math.random() * 20 + 's';
      star.style.animationDuration = (Math.random() * 3 + 2) + 's';
      star.style.width = (Math.random() * 3 + 1.5) + 'px';
      star.style.height = star.style.width;
      container.appendChild(star);
      
      starsRef.current.push({
        element: star,
        x: parseFloat(x),
        y: parseFloat(y),
        vx: 0,
        vy: 0
      });
    }

    return () => {
      starsRef.current = [];
      container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width * 100;
      const y = (e.clientY - rect.top) / rect.height * 100;
      setMousePos({ x, y });

      // Aplicar atracción gravitacional a las estrellas
      starsRef.current.forEach((star) => {
        const dx = (x - star.x) / 100;
        const dy = (y - star.y) / 100;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Solo aplicar gravedad si está cerca (dentro de 30% del viewport)
        if (distance < 0.3) {
          const attraction = (0.3 - distance) / 0.3;
          star.vx += dx * attraction * 0.15;
          star.vy += dy * attraction * 0.15;
        }

        // Aplicar fricción para suavidad
        star.vx *= 0.95;
        star.vy *= 0.95;

        // Limitar velocidad máxima
        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        if (speed > 2) {
          star.vx = (star.vx / speed) * 2;
          star.vy = (star.vy / speed) * 2;
        }

        star.x += star.vx;
        star.y += star.vy;

        // Mantener dentro de los límites
        star.x = Math.max(0, Math.min(100, star.x));
        star.y = Math.max(0, Math.min(100, star.y));

        // Aplicar la nueva posición
        star.element.style.left = star.x + '%';
        star.element.style.top = star.y + '%';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <StarContainer ref={containerRef} className={`gravity-stars-container ${className}`} />;
};

const StarContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  top: 0;
  left: 0;

  .star {
    position: absolute;
    border-radius: 50%;
    opacity: 0.7;
    animation: float linear infinite, twinkle 3s infinite;
    pointer-events: none;
    transition: box-shadow 0.3s ease;
    
    /* Modo oscuro - estrellas blancas */
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 70%);
    box-shadow: 0 0 6px rgba(255,255,255,1), 0 0 12px rgba(255,255,255,0.6);
  }

  /* Modo claro - estrellas negras/oscuras */
  @media (prefers-color-scheme: light) {
    .star {
      background: radial-gradient(circle, rgba(50,50,80,1) 0%, rgba(100,100,120,0.8) 70%);
      box-shadow: 0 0 4px rgba(50,50,80,0.8), 0 0 8px rgba(50,50,80,0.4);
    }
  }

  @keyframes float {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0);
    }
    10% {
      opacity: 0.9;
    }
    90% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      transform: translateY(-110vh) translateX(100px);
    }
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`;
