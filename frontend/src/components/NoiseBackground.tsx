import { useEffect, useRef } from 'react';

interface NoiseBackgroundProps {
    opacity?: number;
    speed?: number;
}

export default function NoiseBackground({
    opacity = 0.05,
    speed = 50,
}: NoiseBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match window
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Generate noise
        const generateNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const buffer = new Uint32Array(imageData.data.buffer);

            for (let i = 0; i < buffer.length; i++) {
                // Generate random grayscale noise
                const value = Math.random() * 255;
                buffer[i] = (255 << 24) | (value << 16) | (value << 8) | value;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        // Animate noise
        let animationId: number;
        const animate = () => {
            generateNoise();
            animationId = setTimeout(() => {
                requestAnimationFrame(animate);
            }, speed);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            if (animationId) clearTimeout(animationId);
        };
    }, [speed]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity }}
        />
    );
}
