// ===========================
// About Page - Swipeable Cards
// ===========================

(function() {
  function initAboutCards() {
    const grid = document.getElementById('aboutCardsGrid');
    const indicator = document.getElementById('aboutCardsIndicator');
    
    if (!grid || !indicator) return;
    
    const dots = indicator.querySelectorAll('.indicator-dot');
    const cards = grid.querySelectorAll('.about-card');
    
    if (cards.length === 0) return;
    
    // Update active dot based on scroll position
    function updateIndicator() {
      const scrollLeft = grid.scrollLeft;
      const cardWidth = cards[0].offsetWidth + 20; // Include gap
      const activeIndex = Math.round(scrollLeft / cardWidth);
      
      dots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
    
    // Listen for scroll events
    grid.addEventListener('scroll', updateIndicator);
    
    // Click on dots to scroll to card
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 20;
        grid.scrollTo({
          left: cardWidth * index,
          behavior: 'smooth'
        });
      });
    });
    
    // Initial state
    updateIndicator();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutCards);
  } else {
    initAboutCards();
  }
  
  // Re-initialize when page becomes visible (for SPA navigation)
  window.addEventListener('hashchange', () => {
    setTimeout(initAboutCards, 100);
  });
})();
