import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Shader definition with WHITE grid lines
const GridWarpMaterial = shaderMaterial(
    {
        uTime: 0,
        uMouse: new THREE.Vector2(-10, -10),
        uResolution: new THREE.Vector2(1, 1),
        uColor: new THREE.Color('#FFFFFF'), // White grid lines
        uBaseColor: new THREE.Color('#0F1216'), // Dark background (transparent blend)
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform vec3 uBaseColor;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Aspect ratio correction for square grid
      float aspect = uResolution.x / uResolution.y;
      vec2 gridUv = uv;
      gridUv.x *= aspect;
      
      vec2 mouse = uMouse;
      mouse.x *= aspect;

      // Distortion logic - simplified radial displacement
      float dist = distance(gridUv, mouse);
      float radius = 0.4;
      float strength = 0.15;
      
      // Simple smooth falloff
      float falloff = smoothstep(radius, 0.0, dist);
      
      // Simple offset - push UVs away from mouse position
      vec2 offset = (gridUv - mouse) * falloff * strength;
      vec2 distortedUv = gridUv + offset;
      
      // Grid generation - larger boxes (was 12.5, now 8.0)
      float gridSize = 8.0;
      
      // Use distorted UVs for the grid pattern
      vec2 cell = fract(distortedUv * gridSize);
      
      // Grid lines thickness
      float lineWidth = 0.04;
      float gridLine = step(1.0 - lineWidth, cell.x) + step(1.0 - lineWidth, cell.y);
      gridLine = min(gridLine, 1.0);
      
      // Constant opacity for grid lines (no glow, no brightness change)
      float gridOpacity = 0.2;
      
      // Output with transparency for overlay effect
      float alpha = gridLine * gridOpacity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

extend({ GridWarpMaterial });

// Add types for the custom shader material and R3F elements
declare global {
    namespace JSX {
        interface IntrinsicElements {
            gridWarpMaterial: any;
            planeGeometry: any;
            mesh: any;
        }
    }
}

// Props interface for passing mouse position from parent
interface GridSceneProps {
    mousePosition: { x: number; y: number };
}

function GridScene({ mousePosition }: GridSceneProps) {
    const materialRef = useRef<any>(null);
    const { viewport, size } = useThree();

    // Smooth mouse tracking
    const currentMouse = useRef(new THREE.Vector2(-10, -10));

    useFrame(() => {
        if (materialRef.current) {
            // Target position from props
            const targetX = mousePosition.x;
            const targetY = mousePosition.y;

            // Smoothly interpolate
            currentMouse.current.x += (targetX - currentMouse.current.x) * 0.1;
            currentMouse.current.y += (targetY - currentMouse.current.y) * 0.1;

            materialRef.current.uMouse = currentMouse.current;
            materialRef.current.uResolution = new THREE.Vector2(size.width, size.height);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[viewport.width, viewport.height]} />
            {/* @ts-ignore */}
            <gridWarpMaterial ref={materialRef} transparent depthWrite={false} />
        </mesh>
    );
}

export default function HeroGridWarp() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: -10, y: -10 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Normalize to 0-1 UV space (y inverted for WebGL)
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;

        setMousePosition({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMousePosition({ x: -10, y: -10 });
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Get the parent section element to track mouse across entire hero
        const section = container.closest('section');
        const target = section || container;

        target.addEventListener('mousemove', handleMouseMove as EventListener);
        target.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            target.removeEventListener('mousemove', handleMouseMove as EventListener);
            target.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" style={{ height: '710.5px' }}>
            <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 5], fov: 75 }}
            >
                <GridScene mousePosition={mousePosition} />
            </Canvas>
        </div>
    );
}
