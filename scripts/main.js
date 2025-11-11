import { setCanvas, setCtx } from './shapes.js';
import { initColorPalette, initDemoList, updateFillUIState, updateStrokeUIState, updateStrokeColorVisibility } from './ui.js';
import { setupEventListeners } from './events.js';
import { renderCanvas } from './rendering.js';

// Initialize the application
export function init() {
    // Setup canvas
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    setCanvas(canvas);
    setCtx(ctx);

    // Initialize UI components
    initColorPalette();
    initDemoList();
    updateFillUIState();
    updateStrokeUIState();
    updateStrokeColorVisibility();

    // Setup event listeners
    setupEventListeners();

    // Initial render
    renderCanvas();
}
