import { superformulaR, knotPattern, CANVAS_SIZE } from './math.js';
import { shapes, canvas, ctx } from './shapes.js';
import { updateExportPreviews } from './ui.js';

// Rendering constants
export const RENDER_STEPS = 1500; // Number of points for smooth shape rendering

export function drawSuperformula(ctx, shape, scaleFactor = 1) {
    const {cx, cy, radius, rotation} = shape;
    const steps = RENDER_STEPS;

    ctx.beginPath();

    // Check if this is a knot pattern or superformula
    const isKnotPattern = shape.knotLobes !== undefined && shape.knotLobes > 0;

    if (isKnotPattern) {
        // Use knot pattern formula
        const {knotLobes, knotTurns, knotAmplitude, knotBaseRadius = 1.0} = shape;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const {r, theta} = knotPattern(t, {
                lobes: knotLobes,
                turns: knotTurns,
                amplitude: knotAmplitude,
                baseRadius: knotBaseRadius
            });
            const ang = theta + rotation;
            const x = (cx * scaleFactor) + (radius * scaleFactor * r * Math.cos(ang));
            const y = (cy * scaleFactor) + (radius * scaleFactor * r * Math.sin(ang));

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    } else {
        // Use standard superformula
        const {m, n1, n2, n3, a, b} = shape;

        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * 2 * Math.PI;
            const r = superformulaR(theta, {m, n1, n2, n3, a, b});
            const ang = theta + rotation;
            const x = (cx * scaleFactor) + (radius * scaleFactor * r * Math.cos(ang));
            const y = (cy * scaleFactor) + (radius * scaleFactor * r * Math.sin(ang));

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    }

    ctx.closePath();
}

// Render a shape with its properties
export function renderShape(ctx, shape, scaleFactor = 1) {
    ctx.save();

    drawSuperformula(ctx, shape, scaleFactor);

    const hasFill = shape.fillColor && shape.fillColor !== 'none';
    const hasStroke = shape.strokeWidth > 0;

    if (hasFill) {
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
    }

    if (hasStroke) {
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth * scaleFactor;
        ctx.stroke();
    }

    ctx.restore();
}

// Render all shapes to canvas
export function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
        renderShape(ctx, shape);
    });

    updateExportPreviews();
}

// Check if a point is inside a shape
export function isPointInShape(x, y, shape) {
    ctx.save();
    ctx.beginPath();
    drawSuperformula(ctx, shape, 1);
    const result = ctx.isPointInPath(x, y);
    ctx.restore();
    return result;
}

// Render to a specific size canvas
export function renderToCanvas(size) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, size, size);

    const scaleFactor = size / CANVAS_SIZE;

    shapes.forEach(shape => {
        renderShape(tempCtx, shape, scaleFactor);
    });

    return tempCanvas;
}
