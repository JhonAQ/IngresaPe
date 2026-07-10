/**
 * Convierte un color hex a HSL.
 * Devuelve [h, s, l] con h en grados [0,360] y s,l en [0,100].
 */
function hexToHsl(hex: string): [number, number, number] {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convierte HSL a hex.
 */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Ajusta la luminosidad de un color hex en el espacio HSL.
 */
export function adjustLightness(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, Math.min(100, l + delta)));
}

/**
 * Ajusta la saturación de un color hex en el espacio HSL.
 */
export function adjustSaturation(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, Math.max(0, Math.min(100, s + delta)), l);
}

/**
 * Aclara un color hex ajustando solo la luminosidad en el espacio HSL,
 * manteniendo el matiz y la saturación originales.
 */
export function lightenHex(hex: string, lightnessDelta: number): string {
  return adjustLightness(hex, lightnessDelta);
}

/**
 * Oscurece un color hex ajustando solo la luminosidad en el espacio HSL,
 * manteniendo el matiz y la saturación originales.
 */
export function darkenHex(hex: string, lightnessDelta: number): string {
  return adjustLightness(hex, -lightnessDelta);
}

/**
 * Deriva los tres colores de la base "completed" a partir del color de la cara.
 *
 * Los SVGs originales usan:
 * - base (sombra): #A568CC  (HSL 278, 52%, 60%)
 * - highlight (cara): #CE82FF (HSL 278, 100%, 74%)
 * - shine (reflejo): #DAA0FF (HSL 278, 100%, 75%)
 *
 * Para conservar esa proporción se reduce la saturación a ~52% y la
 * luminosidad en 14 puntos para la sombra, y se sube ligeramente la
 * luminosidad para el reflejo.
 */
export function deriveNodeColors(highlightColor: string): {
  baseColor: string;
  highlightColor: string;
  shineColor: string;
} {
  const [h, s, l] = hexToHsl(highlightColor);

  const baseColor = hslToHex(h, Math.round(s * 0.52), Math.max(0, l - 14));
  const shineColor = hslToHex(h, Math.min(100, Math.round(s * 1.05)), Math.min(100, l + 6));

  return {
    baseColor,
    highlightColor,
    shineColor,
  };
}
