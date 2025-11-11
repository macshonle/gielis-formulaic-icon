import { lightenColor, hexToRgba, CANVAS_CENTER } from './math.js';

// Modern icon color palette
export const defaultPalette = [
    '#FF6B6B', '#FF8E53', '#FFA64D', '#FFD93D', '#6BCF7F', '#4ECDC4',
    '#45B7D1', '#4D96FF', '#6C5CE7', '#A78BFA', '#F472B6', '#FB7185',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E', '#14B8A6',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#16A34A', '#0D9488',
    '#0891B2', '#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#E11D48',
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF'
];

// Preset configurations
export const presets = {
    circle: { m: 4, n1: 2, n2: 2, n3: 2, a: 1, b: 1 },
    square: { m: 4, n1: 4, n2: 4, n3: 4, a: 1, b: 1 },
    squircle: { m: 4, n1: 11, n2: 11, n3: 11, a: 1, b: 1, radius: 188 },
    star4: { m: 4, n1: 0.5, n2: 0.5, n3: 0.5, a: 1, b: 1 },
    star5: { m: 5, n1: 0.5, n2: 0.5, n3: 0.5, a: 1, b: 1 },
    star8: { m: 8, n1: 0.5, n2: 0.5, n3: 0.5, a: 1, b: 1 },
    flower: { m: 6, n1: 1, n2: 4, n3: 4, a: 1, b: 1 },
    gear: { m: 8, n1: 10, n2: 10, n3: 10, a: 1, b: 1 },
    diamond: { m: 4, n1: 1, n2: 1, n3: 1, a: 1, b: 1 },
    cross: { m: 4, n1: 100, n2: 100, n3: 100, a: 1, b: 1 }
};

// Demo configurations
export const demos = {
    descendingStar: {
        name: "Descending Star",
        shapes: (function() {
            const shapes = [];
            const colors = ['#FF6B6B', '#FF8E53', '#FFA64D', '#FFD93D', '#6BCF7F', '#4ECDC4',
                          '#45B7D1', '#4D96FF', '#6C5CE7', '#A78BFA', '#F472B6', '#FB7185',
                          '#EF4444', '#F97316', '#F59E0B'];
            for (let i = 0; i < 15; i++) {
                const points = 18 - i;
                const size = 160 - (i * 8);
                const rotation = (i * 8) * Math.PI / 180;
                const opacity = 0.9 - (i * 0.03);
                const baseColor = colors[i % colors.length];
                const lightColor = lightenColor(baseColor, i * 3);

                shapes.push({
                    cx: CANVAS_CENTER,
                    cy: CANVAS_CENTER,
                    radius: size,
                    rotation: rotation,
                    m: points,
                    n1: 0.5,
                    n2: 0.5,
                    n3: 0.5,
                    a: 1,
                    b: 1,
                    fillColor: hexToRgba(lightColor, opacity),
                    strokeColor: lightenColor(baseColor, i * 2),
                    strokeWidth: 2
                });
            }
            return shapes;
        })()
    },
    bloomingFlower: {
        name: "Blooming Flower",
        shapes: [
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 94,
                rotation: 0.3316125578789226,
                m: 6,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(244, 114, 182, 0.5)",
                strokeColor: "#F472B6",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 94,
                rotation: 0.6632251157578452,
                m: 4,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(236, 72, 153, 0.56)",
                strokeColor: "#EC4899",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 90,
                rotation: 1.413716694115407,
                m: 5,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(219, 39, 119, 0.62)",
                strokeColor: "#DB2777",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 90,
                rotation: 2.199114857512855,
                m: 6,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(190, 24, 93, 0.68)",
                strokeColor: "#BE185D",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 72,
                rotation: 0.715584993317675,
                m: 15,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(159, 18, 57, 0.74)",
                strokeColor: "#9F1239",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 94,
                rotation: 0.8552113334772214,
                m: 8,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(136, 19, 55, 0.8)",
                strokeColor: "#881337",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 67,
                rotation: 1.8151424220741028,
                m: 9,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(112, 26, 71, 0.86)",
                strokeColor: "#701A47",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 67,
                rotation: 3.6477381366681487,
                m: 9,
                n1: 1,
                n2: 4,
                n3: 4,
                a: 1,
                b: 1,
                fillColor: "rgba(93, 26, 87, 0.82)",
                strokeColor: "#5D1A57",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 18,
                rotation: 1.8325957145940461,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(234, 179, 8, 0.82)",
                strokeColor: "#a96800",
                strokeWidth: 4
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 10,
                rotation: 0.3316125578789226,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 217, 61, 0.5)",
                strokeColor: "#F472B6",
                strokeWidth: 0
            }
        ]
    },
    clockworkGears: {
        name: "Clockwork Gears",
        shapes: (function() {
            const shapes = [];
            const gearConfigs = [
                { teeth: 12, size: 140, color: '#6B7280', rotation: 0 },
                { teeth: 10, size: 110, color: '#9CA3AF', rotation: 18 },
                { teeth: 8, size: 85, color: '#D1D5DB', rotation: 22.5 },
                { teeth: 6, size: 60, color: '#E5E7EB', rotation: 30 },
            ];

            gearConfigs.forEach((config, i) => {
                shapes.push({
                    cx: CANVAS_CENTER,
                    cy: CANVAS_CENTER,
                    radius: config.size,
                    rotation: config.rotation * Math.PI / 180,
                    m: config.teeth,
                    n1: 10,
                    n2: 10,
                    n3: 10,
                    a: 1,
                    b: 1,
                    fillColor: hexToRgba(config.color, 0.7),
                    strokeColor: '#374151',
                    strokeWidth: 3
                });
            });

            return shapes;
        })()
    },
    rainbowBurst: {
        name: "Rainbow Burst",
        shapes: (function() {
            const shapes = [];
            const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];

            colors.forEach((color, i) => {
                const size = 150 - (i * 15);
                const rotation = (i * 25) * Math.PI / 180;
                const opacity = 0.6;

                shapes.push({
                    cx: CANVAS_CENTER,
                    cy: CANVAS_CENTER,
                    radius: size,
                    rotation: rotation,
                    m: 12,
                    n1: 0.5,
                    n2: 0.5,
                    n3: 0.5,
                    a: 1,
                    b: 1,
                    fillColor: hexToRgba(color, opacity),
                    strokeColor: color,
                    strokeWidth: 2
                });
            });

            return shapes;
        })()
    },
    geometricMandala: {
        name: "Geometric Mandala",
        shapes: (function() {
            const shapes = [];
            const layers = [
                { m: 8, n1: 0.5, n2: 0.5, n3: 0.5, size: 150, color: '#6366F1', rotation: 0 },
                { m: 8, n1: 2, n2: 2, n3: 2, size: 120, color: '#8B5CF6', rotation: 22.5 },
                { m: 8, n1: 4, n2: 4, n3: 4, size: 90, color: '#A78BFA', rotation: 0 },
                { m: 12, n1: 1, n2: 4, n3: 4, size: 65, color: '#C4B5FD', rotation: 15 },
                { m: 4, n1: 2, n2: 5, n3: 5, size: 40, color: '#DDD6FE', rotation: 0 },
            ];

            layers.forEach((layer, i) => {
                shapes.push({
                    cx: CANVAS_CENTER,
                    cy: CANVAS_CENTER,
                    radius: layer.size,
                    rotation: layer.rotation * Math.PI / 180,
                    m: layer.m,
                    n1: layer.n1,
                    n2: layer.n2,
                    n3: layer.n3,
                    a: 1,
                    b: 1,
                    fillColor: hexToRgba(layer.color, 0.7),
                    strokeColor: layer.color,
                    strokeWidth: 2
                });
            });

            return shapes;
        })()
    },
    nestedSquares: {
        name: "Nested Squares",
        shapes: (function() {
            const shapes = [];
            const startRadius = 188;
            const minRadius = 25;
            const scaleFactor = 167 / 188; // Optimal nesting ratio (~0.888)
            const rotationStep = 80 * Math.PI / 180; // 80 degrees in radians

            // Calculate how many iterations we need
            let currentRadius = startRadius;
            let currentRotation = 0;
            let iteration = 0;

            // Gradient from steel blue to light gray
            const startColor = { r: 70, g: 130, b: 180 };  // Steel blue
            const endColor = { r: 220, g: 220, b: 220 };   // Light gray

            // Calculate total iterations for gradient (constant value)
            const totalIterations = Math.ceil(Math.log(minRadius / startRadius) / Math.log(scaleFactor));

            while (currentRadius >= minRadius) {
                const t = iteration / (totalIterations - 1); // Interpolation factor 0 to 1

                // Interpolate color
                const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
                const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
                const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);
                const color = `rgb(${r}, ${g}, ${b})`;

                shapes.push({
                    cx: CANVAS_CENTER,
                    cy: CANVAS_CENTER,
                    radius: Math.round(currentRadius),
                    rotation: currentRotation,
                    m: 4,
                    n1: 11,
                    n2: 11,
                    n3: 11,
                    a: 1,
                    b: 1,
                    fillColor: color,
                    strokeColor: '#000000',
                    strokeWidth: 2
                });

                currentRadius *= scaleFactor;
                currentRotation += rotationStep;
                iteration++;
            }

            // Add star on top
            shapes.push({
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 186,
                rotation: 0,
                m: 8,
                n1: 0.5,
                n2: 0.5,
                n3: 0.5,
                a: 1,
                b: 0.6,
                fillColor: "rgba(255, 217, 61, 1)",
                strokeColor: "#d3d7da",
                strokeWidth: 3
            });

            return shapes;
        })()
    },
    geminEye: {
        name: "Gemin-EYE",
        shapes: [
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 187,
                rotation: 0,
                m: 4,
                n1: 0.6,
                n2: 0.6,
                n3: 0.7,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 217, 61, 1)",
                strokeColor: "#fec700",
                strokeWidth: 6
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 186,
                rotation: 0,
                m: 2,
                n1: 0.5,
                n2: 0.5,
                n3: 0.5,
                a: 1,
                b: 1,
                fillColor: "rgba(59, 130, 246, 0.82)",
                strokeColor: "#000000",
                strokeWidth: 2
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 157,
                rotation: 0,
                m: 2,
                n1: 0.5,
                n2: 0.5,
                n3: 0.5,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 255, 255, 0.72)",
                strokeColor: "#000000",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 46,
                rotation: 0,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 255, 255, 1)",
                strokeColor: "#000000",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 38,
                rotation: 0,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(88, 52, 0, 1)",
                strokeColor: "#000000",
                strokeWidth: 1
            },
            {
                cx: CANVAS_CENTER,
                cy: CANVAS_CENTER,
                radius: 25,
                rotation: 0,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(0, 0, 0, 0.82)",
                strokeColor: "#000000",
                strokeWidth: 2
            },
            {
                cx: 175,
                cy: 172,
                radius: 10,
                rotation: 0,
                m: 4,
                n1: 2,
                n2: 2,
                n3: 2,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 255, 255, 1)",
                strokeColor: "#000000",
                strokeWidth: 1
            },
            {
                cx: 73,
                cy: 305,
                radius: 41,
                rotation: 1.5707963267948966,
                m: 4,
                n1: 0.6,
                n2: 0.7,
                n3: 0.8,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 217, 61, 1)",
                strokeColor: "#fec700",
                strokeWidth: 3
            },
            {
                cx: 68,
                cy: 52,
                radius: 23,
                rotation: 0,
                m: 4,
                n1: 0.6,
                n2: 0.6,
                n3: 0.6,
                a: 1,
                b: 1,
                fillColor: "rgba(255, 217, 61, 1)",
                strokeColor: "#fec700",
                strokeWidth: 2
            }
        ]
    }
};
