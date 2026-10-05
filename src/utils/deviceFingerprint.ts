/**
 * Device / Hardware Digital Fingerprint (Impressão digital do computador - MAC Address)
 * 
 * Como o navegador web não expõe diretamente o endereço MAC da placa de rede por sandbox
 * de segurança do sistema operacional, geramos uma impressão digital de hardware determinística de alta entropia.
 * 
 * Combina sinais físicos do dispositivo:
 * - Cores de CPU (hardwareConcurrency)
 * - Memória RAM (deviceMemory)
 * - Renderizador e Vendor da GPU (WebGL unmasked renderer)
 * - Antialiasing subpixel de canvas 2D
 * - Resolução de tela, profundidade de cores e proporção de pixels
 * - Plataforma do sistema operacional e fuso horário
 */

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'mac_server_default';
  }

  // 1. Tentar recuperar fingerprint já gerado em cache local
  try {
    const cached = localStorage.getItem('flmmkr_device_mac_v3');
    if (cached && cached.startsWith('mac_') && cached.length >= 24) {
      return cached;
    }
  } catch {}

  const signals: string[] = [];

  // Sinais de CPU e Hardware
  signals.push(`cores:${navigator.hardwareConcurrency || 4}`);
  signals.push(`mem:${(navigator as any).deviceMemory || 8}`);

  // Sinais de Tela e Display
  if (window.screen) {
    signals.push(`screen:${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);
  }
  signals.push(`dpr:${window.devicePixelRatio || 1}`);

  // Plataforma e Fuso Horário
  signals.push(`platform:${navigator.platform || 'unknown'}`);
  try {
    signals.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  } catch {
    signals.push(`tz:${new Date().getTimezoneOffset()}`);
  }
  signals.push(`lang:${navigator.language || 'pt-BR'}`);

  // Hardware Gráfico (GPU Vendor e Chipset)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        signals.push(`gpu:${vendor}::${renderer}`);
      }
    }
  } catch {}

  // Canvas 2D Subpixel Rendering
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('flmmkr-device-id', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('flmmkr-device-id', 4, 17);
      signals.push(`canvas:${canvas.toDataURL().slice(-64)}`);
    }
  } catch {}

  // Gerar hash criptográfico determinístico
  const rawString = signals.join('|');
  let hashHex = '';

  try {
    const msgUint8 = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback caso crypto.subtle não esteja disponível
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < rawString.length; i++) {
      const ch = rawString.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    hashHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  }

  // Formato: mac_ + 32 caracteres hexadecimais únicos do computador
  const macAddress = `mac_${hashHex.substring(0, 32)}`;

  try {
    localStorage.setItem('flmmkr_device_mac_v3', macAddress);
  } catch {}

  return macAddress;
}
