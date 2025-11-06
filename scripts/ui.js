// Initialize color palette
function initColorPalette() {
    const palette = document.getElementById('colorPalette');
    defaultPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        if (color === currentColor) {
            swatch.classList.add('selected');
        }
        swatch.addEventListener('click', () => {
            currentColor = color;
            isFillNone = false;  // Disable "no fill" when color is selected
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            document.getElementById('customColor').value = color;
            document.getElementById('fillColorPicker').value = color.startsWith('#') ? color : '#FF6B6B';
            updateFillUIState();
            updateSelectedShape();
        });
        palette.appendChild(swatch);
    });
}

// Generate shape preview thumbnail
function generateShapePreview(shape) {
    const size = 48; // Higher resolution for better quality
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = size;
    previewCanvas.height = size;
    const previewCtx = previewCanvas.getContext('2d');

    // White background
    previewCtx.fillStyle = 'white';
    previewCtx.fillRect(0, 0, size, size);

    // Create a normalized version of the shape centered in the preview
    const center = size / 2;
    const maxRadius = size * 0.4; // Leave some padding

    // Create temporary shape with adjusted position and scale for preview
    const previewShape = {
        ...shape,
        cx: center,
        cy: center,
        radius: maxRadius
    };

    // Render the shape
    renderShape(previewCtx, previewShape, 1);

    // Convert to data URL
    return previewCanvas.toDataURL('image/png');
}

// Update shape list UI
function updateShapeList() {
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
            draggedItem = index;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            draggedItem = null;
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

                if (selectedShapeIndex === draggedItem) {
                    selectedShapeIndex = index;
                } else if (selectedShapeIndex === index) {
                    selectedShapeIndex = draggedItem > index ? selectedShapeIndex + 1 : selectedShapeIndex - 1;
                }

                updateShapeList();
                renderCanvas();
            }
        });

        item.addEventListener('click', () => {
            selectedShapeIndex = index;
            loadShapeToEditor(shape);
            updateShapeList();
        });

        list.appendChild(item);
    });
}

// Initialize demo list
function initDemoList() {
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
function updateFillUIState() {
    const noFillBtn = document.getElementById('noFillBtn');
    const fillColorPicker = document.getElementById('fillColorPicker');
    const customColorInput = document.getElementById('customColor');
    const opacitySlider = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');

    if (isFillNone) {
        noFillBtn.classList.add('active');
        fillColorPicker.disabled = true;
        customColorInput.disabled = true;
        opacitySlider.disabled = true;
        fillColorPicker.style.opacity = '0.5';
        customColorInput.style.opacity = '0.5';
        opacitySlider.style.opacity = '0.5';
        opacityValue.style.opacity = '0.5';
    } else {
        noFillBtn.classList.remove('active');
        fillColorPicker.disabled = false;
        customColorInput.disabled = false;
        opacitySlider.disabled = false;
        fillColorPicker.style.opacity = '1';
        customColorInput.style.opacity = '1';
        opacitySlider.style.opacity = '1';
        opacityValue.style.opacity = '1';
    }
}

// Update stroke UI state based on isStrokeNone
function updateStrokeUIState() {
    const noStrokeBtn = document.getElementById('noStrokeBtn');
    const strokeWidthSelect = document.getElementById('strokeWidth');
    const strokeColorInput = document.getElementById('strokeColor');
    const strokeColorPicker = document.getElementById('strokeColorPicker');

    if (isStrokeNone) {
        noStrokeBtn.classList.add('active');
        // Don't disable stroke width selector - allow user to change it to re-enable
        strokeColorInput.disabled = true;
        strokeColorPicker.disabled = true;
        strokeColorInput.style.opacity = '0.5';
        strokeColorPicker.style.opacity = '0.5';
    } else {
        noStrokeBtn.classList.remove('active');
        strokeColorInput.disabled = false;
        strokeColorPicker.disabled = false;
        strokeColorInput.style.opacity = '1';
        strokeColorPicker.style.opacity = '1';
    }
}

// Update stroke color field visibility
function updateStrokeColorVisibility() {
    const strokeWidth = parseFloat(document.getElementById('strokeWidth').value);
    const strokeColorRow = document.getElementById('strokeColorRow');
    const strokeColorInput = document.getElementById('strokeColor');
    const strokeColorPicker = document.getElementById('strokeColorPicker');
    const isStrokeEnabled = strokeWidth > 0 && !isStrokeNone;

    // Disable/enable inputs instead of hiding
    strokeColorInput.disabled = !isStrokeEnabled;
    strokeColorPicker.disabled = !isStrokeEnabled;

    // Adjust opacity to indicate disabled state
    strokeColorRow.style.opacity = isStrokeEnabled ? '1' : '0.5';
    strokeColorRow.style.pointerEvents = isStrokeEnabled ? 'auto' : 'none';
}

// Update export previews
function updateExportPreviews() {
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
}
