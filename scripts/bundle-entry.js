// Entry point that loads all scripts in the correct order
// This wraps the existing non-module scripts for Vite bundling

// Import all script files as raw text
import mathJs from './math.js?raw'
import configJs from './config.js?raw'
import shapesJs from './shapes.js?raw'
import renderingJs from './rendering.js?raw'
import uiJs from './ui.js?raw'
import exportJs from './export.js?raw'
import eventsJs from './events.js?raw'
import mainJs from './main.js?raw'

// Execute all scripts in order
const scripts = [mathJs, configJs, shapesJs, renderingJs, uiJs, exportJs, eventsJs, mainJs]
scripts.forEach(scriptContent => {
  const scriptEl = document.createElement('script')
  scriptEl.textContent = scriptContent
  document.head.appendChild(scriptEl)
})
