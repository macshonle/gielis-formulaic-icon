import { addShape, clearAll, applyPreset, updateSelectedShape, shapes, selectedShapeIndex, canvas, isFillNone, currentColor, currentStrokeColor, isDragging, dragStartX, dragStartY, dragStartCX, dragStartCY, setIsFillNone, setCurrentColor, setCurrentStrokeColor, setIsDragging, setDragStartX, setDragStartY, setDragStartCX, setDragStartCY } from './shapes.js';
import { exportAppleTouchIcon, exportFavicon, exportSVG, exportJSON, importJSON } from './export.js';
import { updateFillUIState, updateStrokeUIState, updateStrokeColorVisibility, updateKnotPatternUIState, colorSwatches } from './ui.js';
import { isPointInShape } from './rendering.js';

// Cache DOM element references for performance (initialized in setupEventListeners)
let elements = null;

// Setup all event listeners
export function setupEventListeners() {
    // Cache DOM element references now that DOM is ready
    elements = {
        // Buttons
        addShape: document.getElementById('addShape'),
        clearAll: document.getElementById('clearAll'),
        exportAppleIcon: document.getElementById('exportAppleIcon'),
        exportFavicon: document.getElementById('exportFavicon'),
        exportSVG: document.getElementById('exportSVG'),
        exportJSON: document.getElementById('exportJSON'),
        noFillBtn: document.getElementById('noFillBtn'),
        importJSONBtn: document.getElementById('importJSONBtn'),
        importJSON: document.getElementById('importJSON'),

        // Selectors
        presetSelect: document.getElementById('presetSelect'),
        variationSelect: document.getElementById('variationSelect'),

        // Color inputs
        customColor: document.getElementById('customColor'),
        fillColorPicker: document.getElementById('fillColorPicker'),
        strokeColor: document.getElementById('strokeColor'),
        strokeColorPicker: document.getElementById('strokeColorPicker'),

        // Stroke controls
        strokeEnabled: document.getElementById('strokeEnabled'),
        strokeWidth: document.getElementById('strokeWidth'),

        // Sliders and displays
        opacity: document.getElementById('opacity'),
        opacityValue: document.getElementById('opacityValue'),
        size: document.getElementById('size'),
        sizeDisplay: document.getElementById('sizeDisplay'),
        sizeValue: document.getElementById('sizeValue'),
        rotation: document.getElementById('rotation'),
        rotationDisplay: document.getElementById('rotationDisplay'),
        rotationValue: document.getElementById('rotationValue'),

        // Parameter inputs
        paramM: document.getElementById('paramM'),
        paramN1: document.getElementById('paramN1'),
        paramN2: document.getElementById('paramN2'),
        paramN3: document.getElementById('paramN3'),
        paramA: document.getElementById('paramA'),
        paramB: document.getElementById('paramB'),
        posX: document.getElementById('posX'),
        posY: document.getElementById('posY'),

        // Knot pattern controls
        enableKnotPattern: document.getElementById('enableKnotPattern'),
        knotTurns: document.getElementById('knotTurns'),
        knotAmplitude: document.getElementById('knotAmplitude'),
        knotAmplitudeDisplay: document.getElementById('knotAmplitudeDisplay'),
        knotBaseRadius: document.getElementById('knotBaseRadius'),
        knotBaseRadiusDisplay: document.getElementById('knotBaseRadiusDisplay'),

        // Stepper buttons
        lobesIncrement: document.getElementById('lobesIncrement'),
        lobesDecrement: document.getElementById('lobesDecrement'),
        turnsIncrement: document.getElementById('turnsIncrement'),
        turnsDecrement: document.getElementById('turnsDecrement')
    };

    // Button event listeners
    elements.addShape.addEventListener('click', addShape);
    elements.clearAll.addEventListener('click', clearAll);
    elements.exportAppleIcon.addEventListener('click', exportAppleTouchIcon);
    elements.exportFavicon.addEventListener('click', exportFavicon);
    elements.exportSVG.addEventListener('click', exportSVG);
    elements.exportJSON.addEventListener('click', exportJSON);

    // No fill button
    elements.noFillBtn.addEventListener('click', () => {
        setIsFillNone(!isFillNone);
        updateFillUIState();
        updateSelectedShape();
    });

    // Stroke enabled checkbox
    elements.strokeEnabled.addEventListener('change', () => {
        updateStrokeUIState();
        updateStrokeColorVisibility();
        updateSelectedShape();
    });

    // Import JSON
    elements.importJSONBtn.addEventListener('click', () => {
        elements.importJSON.click();
    });
    elements.importJSON.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importJSON(file);
        }
        e.target.value = ''; // Reset input so same file can be loaded again
    });

    // Preset selector
    elements.presetSelect.addEventListener('change', (e) => {
        applyPreset(e.target.value);
    });

    // Variation selector
    elements.variationSelect.addEventListener('change', () => {
        updateSelectedShape();
    });

    // Custom color input
    elements.customColor.addEventListener('input', (e) => {
        setCurrentColor(e.target.value);
        setIsFillNone(false);  // Disable "no fill" when color is changed
        if (colorSwatches) colorSwatches.forEach(s => s.classList.remove('selected'));
        if (e.target.value.startsWith('#')) {
            elements.fillColorPicker.value = e.target.value;
        }
        updateFillUIState();
        updateSelectedShape();
    });

    elements.fillColorPicker.addEventListener('input', (e) => {
        setCurrentColor(e.target.value);
        setIsFillNone(false);  // Disable "no fill" when color is changed
        elements.customColor.value = currentColor;
        if (colorSwatches) colorSwatches.forEach(s => s.classList.remove('selected'));
        updateFillUIState();
        updateSelectedShape();
    });

    // Stroke color inputs
    elements.strokeColor.addEventListener('input', (e) => {
        setCurrentStrokeColor(e.target.value);
        if (e.target.value.startsWith('#')) {
            elements.strokeColorPicker.value = e.target.value;
        }
        updateSelectedShape();
    });

    elements.strokeColorPicker.addEventListener('input', (e) => {
        setCurrentStrokeColor(e.target.value);
        elements.strokeColor.value = e.target.value;
        updateSelectedShape();
    });

    // Stroke width
    elements.strokeWidth.addEventListener('change', (e) => {
        updateSelectedShape();
    });

    // Opacity slider
    elements.opacity.addEventListener('input', (e) => {
        elements.opacityValue.textContent = parseFloat(e.target.value).toFixed(2);
        // Don't change isFillNone state, opacity is separate
        updateSelectedShape();
    });

    // Size slider
    elements.size.addEventListener('input', (e) => {
        elements.sizeDisplay.textContent = e.target.value;
        elements.sizeValue.value = e.target.value;
        updateSelectedShape();
    });

    // Size value input - sync with slider
    elements.sizeValue.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Clamp value between 4 and 300
            const clampedValue = Math.max(4, Math.min(300, value));
            elements.size.value = clampedValue;
            elements.sizeDisplay.textContent = clampedValue;
            updateSelectedShape();
        }
    });

    // Rotation slider
    elements.rotation.addEventListener('input', (e) => {
        elements.rotationDisplay.textContent = e.target.value;
        elements.rotationValue.value = e.target.value;
        updateSelectedShape();
    });

    // Rotation value input - sync with slider
    elements.rotationValue.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Clamp value between -180 and 180
            const clampedValue = Math.max(-180, Math.min(180, value));
            elements.rotation.value = clampedValue;
            elements.rotationDisplay.textContent = clampedValue;
            updateSelectedShape();
        }
    });

    // All number inputs update on change
    ['paramM', 'paramN1', 'paramN2', 'paramN3', 'paramA', 'paramB',
     'posX', 'posY'].forEach(id => {
        elements[id].addEventListener('input', () => {
            elements.presetSelect.value = '';
            updateSelectedShape();
        });
    });

    // Knot pattern controls
    elements.enableKnotPattern.addEventListener('change', () => {
        updateKnotPatternUIState();
        updateSelectedShape();
    });

    elements.knotTurns.addEventListener('input', () => {
        updateSelectedShape();
    });

    elements.knotAmplitude.addEventListener('input', (e) => {
        elements.knotAmplitudeDisplay.textContent = parseFloat(e.target.value).toFixed(2);
        updateSelectedShape();
    });

    elements.knotBaseRadius.addEventListener('input', (e) => {
        elements.knotBaseRadiusDisplay.textContent = parseFloat(e.target.value).toFixed(2);
        updateSelectedShape();
    });

    // Stepper buttons for Lobes
    elements.lobesIncrement.addEventListener('click', () => {
        const current = parseFloat(elements.paramM.value) || 0;
        elements.paramM.value = current + 1;
        elements.presetSelect.value = '';
        updateSelectedShape();
    });

    elements.lobesDecrement.addEventListener('click', () => {
        const current = parseFloat(elements.paramM.value) || 0;
        elements.paramM.value = Math.max(0, current - 1);
        elements.presetSelect.value = '';
        updateSelectedShape();
    });

    // Stepper buttons for Turns
    elements.turnsIncrement.addEventListener('click', () => {
        const current = parseFloat(elements.knotTurns.value) || 0;
        elements.knotTurns.value = current + 1;
        updateSelectedShape();
    });

    elements.turnsDecrement.addEventListener('click', () => {
        const current = parseFloat(elements.knotTurns.value) || 0;
        elements.knotTurns.value = Math.max(1, current - 1);
        updateSelectedShape();
    });

    // Canvas mouse event handlers for dragging shapes
    canvas.addEventListener('mousedown', (e) => {
        if (selectedShapeIndex === null || !shapes[selectedShapeIndex]) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on the selected shape
        if (isPointInShape(x, y, shapes[selectedShapeIndex])) {
            setIsDragging(true);
            setDragStartX(x);
            setDragStartY(y);
            setDragStartCX(shapes[selectedShapeIndex].cx);
            setDragStartCY(shapes[selectedShapeIndex].cy);
            canvas.style.cursor = 'move';
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging && selectedShapeIndex !== null) {
            // Calculate the movement delta
            const deltaX = x - dragStartX;
            const deltaY = y - dragStartY;

            // Update position
            const newCX = dragStartCX + deltaX;
            const newCY = dragStartCY + deltaY;

            // Update the input fields
            elements.posX.value = Math.round(newCX);
            elements.posY.value = Math.round(newCY);

            // Update the shape
            updateSelectedShape();
        } else if (selectedShapeIndex !== null && shapes[selectedShapeIndex]) {
            // Update cursor when hovering over selected shape
            if (isPointInShape(x, y, shapes[selectedShapeIndex])) {
                canvas.style.cursor = 'move';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        }
    });

    // Reset dragging state on mouseup or mouseleave
    const resetDragging = () => {
        setIsDragging(false);
        canvas.style.cursor = 'crosshair';
    };
    canvas.addEventListener('mouseup', resetDragging);
    canvas.addEventListener('mouseleave', resetDragging);

    // Touch event handlers for mobile - parallel to mouse handlers above
    canvas.addEventListener('touchstart', (e) => {
        if (selectedShapeIndex === null || !shapes[selectedShapeIndex]) {
            return;
        }

        // Prevent default to avoid scrolling while dragging
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if touching the selected shape
        if (isPointInShape(x, y, shapes[selectedShapeIndex])) {
            setIsDragging(true);
            setDragStartX(x);
            setDragStartY(y);
            setDragStartCX(shapes[selectedShapeIndex].cx);
            setDragStartCY(shapes[selectedShapeIndex].cy);
        }
    }, { passive: false }); // passive: false allows preventDefault

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || selectedShapeIndex === null) {
            return;
        }

        // Prevent default to avoid scrolling while dragging
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Calculate the movement delta
        const deltaX = x - dragStartX;
        const deltaY = y - dragStartY;

        // Update position
        const newCX = dragStartCX + deltaX;
        const newCY = dragStartCY + deltaY;

        // Update the input fields
        elements.posX.value = Math.round(newCX);
        elements.posY.value = Math.round(newCY);

        // Update the shape
        updateSelectedShape();
    }, { passive: false }); // passive: false allows preventDefault

    // Reset dragging state on touchend or touchcancel
    const resetTouchDragging = () => {
        setIsDragging(false);
    };
    canvas.addEventListener('touchend', resetTouchDragging);
    canvas.addEventListener('touchcancel', resetTouchDragging);

    // Arrow key controls for precise positioning
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when there's a selected shape
        if (selectedShapeIndex === null || !shapes[selectedShapeIndex]) {
            return;
        }

        // Check if arrow keys are pressed
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); // Prevent page scrolling

            // Get current position
            let currentX = parseFloat(elements.posX.value) || 0;
            let currentY = parseFloat(elements.posY.value) || 0;

            // Determine step size (10 pixels with Shift, 1 pixel otherwise)
            const step = e.shiftKey ? 10 : 1;

            // Update position based on arrow key
            switch (e.key) {
                case 'ArrowUp':
                    currentY -= step;
                    break;
                case 'ArrowDown':
                    currentY += step;
                    break;
                case 'ArrowLeft':
                    currentX -= step;
                    break;
                case 'ArrowRight':
                    currentX += step;
                    break;
            }

            // Update the input fields
            elements.posX.value = Math.round(currentX);
            elements.posY.value = Math.round(currentY);

            // Update the shape
            updateSelectedShape();
        }
    });
}
