import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function BackgroundAnimation() {
    // Native motion values (does not trigger React re-renders)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics around the exact mouse coordinates
    const springConfig = { damping: 25, stiffness: 40, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background">
            {/* Ambient glowing orbs - purely position based, no scroll transforms to prevent flickering/repaints */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[100px] opacity-70 will-change-transform"
            />
            <motion.div
                animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 80, -120, 0],
                    scale: [1, 0.9, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-1/4 -right-1/4 w-[45vw] h-[45vw] rounded-full bg-secondary/30 blur-[100px] opacity-70 will-change-transform"
            />
            <motion.div
                animate={{
                    x: [0, 80, -20, 0],
                    y: [0, 50, -80, 0],
                    scale: [1, 1.3, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[80px] opacity-60 will-change-transform"
            />

            {/* Mouse follower directly wired to smooth motion values */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 -ml-48 -mt-48 rounded-full bg-primary/20 blur-[80px] will-change-transform"
                style={{
                    x: smoothX,
                    y: smoothY,
                }}
            />

            {/* Texture overlay (grain) for a modern feel */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>
    );
}
