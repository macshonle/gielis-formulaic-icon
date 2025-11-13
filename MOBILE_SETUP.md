# Mobile Responsive Setup Guide

This guide explains how to view and test the mobile responsive features added to the Gielis Icon Maker.

## Quick Start

After pulling the latest changes from the `claude/mobile-responsive-layout-011CV4RWNQPqxXqUfkPeRdYN` branch:

### Option 1: Development Server (Recommended)

```bash
# Install dependencies (if needed)
make install

# Start the development server
make dev
```

This will start a local server at `http://localhost:5173` (or another port if 5173 is busy). Open this URL in your browser and use DevTools to test mobile viewports.

### Option 2: Build and View

```bash
# Install dependencies (if needed)
make install

# Build the single-file HTML
make build

# Open the built file in your browser
open dist/gielis-icon-maker.html
# or on Linux:
xdg-open dist/gielis-icon-maker.html
```

## Testing Mobile Features

### Using Browser DevTools

1. Open the app in your browser
2. Press `F12` (or `Cmd+Opt+I` on Mac) to open DevTools
3. Click the device toolbar icon (or press `Ctrl+Shift+M` / `Cmd+Shift+M`)
4. Select a mobile device preset (e.g., iPhone SE, iPhone 12) or set a custom width < 768px

### Mobile Features to Test

When viewport width < 768px, you should see:

1. **Layout Changes:**
   - Demos panel at the top
   - Canvas below Demos
   - Colors and Shape panels stacked vertically below canvas
   - Layers and Import/Export panels hidden from normal flow

2. **Slide-Out Panels:**
   - Two blue floating buttons at bottom corners:
     - "Layers" button (bottom-right)
     - "Import/Export" button (bottom-left)
   - Tapping a button slides the panel in from the side
   - Dark backdrop appears behind the panel
   - Panel can be closed by:
     - Tapping the × close button (top-right of panel)
     - Tapping the backdrop
     - Tapping the same button again

3. **Responsive Controls:**
   - Color swatches wrap to 4+ rows
   - Lobes and Preset/Variation controls stack vertically
   - N1/N2/N3 parameters on one row, A/B on separate row
   - All sliders use full screen width

## Clean Rebuild (If Needed)

If you encounter issues, do a clean rebuild:

```bash
# Remove all build artifacts and dependencies
make clean

# Install and build from scratch
make all
```

## Mobile Breakpoints

- **< 768px**: Tablet and mobile layout
- **< 480px**: Extra compact layout for small phones
- **height < 500px**: Landscape mobile adjustments

## Files Changed

- `styles/main.css` - Mobile responsive CSS (169 lines added)
- `scripts/mobile.js` - New file for mobile UI functionality
- `scripts/main.js` - Import and initialize mobile UI
- `Makefile` - Build tooling (already existed)
- `package.json` - Dependencies (Vite 7.2.2)

## Architecture Notes

- Mobile features only activate when `window.innerWidth < 768`
- Desktop layout completely unchanged
- No breaking changes to existing functionality
- Pure CSS + vanilla JavaScript (no additional dependencies)
