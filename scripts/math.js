// Application constants (defined here since math.js loads first)
const CANVAS_SIZE = 384; // Main canvas dimensions (pixels)
const CANVAS_CENTER = CANVAS_SIZE / 2; // Center point of the canvas

// Superformula calculation
function superformulaR(theta, {m, n1, n2, n3, a, b}) {
    const t1 = Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2);
    const t2 = Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3);
    const denom = t1 + t2;
    return Math.pow(Math.max(denom, 1e-12), -1 / n1);
}

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Convert hex color to rgba
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Seeded random number generator (Mulberry32)
// Provides reproducible random numbers based on a seed
class SeededRandom {
    constructor(seed) {
        this.seed = seed >>> 0; // Convert to unsigned 32-bit integer
    }

    // Generate next random number between 0 and 1
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Generate random number in range [min, max]
    range(min, max) {
        return min + this.next() * (max - min);
    }
}

// Create a seed from shape parameters
function createShapeSeed(shape) {
    // Hash function to convert shape parameters to a seed
    const str = `${shape.cx}|${shape.cy}|${shape.radius}|${shape.rotation}|${shape.m}|${shape.n1}|${shape.n2}|${shape.n3}|${shape.a}|${shape.b}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
