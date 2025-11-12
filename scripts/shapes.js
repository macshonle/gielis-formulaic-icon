import { hexToRgba, CANVAS_CENTER } from './math.js';
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

    const shape = {
        cx: parseFloat(document.getElementById('posX').value),
        cy: parseFloat(document.getElementById('posY').value),
        radius: parseFloat(document.getElementById('size').value),
        rotation: parseFloat(document.getElementById('rotation').value) * Math.PI / 180,
        m: parseFloat(document.getElementById('paramM').value),
        n1: parseFloat(document.getElementById('paramN1').value),
        n2: parseFloat(document.getElementById('paramN2').value),
        n3: parseFloat(document.getElementById('paramN3').value),
        a: parseFloat(document.getElementById('paramA').value),
        b: parseFloat(document.getElementById('paramB').value),
        fillColor: fillColor,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
    };

    // Add knot pattern parameters if enabled
    if (enableKnotPattern) {
        shape.knotLobes = parseFloat(document.getElementById('knotLobes').value);
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

    document.getElementById('paramM').value = shape.m;
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
        document.getElementById('knotLobes').value = shape.knotLobes;
        document.getElementById('knotTurns').value = shape.knotTurns;
        document.getElementById('knotAmplitude').value = shape.knotAmplitude;
        document.getElementById('knotAmplitudeDisplay').textContent = shape.knotAmplitude.toFixed(2);
        document.getElementById('knotBaseRadius').value = shape.knotBaseRadius || 1.0;
        document.getElementById('knotBaseRadiusDisplay').textContent = (shape.knotBaseRadius || 1.0).toFixed(2);
    }

    updateKnotPatternUIState();
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
    const layerCount = Math.floor(Math.random() * 6) + 3; // 3-8 layers

    for (let i = 0; i < layerCount; i++) {
        const m = Math.floor(Math.random() * 16) + 3; // 3-18 symmetry
        // Clip to tenths (one decimal place)
        const n1 = Math.round((Math.random() * 9 + 0.5) * 10) / 10; // 0.5-9.5
        const n2 = Math.round((Math.random() * 9 + 0.5) * 10) / 10;
        const n3 = Math.round((Math.random() * 9 + 0.5) * 10) / 10;
        const a = Math.round((Math.random() * 2 + 0.5) * 10) / 10; // 0.5-2.5
        const b = Math.round((Math.random() * 2 + 0.5) * 10) / 10;

        // Clip size to integers, mostly smaller to avoid offscreen edges
        // Weighted towards smaller sizes: 70% chance of 40-100, 30% chance of 100-140
        const sizeRange = Math.random() < 0.7 ? 60 : 40;
        const sizeBase = Math.random() < 0.7 ? 40 : 100;
        const size = Math.floor(Math.random() * sizeRange + sizeBase); // Mostly 40-100, rarely 100-140

        const rotation = Math.random() * 360 * Math.PI / 180;
        const opacity = Math.random() * 0.5 + 0.4; // 0.4-0.9

        // Random color from palette
        const color = defaultPalette[Math.floor(Math.random() * (defaultPalette.length - 6))]; // Exclude greys

        shapes.push({
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
            strokeColor: color,
            strokeWidth: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0
        });
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
