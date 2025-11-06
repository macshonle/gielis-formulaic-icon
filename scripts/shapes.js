// Application state
let shapes = [];
let selectedShapeIndex = null;
let currentColor = '#FF6B6B';
let currentOpacity = 1;
let currentStrokeColor = '#000000';
let draggedItem = null;
let isFillNone = false;  // Track if fill is set to "none"
let isStrokeNone = false;  // Track if stroke is set to "none"

// Canvas dragging state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartCX = 0;
let dragStartCY = 0;

// Canvas setup
let canvas;
let ctx;

// Create shape object from current settings
function createShapeFromSettings() {
    const opacity = parseFloat(document.getElementById('opacity').value);

    // Handle fill color based on "no fill" state
    let fillColor;
    if (isFillNone) {
        fillColor = 'none';
    } else if (currentColor.startsWith('#') && currentColor.length === 7) {
        fillColor = hexToRgba(currentColor, opacity);
    } else if (currentColor.startsWith('rgb(')) {
        fillColor = currentColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    } else {
        fillColor = currentColor;
    }

    // Handle stroke based on "no stroke" state
    let strokeWidth;
    let strokeColor;
    if (isStrokeNone) {
        strokeWidth = 0;
        strokeColor = currentStrokeColor;
    } else {
        strokeWidth = parseFloat(document.getElementById('strokeWidth').value);
        strokeColor = document.getElementById('strokeColor').value || currentStrokeColor;
    }

    return {
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
}

// Add new shape
function addShape() {
    const shape = createShapeFromSettings();
    shapes.push(shape);
    selectedShapeIndex = shapes.length - 1;
    updateShapeList();
    renderCanvas();
    // Ensure UI state is updated after adding shape
    updateFillUIState();
    updateStrokeUIState();
}

// Update selected shape with current settings
function updateSelectedShape() {
    if (selectedShapeIndex !== null && shapes[selectedShapeIndex]) {
        shapes[selectedShapeIndex] = createShapeFromSettings();
        updateShapeList();
        renderCanvas();
    }
}

// Load shape into editor
function loadShapeToEditor(shape) {
    document.getElementById('posX').value = shape.cx;
    document.getElementById('posY').value = shape.cy;
    document.getElementById('size').value = shape.radius;
    document.getElementById('sizeValue').textContent = shape.radius;

    const rotationDeg = shape.rotation * 180 / Math.PI;
    document.getElementById('rotation').value = rotationDeg;
    document.getElementById('rotationValue').value = Math.round(rotationDeg);

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
            currentOpacity = opacity;

            // Update color inputs
            document.getElementById('fillColorPicker').value = hexColor;
            document.getElementById('customColor').value = hexColor;

            // Update opacity input
            document.getElementById('opacity').value = opacity;
            document.getElementById('opacityValue').textContent = opacity.toFixed(2);

            // Update color palette selection
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                if (swatch.style.background === hexColor || swatch.style.background === `rgb(${r}, ${g}, ${b})`) {
                    swatch.classList.add('selected');
                } else {
                    swatch.classList.remove('selected');
                }
            });
        } else if (shape.fillColor.startsWith('#')) {
            // Handle hex colors directly
            currentColor = shape.fillColor;
            currentOpacity = 1;

            // Update color inputs
            document.getElementById('fillColorPicker').value = shape.fillColor;
            document.getElementById('customColor').value = shape.fillColor;

            // Update opacity input
            document.getElementById('opacity').value = 1;
            document.getElementById('opacityValue').textContent = '1.00';

            // Update color palette selection
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.classList.remove('selected');
            });
        } else {
            // Fallback: use the color as-is
            currentColor = shape.fillColor;
            currentOpacity = 1;

            // Update opacity input
            document.getElementById('opacity').value = 1;
            document.getElementById('opacityValue').textContent = '1.00';
        }
        updateFillUIState();
    }

    // Load stroke width and color
    if (shape.strokeWidth === 0) {
        isStrokeNone = true;
        document.getElementById('strokeWidth').value = 4; // Set to a default value
    } else {
        isStrokeNone = false;
        document.getElementById('strokeWidth').value = shape.strokeWidth;
    }

    document.getElementById('strokeColor').value = shape.strokeColor;
    document.getElementById('strokeColorPicker').value = shape.strokeColor;
    currentStrokeColor = shape.strokeColor;

    updateStrokeUIState();
    updateStrokeColorVisibility();
}

// Delete shape at index
function deleteShape(index) {
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
function clearAll() {
    if (confirm('Clear all shapes?')) {
        shapes = [];
        selectedShapeIndex = null;
        updateShapeList();
        renderCanvas();
    }
}

// Load a demo
function loadDemo(demoKey) {
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
function generateRandomDemo() {
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
            cx: 192,
            cy: 192,
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
function applyPreset(presetName) {
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
            document.getElementById('sizeValue').textContent = preset.radius;
        }

        // If no layers exist, create one automatically
        if (shapes.length === 0) {
            addShape();
        } else {
            updateSelectedShape();
        }
    }
}
