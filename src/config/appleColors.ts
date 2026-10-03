/**
 * Apple Human Interface Guidelines - System Colors Specification
 * Reference: https://developer.apple.com/design/human-interface-guidelines/color
 * 
 * NOTE: Stored for system reference. DO NOT apply to components without explicit user permission.
 */

export interface AppleColorSpec {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  category: 'system' | 'gray';
}

export const APPLE_SYSTEM_COLORS = {
  // Light Mode Standard System Colors
  light: {
    red: { hex: '#FF3B30', rgb: { r: 255, g: 59, b: 48 }, name: 'System Red' },
    orange: { hex: '#FF9500', rgb: { r: 255, g: 149, b: 0 }, name: 'System Orange' },
    yellow: { hex: '#FFCC00', rgb: { r: 255, g: 204, b: 0 }, name: 'System Yellow' },
    green: { hex: '#34C759', rgb: { r: 52, g: 199, b: 89 }, name: 'System Green' },
    mint: { hex: '#00C7BE', rgb: { r: 0, g: 199, b: 190 }, name: 'System Mint' },
    teal: { hex: '#30B0C7', rgb: { r: 48, g: 176, b: 199 }, name: 'System Teal' },
    cyan: { hex: '#32ADE6', rgb: { r: 50, g: 173, b: 230 }, name: 'System Cyan' },
    blue: { hex: '#007AFF', rgb: { r: 0, g: 122, b: 255 }, name: 'System Blue' },
    indigo: { hex: '#5856D6', rgb: { r: 88, g: 86, b: 214 }, name: 'System Indigo' },
    purple: { hex: '#AF52DE', rgb: { r: 175, g: 82, b: 222 }, name: 'System Purple' },
    pink: { hex: '#FF2D55', rgb: { r: 255, g: 45, b: 85 }, name: 'System Pink' },
    brown: { hex: '#A2845E', rgb: { r: 162, g: 132, b: 94 }, name: 'System Brown' },
    
    // Grays
    gray: { hex: '#8E8E93', rgb: { r: 142, g: 142, b: 147 }, name: 'System Gray' },
    gray2: { hex: '#AEAEB2', rgb: { r: 174, g: 174, b: 178 }, name: 'System Gray 2' },
    gray3: { hex: '#C7C7CC', rgb: { r: 199, g: 199, b: 204 }, name: 'System Gray 3' },
    gray4: { hex: '#D1D1D6', rgb: { r: 209, g: 209, b: 214 }, name: 'System Gray 4' },
    gray5: { hex: '#E5E5EA', rgb: { r: 229, g: 229, b: 234 }, name: 'System Gray 5' },
    gray6: { hex: '#F2F2F7', rgb: { r: 242, g: 242, b: 247 }, name: 'System Gray 6' },
  },
  
  // Dark Mode Standard System Colors
  dark: {
    red: { hex: '#FF453A', rgb: { r: 255, g: 69, b: 58 }, name: 'System Red (Dark)' },
    orange: { hex: '#FF9F0A', rgb: { r: 255, g: 159, b: 10 }, name: 'System Orange (Dark)' },
    yellow: { hex: '#FFD60A', rgb: { r: 255, g: 214, b: 10 }, name: 'System Yellow (Dark)' },
    green: { hex: '#30D158', rgb: { r: 48, g: 209, b: 88 }, name: 'System Green (Dark)' },
    mint: { hex: '#63E6E2', rgb: { r: 99, g: 230, b: 226 }, name: 'System Mint (Dark)' },
    teal: { hex: '#40C8E0', rgb: { r: 64, g: 200, b: 224 }, name: 'System Teal (Dark)' },
    cyan: { hex: '#64D2FF', rgb: { r: 100, g: 210, b: 255 }, name: 'System Cyan (Dark)' },
    blue: { hex: '#0A84FF', rgb: { r: 10, g: 132, b: 255 }, name: 'System Blue (Dark)' },
    indigo: { hex: '#5E5CE6', rgb: { r: 94, g: 92, b: 230 }, name: 'System Indigo (Dark)' },
    purple: { hex: '#BF5AF2', rgb: { r: 191, g: 90, b: 242 }, name: 'System Purple (Dark)' },
    pink: { hex: '#FF375F', rgb: { r: 255, g: 55, b: 95 }, name: 'System Pink (Dark)' },
    brown: { hex: '#AC8E68', rgb: { r: 172, g: 142, b: 104 }, name: 'System Brown (Dark)' },
    
    // Grays
    gray: { hex: '#8E8E93', rgb: { r: 142, g: 142, b: 147 }, name: 'System Gray (Dark)' },
    gray2: { hex: '#636366', rgb: { r: 99, g: 99, b: 102 }, name: 'System Gray 2 (Dark)' },
    gray3: { hex: '#48484A', rgb: { r: 72, g: 72, b: 74 }, name: 'System Gray 3 (Dark)' },
    gray4: { hex: '#3A3A3C', rgb: { r: 58, g: 58, b: 60 }, name: 'System Gray 4 (Dark)' },
    gray5: { hex: '#2C2C2E', rgb: { r: 44, g: 44, b: 46 }, name: 'System Gray 5 (Dark)' },
    gray6: { hex: '#1C1C1E', rgb: { r: 28, g: 28, b: 30 }, name: 'System Gray 6 (Dark)' },
  }
} as const;
