// Application constants
export const CANVAS_SIZE = 384; // Main canvas dimensions (pixels)
export const CANVAS_CENTER = CANVAS_SIZE / 2; // Center point of the canvas

// Superformula calculation
export function superformulaR(theta, {m, n1, n2, n3, a, b}) {
    const t1 = Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2);
    const t2 = Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3);
    const denom = t1 + t2;
    return Math.pow(Math.max(denom, 1e-12), -1 / n1);
}

// Knot pattern calculation (rosette/knot formula)
// Returns {r, theta} for a given t parameter [0, 1]
export function knotPattern(t, {lobes, turns, amplitude, baseRadius = 1.0}) {
    const r = baseRadius + amplitude * Math.cos(2 * lobes * Math.PI * t);
    const theta = 2 * turns * Math.PI * t;
    return {r, theta};
}

// Helper function to lighten a color
export function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Helper function to darken a color
export function darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Convert hex color to rgba
export function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Convert hex to RGB [0-1]
function hexToRgb(hex) {
    const num = parseInt(hex.replace("#", ""), 16);
    return [
        (num >> 16) / 255,
        ((num >> 8) & 0xFF) / 255,
        (num & 0xFF) / 255
    ];
}

// Convert RGB [0-1] to hex
function rgbToHex(r, g, b) {
    const R = Math.round(Math.max(0, Math.min(1, r)) * 255);
    const G = Math.round(Math.max(0, Math.min(1, g)) * 255);
    const B = Math.round(Math.max(0, Math.min(1, b)) * 255);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// sRGB to linear RGB
function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear RGB to sRGB
function linearToSrgb(c) {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Linear RGB to XYZ
function linearRgbToXyz(r, g, b) {
    return [
        0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
        0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
        0.0193339 * r + 0.1191920 * g + 0.9503041 * b
    ];
}

// XYZ to linear RGB
function xyzToLinearRgb(x, y, z) {
    return [
        3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
        -0.9692660 * x + 1.8760108 * y + 0.0415560 * z,
        0.0556434 * x - 0.2040259 * y + 1.0572252 * z
    ];
}

// XYZ to Oklab
function xyzToOklab(x, y, z) {
    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    return [
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    ];
}

// Oklab to XYZ
function oklabToXyz(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    return [
        1.2270138511 * l - 0.5577999807 * m + 0.2812561490 * s,
        -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s,
        -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s
    ];
}

// Oklab to OKLCH
function oklabToOklch(L, a, b) {
    const C = Math.sqrt(a * a + b * b);
    const H = Math.atan2(b, a) * 180 / Math.PI;
    return [L, C, H < 0 ? H + 360 : H];
}

// OKLCH to Oklab
function oklchToOklab(L, C, H) {
    const hRad = H * Math.PI / 180;
    return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

// Convert hex to OKLCH
export function hexToOklch(hex) {
    const [r, g, b] = hexToRgb(hex);
    const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
    const [x, y, z] = linearRgbToXyz(lr, lg, lb);
    const [L, a, b_] = xyzToOklab(x, y, z);
    return oklabToOklch(L, a, b_);
}

// Convert OKLCH to hex
export function oklchToHex(L, C, H) {
    const [L_, a, b] = oklchToOklab(L, C, H);
    const [x, y, z] = oklabToXyz(L_, a, b);
    const [lr, lg, lb] = xyzToLinearRgb(x, y, z);
    const [r, g, b_] = [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
    return rgbToHex(r, g, b_);
}
