// Initialize the application
function init() {
    // Setup canvas
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

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

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
