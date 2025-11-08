// Rendering constants
const RENDER_STEPS = 1500; // Number of points for smooth shape rendering

// Draw superformula shape
function drawSuperformula(ctx, shape, scaleFactor = 1) {
    const {cx, cy, radius, rotation, m, n1, n2, n3, a, b, penMode, penWiggle} = shape;
    const steps = RENDER_STEPS;

    ctx.beginPath();

    // Create seeded random for reproducibility
    let rng = null;
    if (penMode && penWiggle > 0) {
        const seed = createShapeSeed(shape);
        rng = new SeededRandom(seed);
    }

    for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        let r = superformulaR(theta, {m, n1, n2, n3, a, b});

        // Add pen drawing wiggle effect
        if (penMode && penWiggle > 0 && rng) {
            // Add controlled randomness to radius
            const wiggleAmount = penWiggle * 0.02; // Scale wiggle to reasonable range
            const wiggle = rng.range(-wiggleAmount, wiggleAmount);
            r = r * (1 + wiggle);
        }

        const ang = theta + rotation;
        const x = (cx * scaleFactor) + (radius * scaleFactor * r * Math.cos(ang));
        const y = (cy * scaleFactor) + (radius * scaleFactor * r * Math.sin(ang));

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
}

// Render a shape with its properties
function renderShape(ctx, shape, scaleFactor = 1) {
    ctx.save();

    const hasFill = shape.fillColor && shape.fillColor !== 'none';
    const hasStroke = shape.strokeWidth > 0;

    // Handle radial gradient fill
    if (hasFill && shape.gradientMode && shape.gradientEdgeColor) {
        drawSuperformula(ctx, shape, scaleFactor);

        // Create radial gradient from center to edge
        const centerX = shape.cx * scaleFactor;
        const centerY = shape.cy * scaleFactor;
        const maxRadius = shape.radius * scaleFactor * 1.2; // Slightly larger to cover edge

        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
        );

        // Extract color from fillColor (handle rgba format)
        let centerColor = shape.fillColor;
        if (centerColor.startsWith('rgba')) {
            // Use as-is
        } else if (centerColor.startsWith('rgb')) {
            centerColor = centerColor;
        }

        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(1, shape.gradientEdgeColor);

        ctx.fillStyle = gradient;
        ctx.fill();
    }
    // Handle watercolor fill
    else if (hasFill && shape.watercolorMode && shape.watercolorIntensity > 0) {
        const seed = createShapeSeed(shape);
        const rng = new SeededRandom(seed + 12345); // Different seed for fill vs stroke

        // Number of layers for watercolor effect (more layers = more texture)
        const layers = Math.ceil(shape.watercolorIntensity * 0.15) + 3;

        // Extract base opacity from fillColor
        let baseOpacity = 1;
        const rgbaMatch = shape.fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch && rgbaMatch[4]) {
            baseOpacity = parseFloat(rgbaMatch[4]);
        }

        // Extract RGB values
        let r, g, b;
        if (rgbaMatch) {
            r = parseInt(rgbaMatch[1]);
            g = parseInt(rgbaMatch[2]);
            b = parseInt(rgbaMatch[3]);
        } else if (shape.fillColor.startsWith('#')) {
            r = parseInt(shape.fillColor.slice(1, 3), 16);
            g = parseInt(shape.fillColor.slice(3, 5), 16);
            b = parseInt(shape.fillColor.slice(5, 7), 16);
        }

        // Draw multiple layers with slight variations
        for (let layer = 0; layer < layers; layer++) {
            // Vary the opacity for each layer to create depth
            const layerOpacity = (baseOpacity / layers) * rng.range(0.6, 1.4);

            // Create a slightly modified shape for this layer
            const layerShape = {
                ...shape,
                penMode: true,
                penWiggle: shape.watercolorIntensity * 0.3 * rng.range(0.5, 1.5)
            };

            drawSuperformula(ctx, layerShape, scaleFactor);

            // Vary color slightly for texture
            const colorVariation = Math.floor(shape.watercolorIntensity * 0.3 * rng.range(-5, 5));
            const layerR = Math.max(0, Math.min(255, r + colorVariation));
            const layerG = Math.max(0, Math.min(255, g + colorVariation));
            const layerB = Math.max(0, Math.min(255, b + colorVariation));

            ctx.fillStyle = `rgba(${layerR}, ${layerG}, ${layerB}, ${layerOpacity})`;
            ctx.fill();
        }
    }
    // Handle standard fill
    else if (hasFill) {
        drawSuperformula(ctx, shape, scaleFactor);
        ctx.fillStyle = shape.fillColor;
        ctx.fill();
    }

    // Handle stroke (always drawn on top)
    if (hasStroke) {
        drawSuperformula(ctx, shape, scaleFactor);
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.strokeWidth * scaleFactor;
        ctx.stroke();
    }

    ctx.restore();
}

// Render all shapes to canvas
function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
        renderShape(ctx, shape);
    });

    updateExportPreviews();
}

// Check if a point is inside a shape
function isPointInShape(x, y, shape) {
    ctx.save();
    ctx.beginPath();
    drawSuperformula(ctx, shape, 1);
    const result = ctx.isPointInPath(x, y);
    ctx.restore();
    return result;
}

// Render to a specific size canvas
function renderToCanvas(size) {
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
