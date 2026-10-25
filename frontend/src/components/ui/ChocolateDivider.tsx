type ChocolateDividerProps = {
  from: string;
  to: string;
  variant?: "wave" | "drip";
  flip?: boolean;
  className?: string;
};

const WAVE_PATH =
  "M0,64 C120,104 240,20 360,44 C480,68 600,112 720,92 C840,72 960,16 1080,32 C1200,48 1320,104 1440,68 L1440,120 L0,120 Z";

const DRIP_PATH =
  "M0,32 C40,32 40,84 80,84 C120,84 120,32 160,32 C200,32 200,60 240,60 C280,60 280,32 320,32 C360,32 360,84 400,84 C440,84 440,32 480,32 C520,32 520,60 560,60 C600,60 600,32 640,32 C680,32 680,84 720,84 C760,84 760,32 800,32 C840,32 840,60 880,60 C920,60 920,32 960,32 C1000,32 1000,84 1040,84 C1080,84 1080,32 1120,32 C1160,32 1160,60 1200,60 C1240,60 1240,32 1280,32 C1320,32 1320,84 1360,84 C1400,84 1400,32 1440,32 L1440,120 L0,120 Z";

export function ChocolateDivider({
  from,
  to,
  variant = "wave",
  flip = false,
  className = "h-16 sm:h-24",
}: ChocolateDividerProps) {
  return (
    <div
      aria-hidden
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: from }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <path
          d={variant === "drip" ? DRIP_PATH : WAVE_PATH}
          fill={to}
          opacity="0.45"
          transform="translate(0 8)"
        />
        <path d={variant === "drip" ? DRIP_PATH : WAVE_PATH} fill={to} />
        {variant === "drip" ? (
          <g fill={to}>
            <circle cx="80" cy="88" r="5" />
            <circle cx="400" cy="88" r="4" />
            <circle cx="720" cy="88" r="6" />
            <circle cx="1040" cy="88" r="4" />
            <circle cx="1360" cy="88" r="5" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
