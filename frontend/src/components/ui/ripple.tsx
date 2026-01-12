import React, { MouseEvent, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "./utils";

interface RippleProps {
    className?: string;
    bounce?: number;
    color?: string;
}

export const Ripple = React.memo(({ className, bounce = 0, color = "rgba(255, 255, 255, 0.35)" }: RippleProps) => {
    const [ripples, setRipples] = useState<
        { x: number; y: number; size: number; key: number }[]
    >([]);

    useLayoutEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (ripples.length > 0) {
            timeoutId = setTimeout(() => {
                setRipples([]);
            }, 1000); // Clear after animation
        }
        return () => clearTimeout(timeoutId);
    }, [ripples]);

    const addRipple = (event: MouseEvent<HTMLDivElement>) => {
        const container = event.currentTarget.getBoundingClientRect();
        const size = Math.max(container.width, container.height);
        const x = event.clientX - container.left - size / 2;
        const y = event.clientY - container.top - size / 2;

        setRipples((prev) => [
            ...prev,
            { x, y, size, key: Date.now() },
        ]);
    };

    return (
        <div
            className={cn("absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]", className)}
            onMouseDown={addRipple}
        >
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.key}
                        initial={{ transform: "scale(0)", opacity: 0.5 }}
                        animate={{ transform: "scale(2.5)", opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", bounce }}
                        style={{
                            position: "absolute",
                            top: ripple.y,
                            left: ripple.x,
                            width: ripple.size,
                            height: ripple.size,
                            backgroundColor: color,
                            borderRadius: "50%",
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
});

Ripple.displayName = "Ripple";
