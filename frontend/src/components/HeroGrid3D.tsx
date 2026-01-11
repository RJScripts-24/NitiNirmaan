import { useEffect, useRef } from 'react';

export default function HeroGrid3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mousePos.current;

      if (mouseX > -500) {
        // Create 3D bulge effect
        const radius = 150;
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, radius);

        // Gradient that creates depth illusion (saffron glow)
        gradient.addColorStop(0, 'rgba(217, 119, 6, 0.2)'); // Brighter saffron center
        gradient.addColorStop(0.2, 'rgba(217, 119, 6, 0.12)');
        gradient.addColorStop(0.5, 'rgba(23, 27, 33, 0.08)');
        gradient.addColorStop(0.8, 'rgba(23, 27, 33, 0.02)');
        gradient.addColorStop(1, 'transparent');

        // Draw bulge shadow/glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring (the "poking" structure)
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 60, 0, Math.PI * 2);
        ctx.stroke();

        // Middle ring
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Inner highlight (brightest)
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Central glow point
        const centerGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 15);
        centerGlow.addColorStop(0, 'rgba(217, 119, 6, 0.5)');
        centerGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
        centerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
