// ===========================
// Back Arrow - Navigation
// ===========================

(function() {
  const exhibitPages = ['heart', 'skeleton', 'respiratory', 'brain', 'muscle', 'fetus'];
  const aboutPages = ['about', 'disclaimer', "Virtual-tour"];
  
  function updateBackArrow() {
    const topBar = document.querySelector('.top-bar');
    const backArrow = document.querySelector('.back-arrow');
    if (!topBar || !backArrow) return;
    
    // Check which page is active
    const activePage = document.querySelector('.page-content.active');
    if (!activePage) return;
    
    const pageId = activePage.id;
    
    // Show back arrow and set correct destination
    if (exhibitPages.includes(pageId)) {
      topBar.classList.add('show-back-arrow');
      backArrow.onclick = function(e) {
        e.preventDefault();
        showPage('Virtual-tour');
      };
    } else if (aboutPages.includes(pageId)) {
      topBar.classList.add('show-back-arrow');
      backArrow.onclick = function(e) {
        e.preventDefault();
        goToHomeSection(pageId);
      };
    } else {
      topBar.classList.remove('show-back-arrow');
    }
  }
  
  function goToHomeSection(fromPage) {
    // Navigate to home first
    showPage('home');
    
    // Then scroll to the correct section after a brief delay
    setTimeout(function() {
      let targetSection;
      
      if (fromPage === 'about') {
        // About page links from section 3 (collection)
        targetSection = document.querySelector('.home-section--collection');
      } else if (fromPage === 'disclaimer') {
        // Before visiting links from section 2 (visit)
        targetSection = document.querySelector('.home-section--visit');
      } else if(fromPage === "Virtual-tour"){
        targetSection = document.querySelector('.home-section--tour')
      }
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
  
  // Initialize
  function init() {
    updateBackArrow();
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateBackArrow);
    
    // Also observe class changes on page-content elements
    const observer = new MutationObserver(updateBackArrow);
    document.querySelectorAll('.page-content').forEach(page => {
      observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
  }
  
  // Expose goToHomeSection globally if needed
  window.goToHomeSection = goToHomeSection;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();