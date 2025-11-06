// Setup all event listeners
function setupEventListeners() {
    // Button event listeners
    document.getElementById('addShape').addEventListener('click', addShape);
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('exportAppleIcon').addEventListener('click', exportAppleTouchIcon);
    document.getElementById('exportFavicon').addEventListener('click', exportFavicon);
    document.getElementById('exportSVG').addEventListener('click', exportSVG);
    document.getElementById('exportJSON').addEventListener('click', exportJSON);

    // No fill button
    document.getElementById('noFillBtn').addEventListener('click', () => {
        isFillNone = !isFillNone;
        updateFillUIState();
        updateSelectedShape();
    });

    // No stroke button
    document.getElementById('noStrokeBtn').addEventListener('click', () => {
        isStrokeNone = !isStrokeNone;
        updateStrokeUIState();
        updateStrokeColorVisibility();
        updateSelectedShape();
    });

    // Import JSON
    document.getElementById('importJSONBtn').addEventListener('click', () => {
        document.getElementById('importJSON').click();
    });
    document.getElementById('importJSON').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importJSON(file);
        }
        e.target.value = ''; // Reset input so same file can be loaded again
    });

    // Preset selector
    document.getElementById('presetSelect').addEventListener('change', (e) => {
        applyPreset(e.target.value);
    });

    // Custom color input
    document.getElementById('customColor').addEventListener('input', (e) => {
        currentColor = e.target.value;
        isFillNone = false;  // Disable "no fill" when color is changed
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        if (e.target.value.startsWith('#')) {
            document.getElementById('fillColorPicker').value = e.target.value;
        }
        updateFillUIState();
        updateSelectedShape();
    });

    document.getElementById('fillColorPicker').addEventListener('input', (e) => {
        currentColor = e.target.value;
        isFillNone = false;  // Disable "no fill" when color is changed
        document.getElementById('customColor').value = currentColor;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        updateFillUIState();
        updateSelectedShape();
    });

    // Stroke color inputs
    document.getElementById('strokeColor').addEventListener('input', (e) => {
        currentStrokeColor = e.target.value;
        if (e.target.value.startsWith('#')) {
            document.getElementById('strokeColorPicker').value = e.target.value;
        }
        // Don't change isStrokeNone state, just update the color
        updateSelectedShape();
    });

    document.getElementById('strokeColorPicker').addEventListener('input', (e) => {
        currentStrokeColor = e.target.value;
        document.getElementById('strokeColor').value = e.target.value;
        // Don't change isStrokeNone state, just update the color
        updateSelectedShape();
    });

    // Stroke width
    document.getElementById('strokeWidth').addEventListener('change', (e) => {
        if (parseFloat(e.target.value) > 0) {
            isStrokeNone = false;  // Disable "no stroke" when width > 0
            updateStrokeUIState();
        }
        updateStrokeColorVisibility();
        updateSelectedShape();
    });

    // Opacity slider
    document.getElementById('opacity').addEventListener('input', (e) => {
        currentOpacity = parseFloat(e.target.value);
        document.getElementById('opacityValue').textContent = currentOpacity.toFixed(2);
        // Don't change isFillNone state, opacity is separate
        updateSelectedShape();
    });

    // Size and rotation sliders
    document.getElementById('size').addEventListener('input', (e) => {
        document.getElementById('sizeValue').textContent = e.target.value;
        updateSelectedShape();
    });

    document.getElementById('rotation').addEventListener('input', (e) => {
        document.getElementById('rotationValue').value = e.target.value;
        updateSelectedShape();
    });

    // Rotation value input - sync with slider
    document.getElementById('rotationValue').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Clamp value between 0 and 360
            const clampedValue = Math.max(0, Math.min(360, value));
            document.getElementById('rotation').value = clampedValue;
            updateSelectedShape();
        }
    });

    // All number inputs update on change
    ['paramM', 'paramN1', 'paramN2', 'paramN3', 'paramA', 'paramB',
     'posX', 'posY'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            document.getElementById('presetSelect').value = '';
            updateSelectedShape();
        });
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
            isDragging = true;
            dragStartX = x;
            dragStartY = y;
            dragStartCX = shapes[selectedShapeIndex].cx;
            dragStartCY = shapes[selectedShapeIndex].cy;
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
            document.getElementById('posX').value = Math.round(newCX);
            document.getElementById('posY').value = Math.round(newCY);

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

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });

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
            const posXInput = document.getElementById('posX');
            const posYInput = document.getElementById('posY');
            let currentX = parseFloat(posXInput.value) || 0;
            let currentY = parseFloat(posYInput.value) || 0;

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
            posXInput.value = Math.round(currentX);
            posYInput.value = Math.round(currentY);

            // Update the shape
            updateSelectedShape();
        }
    });
}
