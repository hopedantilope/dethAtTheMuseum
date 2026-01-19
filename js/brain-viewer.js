// ===========================
// Brain 3D Viewer (Sketchfab)
// ===========================

(function() {
  const MODEL_UID = "e073c2590bc24daaa7323f4daa5b7784";
  
  let api = null;
  let viewerInitialized = false;
  
  // ===========================
  // Create Viewer HTML Structure
  // ===========================
  
  function createViewerStructure(container) {
    container.innerHTML = `
      <iframe id="brainSketchfabFrame" title="3D Brain Viewer" allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>
      <div class="viewer-overlay" id="brainViewerOverlay">
        <div class="viewer-loading">Loading 3D model…</div>
      </div>
      <div class="annotation-panel" id="brainAnnotationPanel">
        <div class="annotation-header">
          <span>Brain Regions</span>
          <button class="annotation-toggle" id="brainAnnotationToggle" aria-label="Toggle annotations panel">−</button>
        </div>
        <div class="annotation-list" id="brainAnnotationList"></div>
      </div>
    `;
    
    // Add toggle functionality
    const toggleBtn = document.getElementById('brainAnnotationToggle');
    const panel = document.getElementById('brainAnnotationPanel');
    
    toggleBtn.addEventListener('click', function() {
      panel.classList.toggle('collapsed');
      toggleBtn.textContent = panel.classList.contains('collapsed') ? '+' : '−';
    });
  }
  
  // ===========================
  // Loading State
  // ===========================
  
  function setLoading(on, text) {
    const overlay = document.getElementById('brainViewerOverlay');
    if (!overlay) return;
    
    if (on) {
      overlay.classList.remove('hidden');
      const loadingEl = overlay.querySelector('.viewer-loading');
      if (loadingEl && text) loadingEl.textContent = text;
    } else {
      overlay.classList.add('hidden');
    }
  }
  
  // ===========================
  // Render Annotations
  // ===========================
  
  function renderAnnotations(list) {
    const listEl = document.getElementById('brainAnnotationList');
    const panel = document.getElementById('brainAnnotationPanel');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (!Array.isArray(list) || list.length === 0) {
      // Hide panel if no annotations
      if (panel) panel.classList.add('hidden');
      return;
    }
    
    // Show panel
    if (panel) panel.classList.remove('hidden');
    
    list.forEach((annotation, index) => {
      const btn = document.createElement('button');
      btn.className = 'annotation-btn';
      btn.type = 'button';
      
      const title = document.createElement('div');
      title.className = 'anno-title';
      title.textContent = annotation.name || `Region ${index + 1}`;
      
      btn.appendChild(title);
      
      btn.addEventListener('click', function() {
        if (!api) return;
        api.gotoAnnotation(index, function(err) {
          if (err) console.warn('gotoAnnotation error:', err);
        });
      });
      
      listEl.appendChild(btn);
    });
  }
  
  // ===========================
  // Initialize Viewer
  // ===========================
  
  function initViewer() {
    const container = document.querySelector('.brain-viewer');
    if (!container) return;
    
    // Check if Sketchfab API is loaded
    if (typeof Sketchfab === 'undefined') {
      console.error('Sketchfab API not loaded');
      return;
    }
    
    // Create structure if not exists
    if (!document.getElementById('brainSketchfabFrame')) {
      createViewerStructure(container);
    }
    
    const iframe = document.getElementById('brainSketchfabFrame');
    if (!iframe) return;
    
    setLoading(true, 'Loading 3D model…');
    
    // Initialize Sketchfab client
    const client = new Sketchfab(iframe);
    
    client.init(MODEL_UID, {
      autostart: 1,
      preload: 1,
      
      // Hide all UI elements
      ui_controls: 0,
      ui_infos: 0,
      ui_stop: 0,
      ui_inspector: 0,
      ui_watermark: 0,
      ui_hint: 0,
      ui_ar: 0,
      ui_help: 0,
      ui_settings: 0,
      ui_vr: 0,
      ui_fullscreen: 0,
      ui_annotations: 0,
      
      // Dark background
      transparent: 0,
      graph_optimizer: 0,
      
      success: function(_api) {
        api = _api;
        api.start();
        
        api.addEventListener('viewerready', function() {
          setLoading(false);
          viewerInitialized = true;
          
          // Set dark background color
          api.setBackground({color: [0.05, 0.05, 0.05]}, function(err) {
            if (err) console.warn('setBackground error:', err);
          });
          
          // Fetch annotations
          api.getAnnotationList(function(err, list) {
            if (err) {
              console.warn('getAnnotationList error:', err);
              renderAnnotations([]);
              return;
            }
            renderAnnotations(list);
          });
        });
        
        api.addEventListener('error', function(e) {
          console.warn('Viewer error:', e);
          setLoading(false);
        });
      },
      
      error: function() {
        console.error('Sketchfab init error');
        setLoading(true, 'Error loading 3D model');
      }
    });
  }
  
  // ===========================
  // Observe for Brain Page
  // ===========================
  
  function checkAndInit() {
    const brainPage = document.getElementById('brain');
    const container = document.querySelector('.brain-viewer');
    
    // Only init if brain page is active and viewer exists
    if (brainPage && brainPage.classList.contains('active') && container && !viewerInitialized) {
      initViewer();
    }
  }
  
  // ===========================
  // Initialize
  // ===========================
  
  function init() {
    // Check on page load
    checkAndInit();
    
    // Also check when hash changes (navigation)
    window.addEventListener('hashchange', function() {
      setTimeout(checkAndInit, 100);
    });
    
    // Observe for class changes on brain page
    const brainPage = document.getElementById('brain');
    if (brainPage) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class') {
            checkAndInit();
          }
        });
      });
      
      observer.observe(brainPage, { attributes: true });
    }
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose for manual init if needed
  window.initBrainViewer = initViewer;
})();