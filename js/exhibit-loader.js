// ===========================
// Exhibit Content Loader
// ===========================

// Track which exhibits have been loaded
const loadedExhibits = {};

// Load exhibit content from HTML file
async function loadExhibitContent(exhibitId) {
  // Don't reload if already loaded
  if (loadedExhibits[exhibitId]) {
    return true;
  }
  
  const container = document.getElementById(exhibitId);
  if (!container) {
    console.error(`Exhibit container not found: ${exhibitId}`);
    return false;
  }
  
  try {
    const response = await fetch(`exhibits/${exhibitId}.html`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    container.innerHTML = html;
    loadedExhibits[exhibitId] = true;
    
    // Initialize accordions for the new content
    if (typeof initAccordions === 'function') {
      initAccordions();
    }
    
    // Special handling for heart exhibit (3D viewer)
    if (exhibitId === 'heart' && typeof initHeartViewer === 'function') {
      initHeartViewer();
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to load exhibit: ${exhibitId}`, error);
    // Show error message in container
    container.innerHTML = `
      <div class="section">
        <h2>Error Loading Content</h2>
        <p>Sorry, we couldn't load this exhibit. Please try again later.</p>
      </div>
    `;
    return false;
  }
}

// Preload all exhibits on page load (optional - for faster navigation)
async function preloadAllExhibits() {
  const exhibits = ['heart', 'skeleton', 'respiratory', 'brain', 'muscle', 'fetus'];
  
  for (const exhibitId of exhibits) {
    await loadExhibitContent(exhibitId);
  }
}

// Override showExhibit to load content first
const originalShowExhibit = window.showExhibit;

window.showExhibit = async function(exhibitId, tab = "medical", updateHash = true) {
  // Load content if not already loaded
  await loadExhibitContent(exhibitId);
  
  // Call original function
  if (typeof originalShowExhibit === 'function') {
    originalShowExhibit(exhibitId, tab, updateHash);
  }
};

// Load exhibits when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Option 1: Preload all exhibits immediately (smoother navigation, longer initial load)
  // preloadAllExhibits();
  
  // Option 2: Load exhibits on demand (faster initial load, slight delay on first visit)
  // This is handled by the showExhibit override above
  
  // Check if we're starting on an exhibit page
  const hash = location.hash.slice(1);
  if (hash && !['home', 'disclaimer', 'contact'].includes(hash.split('/')[0])) {
    const exhibitId = hash.split('/')[0];
    loadExhibitContent(exhibitId);
  }
});