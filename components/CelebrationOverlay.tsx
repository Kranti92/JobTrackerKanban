'use client';

import { useEffect, useState } from 'react';

type Kind = 'offer' | 'rejected' | null;

interface Props {
  kind: Kind;
  onDone: () => void;
}

const OFFER_PARTICLES    = ['🎉','🏆','⭐','🌟','✨','🎊','💫','🥳','🎈','💥'];
const REJECTED_PARTICLES = ['💪','🔥','🙌','⚡','🚀','💡','🎯','🌈','👊','✊'];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  rot: number;
  drot: number;
}

export default function CelebrationOverlay({ kind, onDone }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {
    if (!kind) return;

    const src = kind === 'offer' ? OFFER_PARTICLES : REJECTED_PARTICLES;
    const count = 28;
    setParticles(Array.from({ length: count }, (_, i) => ({
      id:   i,
      emoji: src[i % src.length],
      x:    Math.random() * 100,
      y:    Math.random() * 40 + 20,
      dx:   (Math.random() - 0.5) * 4,
      dy:   -(Math.random() * 3 + 2),
      size: Math.random() * 24 + 20,
      rot:  Math.random() * 360,
      drot: (Math.random() - 0.5) * 20,
    })));
    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 2800);
    return () => clearTimeout(t);
  }, [kind, onDone]);

  if (!kind || particles.length === 0) return null;

  const isOffer = kind === 'offer';

  return (
    <div
      className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Message card */}
      <div className={`relative z-10 rounded-3xl px-10 py-8 text-center shadow-2xl border
        ${isOffer
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/50 shadow-emerald-500/40'
          : 'bg-gradient-to-br from-violet-600 to-indigo-700 border-violet-400/50 shadow-violet-500/40'
        }`}
        style={{ animation: visible ? 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' : undefined }}
      >
        <p className="text-5xl mb-3">{isOffer ? '🏆' : '💪'}</p>
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {isOffer ? 'Congratulations!' : 'Keep Going!'}
        </h2>
        <p className="text-sm text-white/80 font-medium">
          {isOffer
            ? "You got an offer! All the hard work paid off. 🎉"
            : "Rejection is redirection. Your next yes is coming. 🚀"}
        </p>
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none select-none"
          style={{
            left:      `${p.x}vw`,
            top:       `${p.y}vh`,
            fontSize:  `${p.size}px`,
            animation: visible
              ? `float-${p.id % 4} 2.8s ease-out forwards`
              : undefined,
            transform: `rotate(${p.rot}deg)`,
            opacity:   visible ? 1 : 0,
            transition: 'opacity 0.4s',
          }}
        >
          {p.emoji}
        </div>
      ))}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes float-0 { to { transform: translateY(-120px) translateX(40px)  rotate(120deg); opacity: 0; } }
        @keyframes float-1 { to { transform: translateY(-100px) translateX(-50px) rotate(-90deg); opacity: 0; } }
        @keyframes float-2 { to { transform: translateY(-140px) translateX(20px)  rotate(200deg); opacity: 0; } }
        @keyframes float-3 { to { transform: translateY(-80px)  translateX(-30px) rotate(-60deg); opacity: 0; } }
      `}</style>
    </div>
  );
}
