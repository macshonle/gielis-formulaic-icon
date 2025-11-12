import { defaultPalette, demos } from './config.js';
import { shapes, selectedShapeIndex, currentColor, isFillNone, draggedItem, updateSelectedShape, loadShapeToEditor, deleteShape, loadDemo, generateRandomDemo, setCurrentColor, setIsFillNone, setDraggedItem, setSelectedShapeIndex } from './shapes.js';
import { renderShape, renderCanvas, renderToCanvas } from './rendering.js';
import { generateSVG } from './export.js';

// UI constants
export const PREVIEW_SIZE = 48; // Thumbnail size for shape list previews (pixels)
export const PREVIEW_SCALE = 0.4; // Scale factor for preview shapes (relative to canvas size)
export const EXPORT_PREVIEW_DEBOUNCE = 300; // Debounce delay for export preview updates (ms)

// Cache for shape previews
const shapePreviewCache = new Map();

// Cache for color swatches
export let colorSwatches = null;

// Generate cache key for a shape based on properties that affect rendering
function getShapeCacheKey(shape) {
    return JSON.stringify({
        m: shape.m,
        n1: shape.n1,
        n2: shape.n2,
        n3: shape.n3,
        a: shape.a,
        b: shape.b,
        fillColor: shape.fillColor,
        strokeColor: shape.strokeColor,
        strokeWidth: shape.strokeWidth,
        rotation: shape.rotation,
        knotLobes: shape.knotLobes,
        knotTurns: shape.knotTurns,
        knotAmplitude: shape.knotAmplitude,
        knotBaseRadius: shape.knotBaseRadius
    });
}

// Initialize color palette
export function initColorPalette() {
    const palette = document.getElementById('colorPalette');
    defaultPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        if (color === currentColor) {
            swatch.classList.add('selected');
        }
        swatch.addEventListener('click', () => {
            setCurrentColor(color);
            setIsFillNone(false);  // Disable "no fill" when color is selected
            colorSwatches.forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            document.getElementById('customColor').value = color;
            document.getElementById('fillColorPicker').value = color.startsWith('#') ? color : '#FF6B6B';
            updateFillUIState();
            updateSelectedShape();
        });
        palette.appendChild(swatch);
    });

    // Cache the color swatches after creation
    colorSwatches = document.querySelectorAll('.color-swatch');
}

// Generate shape preview thumbnail
function generateShapePreview(shape) {
    // Check cache first
    const cacheKey = getShapeCacheKey(shape);
    if (shapePreviewCache.has(cacheKey)) {
        return shapePreviewCache.get(cacheKey);
    }

    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = PREVIEW_SIZE;
    previewCanvas.height = PREVIEW_SIZE;
    const previewCtx = previewCanvas.getContext('2d');

    // White background
    previewCtx.fillStyle = 'white';
    previewCtx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    // Create a normalized version of the shape centered in the preview
    const center = PREVIEW_SIZE / 2;
    const maxRadius = PREVIEW_SIZE * PREVIEW_SCALE;

    // Create temporary shape with adjusted position and scale for preview
    const previewShape = {
        ...shape,
        cx: center,
        cy: center,
        radius: maxRadius
    };

    // Render the shape
    renderShape(previewCtx, previewShape, 1);

    // Convert to data URL and cache it
    const dataURL = previewCanvas.toDataURL('image/png');
    shapePreviewCache.set(cacheKey, dataURL);
    return dataURL;
}

// Update shape list UI
export function updateShapeList() {
    const list = document.getElementById('shapeList');
    list.innerHTML = '';

    shapes.forEach((shape, index) => {
        const item = document.createElement('div');
        item.className = 'shape-item';
        item.draggable = true;
        if (index === selectedShapeIndex) {
            item.classList.add('selected');
        }

        const info = document.createElement('div');
        info.className = 'shape-item-info';

        const preview = document.createElement('img');
        preview.className = 'shape-item-preview';
        preview.src = generateShapePreview(shape);
        preview.width = 32;
        preview.height = 32;

        const label = document.createElement('span');
        label.className = 'shape-item-label';
        label.textContent = `Shape ${index + 1}`;

        info.appendChild(preview);
        info.appendChild(label);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete shape';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteShape(index);
        });

        item.appendChild(info);
        item.appendChild(deleteBtn);

        // Drag and drop handlers
        item.addEventListener('dragstart', (e) => {
            setDraggedItem(index);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            setDraggedItem(null);
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem !== null && draggedItem !== index) {
                const temp = shapes[draggedItem];
                shapes.splice(draggedItem, 1);
                shapes.splice(index, 0, temp);

                // Update selectedShapeIndex to follow the correct item
                if (selectedShapeIndex === draggedItem) {
                    // Dragged item was selected, follow it to new position
                    setSelectedShapeIndex(index);
                } else if (selectedShapeIndex !== null) {
                    // Another item is selected, adjust if needed
                    if (draggedItem < index) {
                        // Dragging down: items between draggedItem and index shift up
                        if (selectedShapeIndex > draggedItem && selectedShapeIndex <= index) {
                            setSelectedShapeIndex(selectedShapeIndex - 1);
                        }
                    } else {
                        // Dragging up: items between index and draggedItem shift down
                        if (selectedShapeIndex >= index && selectedShapeIndex < draggedItem) {
                            setSelectedShapeIndex(selectedShapeIndex + 1);
                        }
                    }
                }

                updateShapeList();
                renderCanvas();
            }
        });

        item.addEventListener('click', () => {
            setSelectedShapeIndex(index);
            loadShapeToEditor(shape);
            updateShapeList();
        });

        list.appendChild(item);
    });
}

// Initialize demo list
export function initDemoList() {
    const demoList = document.getElementById('demoList');

    // Add preset demos
    Object.keys(demos).forEach(key => {
        const demo = demos[key];
        const item = document.createElement('div');
        item.className = 'demo-item';
        item.textContent = demo.name;
        item.addEventListener('click', () => loadDemo(key));
        demoList.appendChild(item);
    });

    // Add random button
    const randomItem = document.createElement('div');
    randomItem.className = 'demo-item random';
    randomItem.textContent = 'Random';
    randomItem.addEventListener('click', generateRandomDemo);
    demoList.appendChild(randomItem);
}

// Update fill UI state based on isFillNone
export function updateFillUIState() {
    const noFillBtn = document.getElementById('noFillBtn');
    const fillColorPicker = document.getElementById('fillColorPicker');
    const customColorInput = document.getElementById('customColor');
    const opacitySlider = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');

    const isDisabled = isFillNone;

    // Update button state
    noFillBtn.classList.toggle('active', isDisabled);

    // Update input disabled state and CSS class
    fillColorPicker.disabled = isDisabled;
    customColorInput.disabled = isDisabled;
    opacitySlider.disabled = isDisabled;

    fillColorPicker.classList.toggle('disabled', isDisabled);
    customColorInput.classList.toggle('disabled', isDisabled);
    opacitySlider.classList.toggle('disabled', isDisabled);
    opacityValue.classList.toggle('disabled', isDisabled);
}

// Update stroke UI state based on checkbox
export function updateStrokeUIState() {
    const strokeEnabled = document.getElementById('strokeEnabled').checked;
    const strokeFieldset = document.getElementById('strokeFieldset');
    const strokeWidthSelect = document.getElementById('strokeWidth');
    const strokeColorInput = document.getElementById('strokeColor');
    const strokeColorPicker = document.getElementById('strokeColorPicker');

    const isDisabled = !strokeEnabled;

    // Update input disabled state and CSS class
    strokeWidthSelect.disabled = isDisabled;
    strokeColorInput.disabled = isDisabled;
    strokeColorPicker.disabled = isDisabled;

    strokeFieldset.classList.toggle('disabled', isDisabled);
}

// Update knot pattern UI state based on checkbox
export function updateKnotPatternUIState() {
    const knotEnabled = document.getElementById('enableKnotPattern').checked;
    const knotFieldset = document.getElementById('knotPatternFieldset');
    const knotTurns = document.getElementById('knotTurns');
    const knotAmplitude = document.getElementById('knotAmplitude');
    const knotBaseRadius = document.getElementById('knotBaseRadius');

    const isDisabled = !knotEnabled;

    // Update input disabled state
    knotTurns.disabled = isDisabled;
    knotAmplitude.disabled = isDisabled;
    knotBaseRadius.disabled = isDisabled;

    knotFieldset.classList.toggle('disabled', isDisabled);
}

// Legacy function name - redirects to updateStrokeUIState for compatibility
export function updateStrokeColorVisibility() {
    updateStrokeUIState();
}

// Debounce timer for export previews
let exportPreviewDebounceTimer = null;

// Update export previews (debounced to avoid excessive updates during editing)
export function updateExportPreviews() {
    // Clear any pending update
    if (exportPreviewDebounceTimer) {
        clearTimeout(exportPreviewDebounceTimer);
    }

    // Schedule update after debounce delay
    exportPreviewDebounceTimer = setTimeout(() => {
        const preview64 = renderToCanvas(64);
        const preview32 = renderToCanvas(32);
        const preview16 = renderToCanvas(16);

        document.getElementById('preview64').src = preview64.toDataURL('image/png');
        document.getElementById('faviconPreview').src = preview32.toDataURL('image/png');
        document.getElementById('faviconPreview16').src = preview16.toDataURL('image/png');

        // Update SVG preview
        const svgPreviewContainer = document.getElementById('svgPreview');
        const svgContent = generateSVG(80);
        svgPreviewContainer.innerHTML = svgContent;
    }, EXPORT_PREVIEW_DEBOUNCE);
}
