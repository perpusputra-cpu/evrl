import React from 'react';
import { BottleSpec, MaterialItem } from '../../types';

interface BottleSvgProps {
  bottle: BottleSpec;
  materials: MaterialItem[];
  stickActive: boolean;
  stickCycles: number;
  compactionFactor: number; // 0 - 100%
  isOpen?: boolean;
}

export const BottleSvg: React.FC<BottleSvgProps> = ({
  bottle,
  materials,
  stickActive,
  stickCycles,
  compactionFactor,
  isOpen = true,
}) => {
  const totalMass = materials.reduce((acc, m) => acc + m.mass, 0);
  const nominalVolume = bottle.nominalVolume || 600;
  const currentDensity = totalMass / nominalVolume;

  // Visual height filled percentage (capped at 95% for bottle neck space)
  const fillPercentage = Math.min(95, (totalMass / (nominalVolume * 0.42)) * 88);

  // SVG coordinate system: ViewBox 0 0 280 440
  // Bottle coordinates:
  // Cap/Mouth: x: 120-160, y: 35-55
  // Neck: x: 124-156, y: 55-80
  // Shoulder: expanding from y 80 to y 120 (x: 90 to 190)
  // Body: y: 120 to 360 (width: 100, x: 90 to 190)
  // Base / Feet: y: 360 to 395

  const bodyHeight = 240;
  const fillHeightPixels = (fillPercentage / 100) * bodyHeight;
  const fillStartY = 370 - fillHeightPixels;

  // Generate layered colors based on materials
  const materialSlices = React.useMemo(() => {
    if (materials.length === 0 || totalMass === 0) return [];
    let currentY = 370;
    return materials.map((mat) => {
      const sliceFraction = mat.mass / totalMass;
      const sliceHeight = sliceFraction * fillHeightPixels;
      const y = currentY - sliceHeight;
      currentY = y;

      let fillColor = '#cbd5e1'; // LDPE slate
      let strokeColor = '#94a3b8';
      let texturePattern = 'ldpe-pattern';

      if (mat.category === 'BOPP') {
        fillColor = '#f59e0b'; // Amber BOPP
        strokeColor = '#d97706';
        texturePattern = 'bopp-pattern';
      } else if (mat.category === 'HDPE') {
        fillColor = '#10b981'; // Emerald
        strokeColor = '#059669';
      } else if (mat.category === 'PP') {
        fillColor = '#0ea5e9'; // Sky blue
        strokeColor = '#0284c7';
      } else if (mat.category === 'MIXED') {
        fillColor = '#ea580c'; // Orange-brown
        strokeColor = '#c2410c';
      }

      return {
        id: mat.id,
        name: mat.name,
        category: mat.category,
        y,
        height: sliceHeight,
        fillColor,
        strokeColor,
        texturePattern,
        mass: mat.mass,
      };
    });
  }, [materials, totalMass, fillHeightPixels]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none">
      <svg
        viewBox="0 0 280 430"
        className="w-full h-auto drop-shadow-md overflow-visible"
        aria-label="Visualisasi 2D Botol Ecobrick"
      >
        <defs>
          {/* Subtle PET glass gradient */}
          <linearGradient id="petGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="20%" stopColor="#f8fafc" stopOpacity="0.15" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>

          {/* Bamboo stick gradient */}
          <linearGradient id="stickGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* BOPP Metallic pattern */}
          <pattern id="bopp-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 8 L8 0 M0 0 L8 8" stroke="#b45309" strokeWidth="0.75" opacity="0.4" />
          </pattern>

          {/* Clip path to constrain plastic filling to bottle interior */}
          <clipPath id="bottleInsideClip">
            <path d="M 125 55 L 155 55 L 155 80 C 155 95 188 108 188 130 L 188 360 C 188 375 175 385 140 385 C 105 385 92 375 92 360 L 92 130 C 92 108 125 95 125 80 Z" />
          </clipPath>
        </defs>

        {/* Ruler / Scale Markings on the Left */}
        <g className="text-[9px] font-mono fill-stone-400">
          <line x1="68" y1="80" x2="68" y2="380" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
          {[
            { cm: 22, y: 95 },
            { cm: 18, y: 145 },
            { cm: 14, y: 195 },
            { cm: 10, y: 245 },
            { cm: 6, y: 295 },
            { cm: 2, y: 345 },
            { cm: 0, y: 375 },
          ].map((mark) => (
            <g key={mark.cm}>
              <line x1="62" y1={mark.y} x2="72" y2={mark.y} stroke="#94a3b8" strokeWidth="1.2" />
              <text x="56" y={mark.y + 3} textAnchor="end">
                {mark.cm}
              </text>
            </g>
          ))}
          <text x="45" y="70" textAnchor="end" className="font-semibold fill-stone-500 text-[10px]">
            cm
          </text>
        </g>

        {/* Plastic Filling (Inside Bottle Clip) */}
        <g clipPath="url(#bottleInsideClip)">
          {/* Base Empty Background */}
          <rect x="85" y="50" width="110" height="340" fill="#f1f5f9" opacity="0.6" />

          {/* Filled Plastic Layers */}
          {materialSlices.map((slice) => (
            <g key={slice.id}>
              <rect
                x="88"
                y={slice.y}
                width="104"
                height={slice.height}
                fill={slice.fillColor}
                opacity={0.88}
              />
              {/* Pattern Overlay for Texture */}
              <rect
                x="88"
                y={slice.y}
                width="104"
                height={slice.height}
                fill="url(#bopp-pattern)"
                opacity={slice.category === 'BOPP' ? 0.6 : 0.2}
              />
              {/* Layer separator line */}
              <line
                x1="90"
                y1={slice.y}
                x2="190"
                y2={slice.y}
                stroke={slice.strokeColor}
                strokeWidth="1"
                strokeDasharray="3 2"
                opacity={0.7}
              />
            </g>
          ))}

          {/* Compression Wave / Compacted Crumples Visual Effect */}
          {stickCycles > 0 && fillHeightPixels > 10 && (
            <g opacity={Math.min(0.8, stickCycles * 0.04)}>
              {Array.from({ length: Math.min(8, Math.floor(stickCycles / 5)) }).map((_, i) => (
                <circle
                  key={i}
                  cx={105 + (i * 12) % 70}
                  cy={360 - (i * 28) % fillHeightPixels}
                  r={3 + (i % 3)}
                  fill="#000000"
                  opacity={0.15}
                />
              ))}
            </g>
          )}
        </g>

        {/* Outer PET Bottle Silhouette */}
        <path
          d="M 125 55 L 155 55 L 155 80 C 155 95 188 108 188 130 L 188 360 C 188 375 175 385 140 385 C 105 385 92 375 92 360 L 92 130 C 92 108 125 95 125 80 Z"
          fill="url(#petGlassGrad)"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* PET Bottle Ribs & Contours */}
        <g stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.75" fill="none">
          {/* Waist Rib 1 */}
          <path d="M 92 180 Q 140 188 188 180" />
          {/* Waist Rib 2 */}
          <path d="M 92 250 Q 140 258 188 250" />
          {/* Waist Rib 3 */}
          <path d="M 92 320 Q 140 328 188 320" />
          {/* Base indentation */}
          <path d="M 115 382 Q 140 374 165 382" />
        </g>

        {/* Bottle Cap or Open Ring */}
        {isOpen ? (
          <g>
            <rect x="122" y="47" width="36" height="8" rx="2" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
            <ellipse cx="140" cy="47" rx="16" ry="4" fill="#0284c7" />
          </g>
        ) : (
          <g>
            <rect x="122" y="38" width="36" height="17" rx="3" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
            <line x1="126" y1="44" x2="154" y2="44" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
            <line x1="126" y1="49" x2="154" y2="49" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          </g>
        )}

        {/* Compactor Stick (Wooden/Bamboo Tamper) with Motion */}
        {stickActive && (
          <g
            className="transition-transform duration-200 ease-out"
            style={{
              transform: `translateY(${Math.min(130, Math.max(10, fillStartY - 100))}px)`,
            }}
          >
            {/* Stick handle */}
            <rect x="135" y="-90" width="10" height="230" rx="3" fill="url(#stickGrad)" stroke="#78350f" strokeWidth="1.5" />
            {/* Stick packing head */}
            <rect x="128" y="135" width="24" height="10" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Motion pressure lines */}
            <path d="M 120 148 L 126 155 M 160 148 L 154 155" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Digital Tag overlay at bottle base */}
        <g transform="translate(90, 398)">
          <rect x="0" y="0" width="100" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="50" y="14" textAnchor="middle" fill="#38bdf8" className="text-[10px] font-mono font-bold">
            {bottle.nominalVolume} ml | {totalMass.toFixed(1)} g
          </text>
        </g>
      </svg>

      {/* Real-time packing density indicator floating badge */}
      <div className="absolute top-2 right-0 bg-stone-900/90 backdrop-blur-xs border border-stone-700 px-2.5 py-1 rounded text-right shadow-sm">
        <div className="text-[10px] font-mono text-stone-400">Densitas Realtime</div>
        <div className="text-sm font-mono font-bold text-emerald-400">
          {currentDensity.toFixed(4)} <span className="text-[10px] text-stone-300 font-normal">g/cm³</span>
        </div>
      </div>
    </div>
  );
};
