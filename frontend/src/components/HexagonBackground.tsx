'use client';

import * as React from 'react';

interface HexagonBackgroundProps extends React.ComponentProps<'div'> {
    hexagonSize?: number;
    hexagonMargin?: number;
    children?: React.ReactNode;
    glowMode?: 'auto' | 'hover' | 'none'; // 'auto' = diagonal sweep animation, 'hover' = mouse triggered, 'none' = static
}

export default function HexagonBackground({
    className = '',
    children,
    hexagonSize = 30,
    hexagonMargin = 3,
    glowMode = 'none',
    ...props
}: HexagonBackgroundProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const hexagonWidth = hexagonSize;
    const hexagonHeight = hexagonSize * 1.1;
    const rowSpacing = hexagonSize * 0.75;
    const computedMarginTop = -hexagonSize * 0.25;
    const oddRowMarginLeft = -(hexagonSize / 2);
    const evenRowMarginLeft = hexagonMargin / 2;

    const [gridDimensions, setGridDimensions] = React.useState({
        rows: 0,
        columns: 0,
    });

    const updateGridDimensions = React.useCallback(() => {
        if (!containerRef.current) return;
        const { offsetHeight, offsetWidth } = containerRef.current;
        // Add extra rows and columns to ensure full coverage
        const rows = Math.ceil(offsetHeight / rowSpacing) + 4;
        const columns = Math.ceil(offsetWidth / hexagonWidth) + 4;
        setGridDimensions({ rows, columns });
    }, [rowSpacing, hexagonWidth]);

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            updateGridDimensions();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            updateGridDimensions();
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [updateGridDimensions]);

    // Unique ID for scoped styles
    const styleId = React.useId().replace(/:/g, '');

    const autoGlowStyles = `
    @keyframes diagonalGlow-${styleId} {
      0% {
        background-position: 200% 200%;
      }
      100% {
        background-position: -200% -200%;
      }
    }
    
    .hex-container-${styleId}::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        transparent 0%,
        transparent 40%,
        rgba(217, 119, 6, 0.15) 45%,
        rgba(217, 119, 6, 0.3) 50%,
        rgba(217, 119, 6, 0.15) 55%,
        transparent 60%,
        transparent 100%
      );
      background-size: 400% 400%;
      animation: diagonalGlow-${styleId} 8s ease-in-out infinite;
      pointer-events: none;
      z-index: 2;
    }
  `;

    const hoverGlowStyles = `
    .hex-${styleId}:hover {
      background-color: rgba(217, 119, 6, 0.7) !important;
      transition-duration: 0ms !important;
    }
    
    .hex-${styleId}:hover .hex-inner-${styleId} {
      background-color: rgba(180, 83, 9, 0.9) !important;
      transition-duration: 0ms !important;
    }
    
    .hex-${styleId} {
      transition: background-color 800ms ease-out;
    }
    
    .hex-inner-${styleId} {
      transition: background-color 800ms ease-out;
    }
  `;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden bg-transparent ${className}`}
            {...props}
        >
            <style>{`
        .hex-container-${styleId} {
          position: absolute;
          top: -${hexagonSize}px;
          left: -${hexagonSize}px;
          right: -${hexagonSize}px;
          bottom: -${hexagonSize}px;
          overflow: hidden;
          pointer-events: auto;
        }
        
        .hex-${styleId} {
          position: relative;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background-color: rgba(70, 70, 70, 0.35);
          cursor: pointer;
          pointer-events: auto;
        }
        
        .hex-inner-${styleId} {
          position: absolute;
          top: ${hexagonMargin}px;
          left: ${hexagonMargin}px;
          right: ${hexagonMargin}px;
          bottom: ${hexagonMargin}px;
          background-color: rgba(31, 35, 41, 0.92);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          pointer-events: none;
        }
        
        ${/* Force disable animations as per user request */ ''}
      `}</style>

            <div className={`hex-container-${styleId}`}>
                {Array.from({ length: gridDimensions.rows }).map((_, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        style={{
                            display: 'flex',
                            marginTop: rowIndex === 0 ? 0 : computedMarginTop,
                            marginLeft:
                                ((rowIndex + 1) % 2 === 0
                                    ? evenRowMarginLeft
                                    : oddRowMarginLeft) - hexagonSize,
                        }}
                    >
                        {Array.from({ length: gridDimensions.columns }).map(
                            (_, colIndex) => (
                                <div
                                    key={`hexagon-${rowIndex}-${colIndex}`}
                                    className={`hex-${styleId}`}
                                    style={{
                                        width: hexagonWidth,
                                        height: hexagonHeight,
                                        marginLeft: hexagonMargin,
                                        flexShrink: 0,
                                    }}
                                >
                                    <div className={`hex-inner-${styleId}`} />
                                </div>
                            ),
                        )}
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
}
