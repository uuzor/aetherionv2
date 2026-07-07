import { useEffect, useRef, useState } from 'react';

type CubeProps = {
  size?: number;
  className?: string;
  glow?: 'soft' | 'strong' | 'none';
  rotate?: boolean;
};

/**
 * Citrine Cube — the brand's signature 3D translucent lime cube.
 * Rendered as an isometric block with internal gradient highlights
 * and a soft outer glow. The only dimensional element in the system.
 */
export function CitrineCube({ size = 120, className = '', glow = 'soft', rotate = false }: CubeProps) {
  const glowClass = glow === 'strong' ? 'cube-glow-strong' : glow === 'soft' ? 'cube-glow' : '';
  const half = size / 2;
  const depth = size * 0.42;

  // Isometric projection points
  // Top face (rhombus)
  const topPoints = `${half},${0} ${size},${depth * 0.5} ${half},${depth} ${0},${depth * 0.5}`;
  // Left face
  const leftPoints = `${0},${depth * 0.5} ${half},${depth} ${half},${size} ${0},${size - depth * 0.5}`;
  // Right face
  const rightPoints = `${half},${depth} ${size},${depth * 0.5} ${size},${size - depth * 0.5} ${half},${size}`;

  return (
    <div
      className={`relative ${rotate ? 'animate-float-y' : ''} ${glowClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id={`topGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7ff9e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e5ff5d" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`leftGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e5ff5d" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a8c243" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`rightGrad-${size}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c9e84a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#8fa838" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {/* Left face */}
        <polygon points={leftPoints} fill={`url(#leftGrad-${size})`} stroke="#e5ff5d" strokeWidth="1" opacity="0.9" />
        {/* Right face */}
        <polygon points={rightPoints} fill={`url(#rightGrad-${size})`} stroke="#e5ff5d" strokeWidth="1" opacity="0.9" />
        {/* Top face — brightest */}
        <polygon points={topPoints} fill={`url(#topGrad-${size})`} stroke="#f7ff9e" strokeWidth="1" opacity="0.95" />
        {/* Inner highlight line on top face */}
        <line x1={half} y1={0} x2={half} y2={depth} stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </div>
  );
}

type NodeRingProps = {
  count?: number;
  radius?: number;
  nodeSize?: number;
  className?: string;
  icons?: React.ReactNode[];
  reverse?: boolean;
  duration?: number;
};

/**
 * Node Icon Ring — orbiting blockchain node circles around a center point.
 * Used in hero and constellation diagrams.
 */
export function NodeRing({
  count = 8,
  radius = 180,
  nodeSize = 40,
  className = '',
  icons = [],
  reverse = false,
  duration = 40,
}: NodeRingProps) {
  const animationName = reverse ? 'animate-orbit-reverse' : 'animate-orbit';
  const customStyle = duration !== 40 ? { animationDuration: `${duration}s` } : {};

  return (
    <div
      className={`absolute left-1/2 top-1/2 ${animationName} ${className}`}
      style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius, ...customStyle }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = radius + Math.cos(angle) * radius - nodeSize / 2;
        const y = radius + Math.sin(angle) * radius - nodeSize / 2;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: nodeSize,
              height: nodeSize,
              animation: reverse ? 'orbit-reverse 50s linear infinite' : 'orbit 40s linear infinite',
              animationDirection: reverse ? 'normal' : 'reverse',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full border border-graphite bg-carbon"
              style={{ width: nodeSize, height: nodeSize }}
            >
              {icons[i] ?? <span className="h-2 w-2 rounded-full bg-citrine" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Constellation Diagram — central cube with orbiting nodes connected by dashed lines.
 */
export function Constellation({ className = '' }: { className?: string }) {
  const [size, setSize] = useState(480);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        const w = ref.current.offsetWidth;
        setSize(Math.min(w, 520));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const center = size / 2;
  const radius = size * 0.38;
  const nodeCount = 12;

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`} style={{ width: '100%', height: size }}>
      <svg width={size} height={size} className="absolute inset-0" viewBox={`0 0 ${size} ${size}`}>
        {/* Dashed connector lines from center to each node */}
        {Array.from({ length: nodeCount }).map((_, i) => {
          const angle = (i / nodeCount) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#565656"
              strokeWidth="1"
              className="connector-dashed"
              opacity="0.6"
            />
          );
        })}
        {/* Outer ring */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#2b2b2b" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Orbiting nodes */}
      <div className="absolute inset-0 animate-orbit-slow" style={{ animationDuration: '80s' }}>
        {Array.from({ length: nodeCount }).map((_, i) => {
          const angle = (i / nodeCount) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius - 20;
          const y = center + Math.sin(angle) * radius - 20;
          return (
            <div
              key={i}
              className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-graphite bg-carbon"
              style={{ left: x, top: y }}
            >
              <span className="h-2 w-2 rounded-full bg-citrine" />
            </div>
          );
        })}
      </div>

      {/* Central cube */}
      <div className="relative z-10">
        <CitrineCube size={100} glow="strong" rotate />
      </div>
    </div>
  );
}
