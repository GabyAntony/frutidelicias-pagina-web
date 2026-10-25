"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useId, type ReactNode } from "react";

type FruitKind = "strawberry" | "pineapple" | "chocolate" | "mint";

type Piece = {
  kind: FruitKind;
  className: string;
  depth: number;
  float: string;
  rotate: number;
};

const HERO_PIECES: Piece[] = [
  {
    kind: "strawberry",
    className: "right-[34%] top-[16%] w-10 lg:w-14",
    depth: 24,
    float: "animate-float",
    rotate: -14,
  },
  {
    kind: "pineapple",
    className: "right-[4%] top-[10%] w-14 sm:w-20 lg:w-24",
    depth: -30,
    float: "animate-float-slow",
    rotate: 16,
  },
  {
    kind: "chocolate",
    className: "right-[38%] bottom-[12%] w-10 lg:w-14",
    depth: 18,
    float: "animate-float-delayed",
    rotate: 12,
  },
  {
    kind: "mint",
    className: "right-[8%] bottom-[26%] w-10 sm:w-14 lg:w-16",
    depth: -20,
    float: "animate-float",
    rotate: -8,
  },
  {
    kind: "strawberry",
    className: "right-[20%] top-[42%] w-8 sm:w-10 lg:w-12 opacity-80",
    depth: 34,
    float: "animate-float-slow",
    rotate: 24,
  },
  {
    kind: "pineapple",
    className: "right-[30%] top-[3%] w-8 sm:w-10 lg:w-12 opacity-70",
    depth: -16,
    float: "animate-float-delayed",
    rotate: -18,
  },
];

const SOFT_PIECES: Piece[] = [
  {
    kind: "strawberry",
    className: "left-[4%] top-[18%] w-10 sm:w-14 opacity-70",
    depth: 18,
    float: "animate-float",
    rotate: -12,
  },
  {
    kind: "pineapple",
    className: "right-[5%] top-[14%] w-12 sm:w-16 opacity-60",
    depth: -22,
    float: "animate-float-slow",
    rotate: 14,
  },
  {
    kind: "chocolate",
    className: "right-[14%] bottom-[12%] w-10 sm:w-12 opacity-60",
    depth: 20,
    float: "animate-float-delayed",
    rotate: -10,
  },
];

export function FloatingFruitLayer({
  className = "",
  variant = "hero",
}: {
  className?: string;
  variant?: "hero" | "soft";
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 46, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 46, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;

    function onPointerMove(event: PointerEvent) {
      mx.set((event.clientX / window.innerWidth - 0.5) * 2);
      my.set((event.clientY / window.innerHeight - 0.5) * 2);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [mx, my, reduce]);

  const pieces = variant === "hero" ? HERO_PIECES : SOFT_PIECES;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {pieces.map((piece, index) => (
        <ParallaxPiece
          key={`${piece.kind}-${index}`}
          piece={piece}
          sx={sx}
          sy={sy}
        >
          <FruitShape kind={piece.kind} />
        </ParallaxPiece>
      ))}
    </div>
  );
}

function ParallaxPiece({
  piece,
  sx,
  sy,
  children,
}: {
  piece: Piece;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  children: ReactNode;
}) {
  const x = useTransform(sx, [-1, 1], [-piece.depth, piece.depth]);
  const y = useTransform(sy, [-1, 1], [-piece.depth * 0.7, piece.depth * 0.7]);

  return (
    <motion.div
      style={{ x, y }}
      className={`absolute drop-shadow-[0_18px_22px_rgba(38,12,4,0.28)] ${piece.className}`}
    >
      <div className={piece.float}>
        <div style={{ rotate: `${piece.rotate}deg` }}>{children}</div>
      </div>
    </motion.div>
  );
}

function FruitShape({ kind }: { kind: FruitKind }) {
  if (kind === "strawberry") return <Strawberry />;
  if (kind === "pineapple") return <Pineapple />;
  if (kind === "chocolate") return <ChocolateShard />;
  return <MintLeaf />;
}

function Strawberry() {
  const uid = useId().replace(/:/g, "");
  const bodyId = `${uid}-strawberry-body`;
  const leafId = `${uid}-strawberry-leaf`;

  return (
    <svg viewBox="0 0 64 64" className="h-auto w-full" role="presentation">
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b7a" />
          <stop offset="55%" stopColor="#e3354b" />
          <stop offset="100%" stopColor="#aa152b" />
        </linearGradient>
        <linearGradient id={leafId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fe07d" />
          <stop offset="100%" stopColor="#2f7a35" />
        </linearGradient>
      </defs>
      <path
        d="M32 16c10-10 23-3 23 8 0 13-11 28-23 34C20 52 9 37 9 24c0-11 13-18 23-8Z"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M32 15c-4-6-10-8-16-6 3 5 8 8 16 6Zm0 0c4-6 10-8 16-6-3 5-8 8-16 6Z"
        fill={`url(#${leafId})`}
      />
      <path
        d="M23 14c3-3 6-4 9-5 3 1 6 2 9 5-3 2-6 3-9 3s-6-1-9-3Z"
        fill="#3d8d3f"
      />
      {[
        [23, 30],
        [33, 27],
        [40, 33],
        [27, 40],
        [36, 42],
        [31, 49],
      ].map(([cx, cy]) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx="1.4"
          ry="2.2"
          fill="#ffe9b5"
          opacity="0.85"
        />
      ))}
      <path
        d="M19 26c2-5 7-8 12-9"
        stroke="#ffb3bd"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function Pineapple() {
  const uid = useId().replace(/:/g, "");
  const bodyId = `${uid}-pineapple-body`;
  const leafId = `${uid}-pineapple-leaf`;

  return (
    <svg viewBox="0 0 64 64" className="h-auto w-full" role="presentation">
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe680" />
          <stop offset="55%" stopColor="#f2c94c" />
          <stop offset="100%" stopColor="#d99b1c" />
        </linearGradient>
        <linearGradient id={leafId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="100%" stopColor="#a5e06d" />
        </linearGradient>
      </defs>
      <path
        d="M32 22c-2-8-9-14-16-16 1 8 5 14 12 18-8-2-14 0-18 4 6 4 14 4 20 0-2 8 0 15 4 20 4-5 6-12 4-20 6 4 14 4 20 0-4-4-10-6-18-4 7-4 11-10 12-18-7 2-14 8-16 16Z"
        fill={`url(#${leafId})`}
      />
      <ellipse cx="32" cy="40" rx="16" ry="19" fill={`url(#${bodyId})`} />
      <path
        d="M22 32 42 52M20 40l14 14M26 29l14 14M20 48l8 8M34 29l8 8M24 31l-4 4M44 41l4 4"
        stroke="#b87912"
        strokeWidth="1.1"
        opacity="0.55"
      />
      <path
        d="M22 31c3-4 8-6 13-6"
        stroke="#fff2b8"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

function ChocolateShard() {
  const uid = useId().replace(/:/g, "");
  const bodyId = `${uid}-chocolate-body`;

  return (
    <svg viewBox="0 0 64 64" className="h-auto w-full" role="presentation">
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5532" />
          <stop offset="40%" stopColor="#5b2c13" />
          <stop offset="100%" stopColor="#2f1409" />
        </linearGradient>
      </defs>
      <path
        d="M12 20 40 8l16 14-6 30-30 4-8-18Z"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M18 20 38 13l10 8-14 8-16-9Z"
        fill="#a76b40"
        opacity="0.65"
      />
      <path
        d="M22 33 43 27l-2 16-17 5Z"
        fill="#3b1b0c"
        opacity="0.45"
      />
      <path
        d="M16 18 36 11"
        stroke="#c88a5b"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function MintLeaf() {
  const uid = useId().replace(/:/g, "");
  const bodyId = `${uid}-mint-body`;

  return (
    <svg viewBox="0 0 64 64" className="h-auto w-full" role="presentation">
      <defs>
        <linearGradient id={bodyId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f6b3a" />
          <stop offset="55%" stopColor="#58b368" />
          <stop offset="100%" stopColor="#b7ec9a" />
        </linearGradient>
      </defs>
      <path
        d="M14 50C10 32 20 14 50 8c2 26-10 42-36 42Z"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M16 48C24 34 35 21 48 12"
        stroke="#d6f7c2"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M27 36c-4-2-7-2-10-1M32 29c1-4 1-7 0-10M38 24c4-1 7-1 10 0"
        stroke="#d6f7c2"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
