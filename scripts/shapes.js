import { hexToRgba, hexToOklch, oklchToHex, lightenColor, darkenColor, CANVAS_CENTER } from './math.js';
import { defaultPalette, demos, presets } from './config.js';
import { updateShapeList, updateFillUIState, updateStrokeUIState, updateStrokeColorVisibility, updateKnotPatternUIState, colorSwatches } from './ui.js';
import { renderCanvas } from './rendering.js';

// Application state
export let shapes = [];
export let selectedShapeIndex = null;
export let currentColor = '#FF6B6B';
export let currentStrokeColor = '#000000';
export let draggedItem = null;
export let isFillNone = false;  // Track if fill is set to "none"

// Canvas dragging state
export let isDragging = false;
export let dragStartX = 0;
export let dragStartY = 0;
export let dragStartCX = 0;
export let dragStartCY = 0;

// Helper function to normalize color for comparison
export function normalizeColor(color) {
    // Convert rgb(r, g, b) to hex for consistent comparison
    if (color.startsWith('rgb(')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        }
    }
    return color.toUpperCase();
}

// Canvas setup
export let canvas;
export let ctx;

// Create shape object from current settings
export function createShapeFromSettings() {
    const opacity = parseFloat(document.getElementById('opacity').value);

    // Handle fill color based on "no fill" state
    let fillColor;
    if (isFillNone) {
        fillColor = 'none';
    } else if (currentColor.startsWith('#') && currentColor.length === 7) {
        fillColor = hexToRgba(currentColor, opacity);
    } else {
        fillColor = currentColor;
    }

    // Handle stroke based on checkbox state
    let strokeWidth;
    let strokeColor;
    const strokeEnabled = document.getElementById('strokeEnabled').checked;
    if (!strokeEnabled) {
        strokeWidth = 0;
        strokeColor = currentStrokeColor;
    } else {
        strokeWidth = parseFloat(document.getElementById('strokeWidth').value);
        strokeColor = document.getElementById('strokeColor').value || currentStrokeColor;
    }

    // Check if knot pattern is enabled
    const enableKnotPattern = document.getElementById('enableKnotPattern').checked;

    // Use unified lobes parameter (paramM) for both m and knotLobes
    const lobes = parseFloat(document.getElementById('paramM').value);

    const shape = {
        cx: parseFloat(document.getElementById('posX').value),
        cy: parseFloat(document.getElementById('posY').value),
        radius: parseFloat(document.getElementById('size').value),
        rotation: parseFloat(document.getElementById('rotation').value) * Math.PI / 180,
        m: lobes,
        n1: parseFloat(document.getElementById('paramN1').value),
        n2: parseFloat(document.getElementById('paramN2').value),
        n3: parseFloat(document.getElementById('paramN3').value),
        a: parseFloat(document.getElementById('paramA').value),
        b: parseFloat(document.getElementById('paramB').value),
        fillColor: fillColor,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        variation: document.getElementById('variationSelect').value || 'none',
    };

    // Add knot pattern parameters if enabled
    if (enableKnotPattern) {
        shape.knotLobes = lobes; // Use unified lobes value
        shape.knotTurns = parseFloat(document.getElementById('knotTurns').value);
        shape.knotAmplitude = parseFloat(document.getElementById('knotAmplitude').value);
        shape.knotBaseRadius = parseFloat(document.getElementById('knotBaseRadius').value);
    } else {
        shape.knotLobes = 0;
    }

    return shape;
}

// Add new shape
export function addShape() {
    const shape = createShapeFromSettings();
    shapes.push(shape);
    selectedShapeIndex = shapes.length - 1;
    updateShapeList();
    renderCanvas();
}

// Update selected shape with current settings
export function updateSelectedShape() {
    if (selectedShapeIndex !== null && shapes[selectedShapeIndex]) {
        shapes[selectedShapeIndex] = createShapeFromSettings();
        updateShapeList();
        renderCanvas();
    }
}

// Load shape into editor
export function loadShapeToEditor(shape) {
    document.getElementById('posX').value = shape.cx;
    document.getElementById('posY').value = shape.cy;
    document.getElementById('size').value = shape.radius;
    document.getElementById('sizeDisplay').textContent = shape.radius;
    document.getElementById('sizeValue').value = shape.radius;

    // Convert rotation to degrees and normalize to -180 to 180 range
    let rotationDeg = shape.rotation * 180 / Math.PI;
    // Normalize to [-180, 180]
    rotationDeg = ((rotationDeg + 180) % 360) - 180;
    if (rotationDeg < -180) rotationDeg += 360;
    const roundedRotation = Math.round(rotationDeg);
    document.getElementById('rotation').value = roundedRotation;
    document.getElementById('rotationDisplay').textContent = roundedRotation;
    document.getElementById('rotationValue').value = roundedRotation;

    // Use knotLobes if present, otherwise use m (for unified lobes control)
    const lobes = (shape.knotLobes !== undefined && shape.knotLobes > 0) ? shape.knotLobes : shape.m;
    document.getElementById('paramM').value = lobes;
    document.getElementById('paramN1').value = shape.n1;
    document.getElementById('paramN2').value = shape.n2;
    document.getElementById('paramN3').value = shape.n3;
    document.getElementById('paramA').value = shape.a;
    document.getElementById('paramB').value = shape.b;

    // Load fill color and opacity
    if (shape.fillColor === 'none') {
        isFillNone = true;
        updateFillUIState();
    } else {
        isFillNone = false;
        const rgbaMatch = shape.fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]);
            const g = parseInt(rgbaMatch[2]);
            const b = parseInt(rgbaMatch[3]);
            const opacity = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

            // Convert to hex
            const hexColor = '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');

            // Update global state
            currentColor = hexColor;

            // Update color inputs
            document.getElementById('fillColorPicker').value = hexColor;
            document.getElementById('customColor').value = hexColor;

            // Update opacity input
            document.getElementById('opacity').value = opacity;
            document.getElementById('opacityValue').textContent = opacity.toFixed(2);

            // Update color palette selection
            if (colorSwatches) {
                const normalizedHex = normalizeColor(hexColor);
                colorSwatches.forEach(swatch => {
                    const normalizedSwatch = normalizeColor(swatch.style.background);
                    if (normalizedSwatch === normalizedHex) {
                        swatch.classList.add('selected');
                    } else {
                        swatch.classList.remove('selected');
                    }
                });
            }
        } else if (shape.fillColor.startsWith('#')) {
            // Handle hex colors directly
            currentColor = shape.fillColor;

            // Update color inputs
            document.getElementById('fillColorPicker').value = shape.fillColor;
            document.getElementById('customColor').value = shape.fillColor;

            // Update opacity input
            document.getElementById('opacity').value = 1;
            document.getElementById('opacityValue').textContent = '1.00';

            // Update color palette selection
            if (colorSwatches) {
                colorSwatches.forEach(swatch => {
                    swatch.classList.remove('selected');
                });
            }
        } else {
            // Fallback: use the color as-is
            currentColor = shape.fillColor;

            // Update opacity input
            document.getElementById('opacity').value = 1;
            document.getElementById('opacityValue').textContent = '1.00';
        }
        updateFillUIState();
    }

    // Load stroke width and color
    if (shape.strokeWidth === 0) {
        document.getElementById('strokeEnabled').checked = false;
        document.getElementById('strokeWidth').value = 4; // Set to a default value
    } else {
        document.getElementById('strokeEnabled').checked = true;
        document.getElementById('strokeWidth').value = shape.strokeWidth;
    }

    document.getElementById('strokeColor').value = shape.strokeColor;
    document.getElementById('strokeColorPicker').value = shape.strokeColor;
    currentStrokeColor = shape.strokeColor;

    updateStrokeUIState();
    updateStrokeColorVisibility();

    // Load knot pattern parameters if present
    const hasKnotPattern = shape.knotLobes !== undefined && shape.knotLobes > 0;
    document.getElementById('enableKnotPattern').checked = hasKnotPattern;

    if (hasKnotPattern) {
        // Note: knotLobes is now unified with paramM, so it's already set above
        document.getElementById('knotTurns').value = shape.knotTurns;
        document.getElementById('knotAmplitude').value = shape.knotAmplitude;
        document.getElementById('knotAmplitudeDisplay').textContent = shape.knotAmplitude.toFixed(2);
        document.getElementById('knotBaseRadius').value = shape.knotBaseRadius || 1.0;
        document.getElementById('knotBaseRadiusDisplay').textContent = (shape.knotBaseRadius || 1.0).toFixed(2);
    }

    updateKnotPatternUIState();

    // Load variation setting
    const variation = shape.variation || 'none';
    document.getElementById('variationSelect').value = variation;
}

// Delete shape at index
export function deleteShape(index) {
    shapes.splice(index, 1);
    if (selectedShapeIndex === index) {
        selectedShapeIndex = shapes.length > 0 ? Math.max(0, index - 1) : null;
        if (selectedShapeIndex !== null && shapes[selectedShapeIndex]) {
            loadShapeToEditor(shapes[selectedShapeIndex]);
        }
    } else if (selectedShapeIndex > index) {
        selectedShapeIndex--;
    }
    updateShapeList();
    renderCanvas();
}

// Clear all shapes
export function clearAll() {
    if (confirm('Clear all shapes?')) {
        shapes = [];
        selectedShapeIndex = null;
        updateShapeList();
        renderCanvas();
    }
}

// Load a demo
export function loadDemo(demoKey) {
    if (demos[demoKey]) {
        shapes = JSON.parse(JSON.stringify(demos[demoKey].shapes)); // Deep clone
        selectedShapeIndex = shapes.length > 0 ? shapes.length - 1 : null;
        if (selectedShapeIndex !== null) {
            loadShapeToEditor(shapes[selectedShapeIndex]);
        }
        updateShapeList();
        renderCanvas();
    }
}

// Generate random demo
export function generateRandomDemo() {
    shapes = [];
    const layerCount = Math.floor(Math.random() * 3) + 3; // 3-5 layers (reduced from 3-8)

    // Pick a seed color from palette (exclude greys)
    const seedColor = defaultPalette[Math.floor(Math.random() * (defaultPalette.length - 6))];
    const [L, C, H] = hexToOklch(seedColor);

    // Choose color scheme: complementary or split-complementary
    const colorScheme = Math.random();
    let hueOffsets;
    if (colorScheme < 0.3) {
        // Complementary (180 degrees)
        hueOffsets = [0, 180];
    } else {
        // Split-complementary: pick from ±{30, 60, 120}
        const angleChoices = [30, 60, 120];
        const angle = angleChoices[Math.floor(Math.random() * angleChoices.length)];
        hueOffsets = [0, angle, -angle];
    }

    // Generate color palette with varied lightness
    const colorPalette = hueOffsets.map(offset => {
        const newH = (H + offset + 360) % 360;
        // Vary lightness slightly for depth
        const newL = Math.max(0.3, Math.min(0.85, L + (Math.random() - 0.5) * 0.2));
        const newC = Math.max(0.05, Math.min(0.25, C + (Math.random() - 0.5) * 0.05));
        return oklchToHex(newL, newC, newH);
    });

    // Knot pattern value lists
    const knotLobesOptions = [3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24];
    const knotTurnsOptions = [1, 2, 3, 4, 5, 7, 9, 11];

    for (let i = 0; i < layerCount; i++) {
        // 35% chance of knot pattern
        const useKnotPattern = Math.random() < 0.35;

        const m = Math.floor(Math.random() * 16) + 3; // 3-18 symmetry/lobes
        const n1 = Math.round((Math.random() * 9 + 0.5) * 10) / 10;
        const n2 = Math.round((Math.random() * 9 + 0.5) * 10) / 10;
        const n3 = Math.round((Math.random() * 9 + 0.5) * 10) / 10;
        const a = Math.round((Math.random() * 2 + 0.5) * 10) / 10;
        const b = Math.round((Math.random() * 2 + 0.5) * 10) / 10;

        // Smaller sizes: 30-100 (was 40-140)
        const size = Math.floor(Math.random() * 70 + 30);

        const rotation = Math.random() * 360 * Math.PI / 180;
        const opacity = Math.random() * 0.5 + 0.4; // 0.4-0.9

        // Pick color from palette (allow reuse)
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        // Stroke: 40% black, 30% lighter, 30% darker
        let strokeColor;
        const strokeChoice = Math.random();
        if (strokeChoice < 0.4) {
            strokeColor = '#000000';
        } else if (strokeChoice < 0.7) {
            strokeColor = lightenColor(color, 30);
        } else {
            strokeColor = darkenColor(color, 30);
        }

        const shape = {
            cx: CANVAS_CENTER,
            cy: CANVAS_CENTER,
            radius: size,
            rotation: rotation,
            m: m,
            n1: n1,
            n2: n2,
            n3: n3,
            a: a,
            b: b,
            fillColor: hexToRgba(color, opacity),
            strokeColor: strokeColor,
            strokeWidth: Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0
        };

        // Add knot pattern parameters
        if (useKnotPattern) {
            shape.knotLobes = knotLobesOptions[Math.floor(Math.random() * knotLobesOptions.length)];
            shape.knotTurns = knotTurnsOptions[Math.floor(Math.random() * knotTurnsOptions.length)];
            shape.knotAmplitude = Math.round((Math.random() * 0.3 + 0.1) * 100) / 100; // 0.1-0.4
            shape.knotBaseRadius = Math.round((Math.random() * 0.4 + 0.8) * 100) / 100; // 0.8-1.2
        } else {
            shape.knotLobes = 0;
        }

        shapes.push(shape);
    }

    selectedShapeIndex = shapes.length > 0 ? shapes.length - 1 : null;
    if (selectedShapeIndex !== null) {
        loadShapeToEditor(shapes[selectedShapeIndex]);
    }
    updateShapeList();
    renderCanvas();
}

// Apply preset
export function applyPreset(presetName) {
    if (presets[presetName]) {
        const preset = presets[presetName];
        document.getElementById('paramM').value = preset.m;
        document.getElementById('paramN1').value = preset.n1;
        document.getElementById('paramN2').value = preset.n2;
        document.getElementById('paramN3').value = preset.n3;
        document.getElementById('paramA').value = preset.a;
        document.getElementById('paramB').value = preset.b;

        // Apply radius if specified in preset
        if (preset.radius !== undefined) {
            document.getElementById('size').value = preset.radius;
            document.getElementById('sizeDisplay').textContent = preset.radius;
            document.getElementById('sizeValue').value = preset.radius;
        }

        // If no layers exist, create one automatically
        if (shapes.length === 0) {
            addShape();
        } else {
            updateSelectedShape();
        }
    }
}

// Setter functions for state variables (needed for imports)
export function setSelectedShapeIndex(value) {
    selectedShapeIndex = value;
}

export function setCurrentColor(value) {
    currentColor = value;
}

export function setCurrentStrokeColor(value) {
    currentStrokeColor = value;
}

export function setIsFillNone(value) {
    isFillNone = value;
}

export function setIsDragging(value) {
    isDragging = value;
}

export function setDragStartX(value) {
    dragStartX = value;
}

export function setDragStartY(value) {
    dragStartY = value;
}

export function setDragStartCX(value) {
    dragStartCX = value;
}

export function setDragStartCY(value) {
    dragStartCY = value;
}

export function setCanvas(value) {
    canvas = value;
}

export function setCtx(value) {
    ctx = value;
}

export function setDraggedItem(value) {
    draggedItem = value;
}
