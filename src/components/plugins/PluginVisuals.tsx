/** Ilustrações dos cards de plugin. Só CSS/SVG, sem imagem externa. */

const FALSE_COLOR_STOPS = ['#5b2a86', '#1f4fd1', '#3a7bd5', '#6b6b6b', '#2fbf5b', '#8f8f8f', '#f2b8c6', '#d6d6d6', '#f5d90a', '#ff7a00', '#e01e1e'];

function FalseColorVisual() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 p-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        {/* "Imagem" em false color: faixas de exposição com um rosto estilizado */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #e01e1e 0%, #f5d90a 14%, #8f8f8f 30%, #6b6b6b 52%, #3a7bd5 76%, #5b2a86 100%)' }} />
        <div className="absolute left-[38%] top-[22%] h-[56%] w-[24%] rounded-[45%]" style={{ background: 'radial-gradient(circle at 45% 40%, #f2b8c6 0 55%, #2fbf5b 56% 70%, #6b6b6b 71%)' }} />
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {FALSE_COLOR_STOPS.map((c) => (
          <span key={c} className="h-full flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-white/40">
        <span>0 IRE</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function SkinVisual() {
  const dots = [
    [0, 0], [4, -3], [-3, 2], [7, -5], [2, 4], [-6, -1], [10, -8], [5, 1], [-2, -5], [12, -6], [8, -2], [-4, 5],
  ];
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full p-6" aria-hidden="true">
      <circle cx="100" cy="100" r="80" fill="#111214" stroke="rgba(255,255,255,0.15)" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.08)" />
      <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.08)" />
      <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.08)" />
      {/* Skin line (~123°) */}
      <line x1="100" y1="100" x2="56" y2="33" stroke="#ffb37a" strokeWidth="1.5" strokeDasharray="3 3" />
      <g transform="translate(76 62)">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#ffc9a0" opacity={0.55 + (i % 4) * 0.1} />
        ))}
      </g>
      <text x="44" y="26" fill="#ffb37a" fontSize="9" fontFamily="ui-monospace, monospace">SKIN</text>
      <text x="128" y="170" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="ui-monospace, monospace">+2° ok</text>
    </svg>
  );
}

function SocialVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="relative aspect-[9/16] h-full max-h-[220px] overflow-hidden rounded-xl border border-white/20 bg-gradient-to-b from-[#2b2f3a] to-[#14161b]">
        <div className="absolute inset-x-0 top-0 h-[12%] bg-[#ff375f]/25 border-b border-dashed border-[#ff375f]/70" />
        <div className="absolute bottom-[18%] right-0 top-[40%] w-[16%] bg-[#ff375f]/25 border-l border-dashed border-[#ff375f]/70" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[#ff375f]/25 border-t border-dashed border-[#ff375f]/70" />
        <div className="absolute inset-x-[8%] bottom-[22%] top-[16%] right-[20%] rounded-md border border-[#30d158]/70" />
        <span className="absolute left-[10%] top-[18%] font-mono text-[9px] text-[#30d158]">SAFE</span>
      </div>
    </div>
  );
}

export const PLUGIN_VISUALS: Record<string, () => React.ReactElement> = {
  'false-color': FalseColorVisual,
  skin: SkinVisual,
  social: SocialVisual,
};
