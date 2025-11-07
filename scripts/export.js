// Export apple touch icon
function exportAppleTouchIcon() {
    const iconCanvas = renderToCanvas(180);
    iconCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'apple-touch-icon.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Create ICO file with multiple sizes
function createIcoFile(sizes) {
    const images = sizes.map(size => {
        const canvas = renderToCanvas(size);
        return {
            size: size,
            canvas: canvas,
            imageData: canvas.getContext('2d').getImageData(0, 0, size, size)
        };
    });

    let offset = 6 + (images.length * 16);
    const imageBuffers = images.map(img => createBMPData(img.imageData));

    const totalSize = offset + imageBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, images.length, true);

    let currentOffset = offset;
    images.forEach((img, i) => {
        const entryOffset = 6 + (i * 16);
        const imageSize = imageBuffers[i].byteLength;

        view.setUint8(entryOffset, img.size === 256 ? 0 : img.size);
        view.setUint8(entryOffset + 1, img.size === 256 ? 0 : img.size);
        view.setUint8(entryOffset + 2, 0);
        view.setUint8(entryOffset + 3, 0);
        view.setUint16(entryOffset + 4, 1, true);
        view.setUint16(entryOffset + 6, 32, true);
        view.setUint32(entryOffset + 8, imageSize, true);
        view.setUint32(entryOffset + 12, currentOffset, true);

        currentOffset += imageSize;
    });

    currentOffset = offset;
    imageBuffers.forEach(imgBuffer => {
        uint8View.set(new Uint8Array(imgBuffer), currentOffset);
        currentOffset += imgBuffer.byteLength;
    });

    return buffer;
}

// Create BMP data for ICO format
function createBMPData(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const headerSize = 40;
    const imageSize = width * height * 4;

    const maskRowSize = Math.ceil(Math.ceil(width / 8) / 4) * 4;
    const maskSize = maskRowSize * height;
    const totalSize = headerSize + imageSize + maskSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8View = new Uint8Array(buffer);

    view.setUint32(0, headerSize, true);
    view.setInt32(4, width, true);
    view.setInt32(8, height * 2, true);
    view.setUint16(12, 1, true);
    view.setUint16(14, 32, true);
    view.setUint32(16, 0, true);
    view.setUint32(20, imageSize + maskSize, true);
    view.setInt32(24, 0, true);
    view.setInt32(28, 0, true);
    view.setUint32(32, 0, true);
    view.setUint32(36, 0, true);

    let offset = headerSize;
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const srcOffset = (y * width + x) * 4;
            uint8View[offset++] = imageData.data[srcOffset + 2];
            uint8View[offset++] = imageData.data[srcOffset + 1];
            uint8View[offset++] = imageData.data[srcOffset];
            uint8View[offset++] = imageData.data[srcOffset + 3];
        }
    }

    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < maskRowSize; x++) {
            uint8View[offset++] = 0;
        }
    }

    return buffer;
}

// Export favicon
function exportFavicon() {
    const sizes = [16, 32, 48, 64, 128, 256];
    const icoData = createIcoFile(sizes);
    const blob = new Blob([icoData], { type: 'image/x-icon' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon.ico';
    a.click();
    URL.revokeObjectURL(url);
}

// Export constants
const SVG_STEPS = 360; // Number of points for SVG paths (balances smoothness and file size)
const FAVICON_SIZES = [16, 32, 64]; // Standard favicon sizes in pixels

// Generate SVG path data for a shape
function generateSVGPath(shape) {
    const {cx, cy, radius, rotation, m, n1, n2, n3, a, b} = shape;
    const steps = SVG_STEPS;
    const pathParts = [];

    for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        const r = superformulaR(theta, {m, n1, n2, n3, a, b});
        const ang = theta + rotation;
        const x = cx + (radius * r * Math.cos(ang));
        const y = cy + (radius * r * Math.sin(ang));

        if (i === 0) {
            pathParts.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
        } else {
            pathParts.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
        }
    }

    pathParts.push('Z'); // Close path
    return pathParts.join(' ');
}

// Generate complete SVG document
function generateSVG(size = 384) {
    const svgParts = [];
    svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    svgParts.push(`<svg width="${size}" height="${size}" viewBox="0 0 384 384" xmlns="http://www.w3.org/2000/svg">`);

    // White background
    svgParts.push(`  <rect width="384" height="384" fill="white"/>`);

    // Render each shape
    shapes.forEach((shape, index) => {
        const pathData = generateSVGPath(shape);
        const hasFill = shape.fillColor && shape.fillColor !== 'none';
        const hasStroke = shape.strokeWidth > 0;

        let fillAttr = hasFill ? `fill="${shape.fillColor}"` : 'fill="none"';
        let strokeAttr = hasStroke ? `stroke="${shape.strokeColor}" stroke-width="${shape.strokeWidth}"` : 'stroke="none"';

        svgParts.push(`  <path d="${pathData}" ${fillAttr} ${strokeAttr}/>`);
    });

    svgParts.push(`</svg>`);
    return svgParts.join('\n');
}

// Export as SVG
function exportSVG() {
    const svgContent = generateSVG(384);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon.svg';
    a.click();
    URL.revokeObjectURL(url);
}

// Export as JSON
function exportJSON() {
    const data = {
        version: "1.0",
        shapes: shapes
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon-layers.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import from JSON
function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.shapes && Array.isArray(data.shapes)) {
                shapes = data.shapes;
                selectedShapeIndex = null;
                updateShapeList();
                renderCanvas();
                updateExportPreviews();
            } else {
                alert('Invalid JSON file format. Expected a "shapes" array.');
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}
