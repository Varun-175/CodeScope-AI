import type { SVGProps } from 'react'

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  variant?: 'primary' | 'mono' | 'glowing'
}

export function Logo({ size = 36, variant = 'primary', ...props }: LogoProps) {
  // Select gradients/colors based on variant
  const stopColor1 = '#a78bfa' // light violet
  const stopColor2 = '#6366f1' // indigo
  const stopColor3 = '#06b6d4' // cyan

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-antigravity"
      {...props}
    >
      <defs>
        {/* Main Gradient */}
        <linearGradient id="antigravity-grad-1" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor={stopColor1} />
          <stop offset="50%" stopColor={stopColor2} />
          <stop offset="100%" stopColor={stopColor3} />
        </linearGradient>

        {/* Soft Accent Gradient */}
        <linearGradient id="antigravity-grad-2" x1="90%" y1="10%" x2="10%" y2="90%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Glassmorphic Panel Fill */}
        <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
        </linearGradient>

        {/* Outer Glow Filter */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Floating Shadow Filter */}
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      <style>{`
        @keyframes float-levitate {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
        }
        @keyframes orbit-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .logo-antigravity .floating-core {
          transform-origin: 60px 60px;
          animation: float-levitate 4s ease-in-out infinite;
        }
        .logo-antigravity .orbit-ring {
          transform-origin: 60px 60px;
          animation: orbit-rotate 25s linear infinite;
        }
        .logo-antigravity .orbit-ring-reverse {
          transform-origin: 60px 60px;
          animation: orbit-rotate 18s linear infinite reverse;
        }
      `}</style>

      {/* Orbit Ring 1 (Faded Outer Ring) */}
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="url(#antigravity-grad-1)"
        strokeWidth="1.5"
        strokeOpacity="0.25"
        strokeDasharray="4 8"
        className="orbit-ring"
      />

      {/* Orbit Ring 2 (Inner Ring with Nodes) */}
      <circle
        cx="60"
        cy="60"
        r="40"
        stroke="url(#antigravity-grad-2)"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="40 10 15 15"
        className="orbit-ring-reverse"
      />

      {/* Floating Node 1 */}
      <circle
        cx="60"
        cy="12"
        r="3"
        fill="url(#antigravity-grad-1)"
        className="orbit-ring"
        filter="url(#logo-glow)"
      />

      {/* Floating Node 2 */}
      <circle
        cx="20"
        cy="60"
        r="2"
        fill="url(#antigravity-grad-2)"
        className="orbit-ring-reverse"
      />

      {/* Main Levitating Core Logo */}
      <g className="floating-core" filter="url(#logo-shadow)">
        {/* Background Shield/Prism Shape */}
        <path
          d="M60 22L98 44V88L60 110L22 88V44L60 22Z"
          fill="url(#glass-grad)"
          stroke="url(#antigravity-grad-1)"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Central Intersecting Geometry forming a "C" and "S" plus code brackets */}
        {/* Left facet - representing '<' and 'C' */}
        <path
          d="M48 40 L34 60 L48 80"
          stroke="url(#antigravity-grad-1)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logo-glow)"
        />

        {/* Right facet - representing '>' and 'S' */}
        <path
          d="M72 40 L86 60 L72 80"
          stroke="url(#antigravity-grad-2)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Floating Diamond Core */}
        <polygon
          points="60,42 73,60 60,78 47,60"
          fill="url(#antigravity-grad-1)"
          opacity="0.85"
          filter="url(#logo-glow)"
        />
        
        {/* Diamond Inner Highlight */}
        <polygon
          points="60,48 68,60 60,72 52,60"
          fill="#ffffff"
          opacity="0.4"
        />
        
        {/* Connecting Code Slash / Core Structure */}
        <line
          x1="52"
          y1="76"
          x2="68"
          y2="44"
          stroke="url(#antigravity-grad-1)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  )
}
