import React from "react";
import FloatingLines from "./FloatingLines";

const OrbitalBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      {/* Light Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />

      {/* WebGL Floating Lines (ReactBits Implementation) */}
      <FloatingLines
        linesGradient={["#f87171", "#ef4444", "#dc2626"]} // Vibrant Red Gradient (Matching Form, No Dark/Black)
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={5}
        lineDistance={5}
        bendRadius={200}
        bendStrength={-0.5}
        interactive={true}
        parallax={true}
        parallaxStrength={0.1}
        mixBlendMode="normal" // Normal blending for transparent lines on white
      />

      {/* No Vignette - Pure Clean Light Background */}
    </div>
  );
};

export default OrbitalBackground;
