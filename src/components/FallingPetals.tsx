import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  emoji: string;
  opacity: number;
}

const PETAL_EMOJIS = ["🌸", "🌺", "💮", "🪻", "✿", "❀"];

const FallingPetals = ({ count = 12 }: { count?: number }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 10,
      size: 10 + Math.random() * 14,
      rotation: Math.random() * 360,
      emoji: PETAL_EMOJIS[Math.floor(Math.random() * PETAL_EMOJIS.length)],
      opacity: 0.15 + Math.random() * 0.2,
    }));
    setPetals(generated);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            fontSize: p.size,
            opacity: p.opacity,
          }}
          initial={{ y: -30, rotate: p.rotation }}
          animate={{
            y: ["0vh", "105vh"],
            x: [0, Math.sin(p.id) * 40, Math.cos(p.id) * -30, 0],
            rotate: [p.rotation, p.rotation + 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FallingPetals;
