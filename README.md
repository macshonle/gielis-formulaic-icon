# Gielis Formulaic Icon Maker
A client-side only web app in pure HTML/CSS/JavaScript for creating program icons, taking the concepts of circles, squircles, diamonds, and stars/lobes to their generalized form using the Superformula, also known as the [Gielis formula](https://en.wikipedia.org/wiki/Superformula).


<img width="180" height="180" alt="Nested Squares" src="https://github.com/user-attachments/assets/cfd66232-14a1-4b9e-9818-a9ee1c30bfad" />


<img width="180" height="180" alt="Descending Star" src="https://github.com/user-attachments/assets/7657ecfa-630c-44fd-9963-7fc4a5e9dbde" />


<img width="180" height="180" alt="GeminEYE" src="https://github.com/user-attachments/assets/38493b8a-c992-4883-9d67-bfb5c13b7e06" />

## Features

- **Superformula shape generation** with full control over parameters (m, n1, n2, n3, a, b)
- **Layer system** for creating complex multi-shape icons
- **Knot patterns** for additional shape modulation
- **Color palette** with custom colors, opacity, and stroke controls
- **Preset shapes** (circles, squares, stars, flowers, gears) with variations
- **Demo gallery** to explore possibilities
- **Export options**: Apple Touch Icon (180×180), Favicon (ICO), SVG, and JSON
- **Mobile responsive** design that works on iPhone and narrow displays

## Mobile Support

The app is fully responsive and works on mobile devices:

- **Adaptive layout**: Panels automatically reflow for narrow screens
- **Slide-out panels**: Layers and Import/Export panels slide in from the sides on mobile
- **Touch support**: Drag shapes with touch gestures
- **Optimized controls**: Color swatches, sliders, and parameter inputs adapt to mobile screens

See [MOBILE_SETUP.md](MOBILE_SETUP.md) for detailed mobile testing instructions.

## Development

```bash
# Install dependencies
make install

# Start development server
make dev

# Build single-file HTML bundle
make build

# Clean build artifacts
make clean
```

## Technology

- Pure vanilla JavaScript (ES6 modules)
- No framework dependencies
- Vite for bundling and development
- Single-file HTML output for easy deployment
