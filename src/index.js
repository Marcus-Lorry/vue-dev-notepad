import DevNotepad from './DevNotepad.vue'

// Plugin install function
const install = (app, options = {}) => {
  // Register component globally
  app.component('DevNotepad', DevNotepad)
  
  // Add global properties/methods if needed
  app.config.globalProperties.$devNotepad = {
    // You can add global methods here if needed
  }
}

// Export for use as plugin
export { DevNotepad, install }

// Export as default for plugin usage
export default {
  install
}

// Auto-install when used via CDN
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({ install })
}