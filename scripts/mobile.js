// Mobile-specific functionality for slide-out panels

// Check if we're in mobile viewport
function isMobileViewport() {
    return window.innerWidth < 768;
}

// Create a close button for overlay panels
function createCloseButton() {
    const btn = document.createElement('button');
    btn.className = 'mobile-close-btn';
    btn.innerHTML = '&times;';
    btn.title = 'Close';
    return btn;
}

// Initialize mobile UI (toggle buttons and backdrop)
export function initMobileUI() {
    // Always create mobile UI elements - CSS will control visibility
    // This ensures they work even when page loads at desktop size then resizes

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-backdrop';
    backdrop.id = 'mobileBackdrop';
    document.body.appendChild(backdrop);

    // Create Layers toggle button
    const layersToggle = document.createElement('button');
    layersToggle.id = 'layersToggle';
    layersToggle.className = 'mobile-toggle-btn';
    layersToggle.textContent = 'Layers';
    document.body.appendChild(layersToggle);

    // Create Import/Export toggle button
    const importExportToggle = document.createElement('button');
    importExportToggle.id = 'importExportToggle';
    importExportToggle.className = 'mobile-toggle-btn';
    importExportToggle.textContent = 'Import/Export';
    document.body.appendChild(importExportToggle);

    // Get panel elements
    const layersPanel = document.querySelector('.layers-panel');
    const exportPanel = document.querySelector('.export-panel');

    // Add close buttons to panels
    const layersCloseBtn = createCloseButton();
    const exportCloseBtn = createCloseButton();
    layersPanel.insertBefore(layersCloseBtn, layersPanel.firstChild);
    exportPanel.insertBefore(exportCloseBtn, exportPanel.firstChild);

    // Close button click handlers
    layersCloseBtn.addEventListener('click', closePanels);
    exportCloseBtn.addEventListener('click', closePanels);

    // Toggle function for Layers panel
    layersToggle.addEventListener('click', () => {
        const isVisible = layersPanel.classList.contains('mobile-visible');

        if (isVisible) {
            closePanels();
        } else {
            closePanels(); // Close other panel first
            layersPanel.classList.add('mobile-visible');
            backdrop.classList.add('visible');
        }
    });

    // Toggle function for Import/Export panel
    importExportToggle.addEventListener('click', () => {
        const isVisible = exportPanel.classList.contains('mobile-visible');

        if (isVisible) {
            closePanels();
        } else {
            closePanels(); // Close other panel first
            exportPanel.classList.add('mobile-visible');
            backdrop.classList.add('visible');
        }
    });

    // Close panels when backdrop is clicked
    backdrop.addEventListener('click', closePanels);

    // Close all panels
    function closePanels() {
        layersPanel.classList.remove('mobile-visible');
        exportPanel.classList.remove('mobile-visible');
        backdrop.classList.remove('visible');
    }

    // Handle window resize - close panels if switching to desktop
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!isMobileViewport()) {
                // Close panels when switching to desktop
                // (buttons will be hidden by CSS)
                closePanels();
            }
        }, 250);
    });
}
