'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Simulador de profundidade de bits.
 *
 * A tela é 8 bits por canal, então não dá para "mostrar" 10-bit real. O que se simula é o efeito:
 * o degradê é quantizado em N bits e só depois esticado (a "correção de cor"), que é quando o
 * banding aparece no DaVinci. O lado de 10/12 bits sai com dithering para o monitor 8-bit não
 * criar faixas por conta própria.
 *
 * WebGL2 puro (sem biblioteca); se não houver WebGL2, a mesma conta roda em Canvas 2D.
 */

type Depth = 8 | 10 | 12;
const DEPTHS: Depth[] = [8, 10, 12];
const DEFAULTS = { bits: 10 as Depth, range: 0.05, contrast: 8 };

interface Params {
  bits: Depth;
  range: number; // fração da escala tonal ocupada pelo degradê (0.05–1)
  contrast: number; // esticamento aplicado depois da quantização (1–8)
}

interface Renderer {
  draw: (p: Params) => void;
  destroy: () => void;
}

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform float u_width;
uniform float u_bits;
uniform float u_lo;
uniform float u_hi;
uniform float u_contrast;
out vec4 o;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float t = gl_FragCoord.x / u_width;
  float levels = exp2(u_bits) - 1.0;
  float v = mix(u_lo, u_hi, clamp(t, 0.0, 1.0));
  float q = floor(v * levels + 0.5) / levels;        // quantização em N bits
  float g = clamp((q - 0.5) * u_contrast + 0.5, 0.0, 1.0); // "grade" depois de quantizar

  float d = 0.0;
  if (u_bits > 8.5) {                                   // dithering só para a saída 8-bit do monitor
    d = (hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy + vec2(37.0, 17.0)) - 1.0) / 255.0;
  }
  o = vec4(vec3(g + d), 1.0);
}`;

function createGlRenderer(canvas: HTMLCanvasElement, onLost: () => void): Renderer | null {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const loc = {
    width: u('u_width'), bits: u('u_bits'),
    lo: u('u_lo'), hi: u('u_hi'), contrast: u('u_contrast'),
  };

  const handleLost = (e: Event) => { e.preventDefault(); onLost(); };
  canvas.addEventListener('webglcontextlost', handleLost);

  return {
    draw: (p) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(loc.width, canvas.width);
      gl.uniform1f(loc.bits, p.bits);
      gl.uniform1f(loc.lo, 0.5 - p.range / 2);
      gl.uniform1f(loc.hi, 0.5 + p.range / 2);
      gl.uniform1f(loc.contrast, p.contrast);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy: () => {
      canvas.removeEventListener('webglcontextlost', handleLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

/** Mesma conta do shader, em JS (fallback sem WebGL2). */
function create2dRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return {
    draw: (p) => {
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;
      const lo = 0.5 - p.range / 2;
      const hi = 0.5 + p.range / 2;
      const levels = 2 ** p.bits - 1;
      const img = ctx.createImageData(w, h);
      const data = img.data;
      for (let x = 0; x < w; x++) {
        const v = lo + (hi - lo) * ((x + 0.5) / w);
        const q = Math.floor(v * levels + 0.5) / levels;
        const base = Math.min(1, Math.max(0, (q - 0.5) * p.contrast + 0.5)) * 255;
        for (let y = 0; y < h; y++) {
          const noise = p.bits > 8 ? Math.random() + Math.random() - 1 : 0;
          const val = Math.min(255, Math.max(0, Math.round(base + noise)));
          const i = (y * w + x) * 4;
          data[i] = data[i + 1] = data[i + 2] = val;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },
    destroy: () => {},
  };
}

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function BitDepthSimulator() {
  const [bits, setBits] = useState<Depth>(DEFAULTS.bits);
  const [range, setRange] = useState(DEFAULTS.range);
  const [contrast, setContrast] = useState(DEFAULTS.contrast);
  const [mode, setMode] = useState<'gl' | '2d'>('gl');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const visibleRef = useRef(true);
  const paramsRef = useRef<Params>({ bits, range, contrast });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer || !visibleRef.current) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    renderer.draw(paramsRef.current);
  }, []);

  // Cria o renderizador (WebGL2 ou Canvas 2D) e liga resize/visibilidade.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = mode === 'gl'
      ? createGlRenderer(canvas, () => setMode('2d'))
      : create2dRenderer(canvas);
    if (!renderer) {
      // sem WebGL2: troca para o Canvas 2D (fora do corpo síncrono do efeito)
      if (mode === 'gl') queueMicrotask(() => setMode('2d'));
      return;
    }
    rendererRef.current = renderer;

    const ro = new ResizeObserver(redraw);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) redraw();
    });
    io.observe(canvas);
    redraw();

    return () => {
      ro.disconnect();
      io.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [mode, redraw]);

  useEffect(() => {
    paramsRef.current = { bits, range, contrast };
    redraw();
  }, [bits, range, contrast, redraw]);

  const reset = () => { setBits(DEFAULTS.bits); setRange(DEFAULTS.range); setContrast(DEFAULTS.contrast); };

  return (
    <figure className="my-7 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
      <p className="pb-3 text-center font-sans text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl" aria-live="polite">{bits}-bit</p>

      <canvas
        key={mode}
        ref={canvasRef}
        role="img"
        aria-label={`Degradê quantizado em ${bits} bits, com ${fmt(2 ** bits)} níveis por canal. Escolha 8 bits e aumente o contraste para ver as faixas do banding aparecerem.`}
        className="block h-44 w-full rounded-md sm:h-64"
      />

      <p className="mt-3 text-center font-sans text-sm text-neutral-600">{fmt(2 ** bits)} níveis por canal</p>

      <div className="mt-5 grid gap-5 font-sans sm:grid-cols-3">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-neutral-900">Profundidade de bits</legend>
          <div className="flex gap-2">
            {DEPTHS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={bits === d}
                onClick={() => setBits(d)}
                className={`min-h-11 flex-1 rounded-full border text-sm font-semibold transition-colors duration-150 active:scale-[0.97] ${
                  bits === d
                    ? 'border-[#0071e3] bg-[#0071e3] text-white'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {d}-bit
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="bds-range" className="mb-2 flex justify-between text-sm font-semibold text-neutral-900">
            <span>Faixa do degradê</span>
            <span className="font-normal tabular-nums text-neutral-600">{Math.round(range * 100)}%</span>
          </label>
          <input
            id="bds-range"
            type="range"
            min={0.05}
            max={1}
            step={0.01}
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="h-11 w-full cursor-pointer accent-[#0071e3]"
          />
          <p className="text-xs text-neutral-600">Degradês estreitos (céu, parede) revelam mais banding.</p>
        </div>

        <div>
          <label htmlFor="bds-contrast" className="mb-2 flex justify-between text-sm font-semibold text-neutral-900">
            <span>Contraste (correção de cor)</span>
            <span className="font-normal tabular-nums text-neutral-600">{contrast.toFixed(1)}×</span>
          </label>
          <input
            id="bds-contrast"
            type="range"
            min={1}
            max={8}
            step={0.1}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="h-11 w-full cursor-pointer accent-[#0071e3]"
          />
          <p className="text-xs text-neutral-600">Estica a curva depois da gravação, como no DaVinci.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 font-sans text-xs text-neutral-600">
        <figcaption className="max-w-[70ch]">
          Simulação ao vivo: o degradê é quantizado em N bits e só depois esticado. Sua tela exibe 8 bits por canal,
          então 10 e 12 bits são mostrados com dithering para continuarem lisos.
        </figcaption>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 transition-colors duration-150 hover:bg-neutral-100 active:scale-[0.97]"
        >
          Resetar
        </button>
      </div>
    </figure>
  );
}
