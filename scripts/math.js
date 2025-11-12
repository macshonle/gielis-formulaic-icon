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

// Convert hex color to rgba
export function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
