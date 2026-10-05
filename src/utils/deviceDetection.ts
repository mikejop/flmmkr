/**
 * Device & Location Detection Utility
 * Extracts human-readable device names and geographic locations from HTTP requests
 */

export interface DeviceInfo {
  deviceName: string;
  ipAddress: string;
  location: string;
}

export function parseDeviceName(userAgent: string): string {
  if (!userAgent) return 'Dispositivo Desconhecido';

  const ua = userAgent.toLowerCase();

  // 1. Detect OS / Device Category
  let os = 'Dispositivo';
  if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = ua.includes('ipad') ? 'iPad' : 'Mac';
  } else if (ua.includes('iphone')) {
    os = 'iPhone';
  } else if (ua.includes('windows')) {
    os = 'Windows PC';
  } else if (ua.includes('android')) {
    os = ua.includes('mobile') ? 'Smartphone Android' : 'Tablet Android';
  } else if (ua.includes('linux')) {
    os = 'Linux PC';
  }

  // 2. Detect Browser
  let browser = 'Navegador';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('opr') || ua.includes('opera')) {
    browser = 'Opera';
  }

  return `${os} (${browser})`;
}

export function extractLocation(req: Request): string {
  // Check common geolocation headers provided by Vercel, Cloudflare, AWS CloudFront
  const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity');
  const region = req.headers.get('x-vercel-ip-country-region') || req.headers.get('cf-region');
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'BR';

  const parts: string[] = [];
  if (city) parts.push(decodeURIComponent(city));
  if (region && region !== city) parts.push(region);
  if (country) parts.push(country === 'BR' ? 'Brasil' : country);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return 'São Paulo, Brasil'; // Fallback geográfico padrão
}

export function extractIpAddress(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export function getDeviceInfoFromRequest(req: Request): DeviceInfo {
  const ua = req.headers.get('user-agent') || '';
  return {
    deviceName: parseDeviceName(ua),
    ipAddress: extractIpAddress(req),
    location: extractLocation(req),
  };
}
