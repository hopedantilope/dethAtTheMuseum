// ===========================
// Accordion / Collapsible Sections
// ===========================

document.addEventListener('DOMContentLoaded', function() {
  initAccordions();
});

function initAccordions() {
  const collapsibleSections = document.querySelectorAll('.section.collapsible');
  
  collapsibleSections.forEach(section => {
    const header = section.querySelector('.section-header');
    
    if (header && !header.hasAttribute('data-accordion-init')) {
      // Mark as initialized to prevent duplicate listeners
      header.setAttribute('data-accordion-init', 'true');
      
      // Click handler
      header.addEventListener('click', function(e) {
        // Don't toggle if clicking on a button inside header (like speak button)
        if (e.target.closest('button')) return;
        toggleSection(section);
      });
      
      // Keyboard accessibility
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', section.classList.contains('expanded') ? 'true' : 'false');
      
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSection(section);
        }
      });
    }
  });
}

function toggleSection(section) {
  const isExpanded = section.classList.contains('expanded');
  const header = section.querySelector('.section-header');
  
  if (isExpanded) {
    section.classList.remove('expanded');
    if (header) header.setAttribute('aria-expanded', 'false');
  } else {
    section.classList.add('expanded');
    if (header) header.setAttribute('aria-expanded', 'true');
  }
}

// Optional: Function to expand/collapse all sections
function expandAllSections() {
  document.querySelectorAll('.section.collapsible').forEach(section => {
    section.classList.add('expanded');
    const header = section.querySelector('.section-header');
    if (header) header.setAttribute('aria-expanded', 'true');
  });
}

function collapseAllSections() {
  document.querySelectorAll('.section.collapsible').forEach(section => {
    section.classList.remove('expanded');
    const header = section.querySelector('.section-header');
    if (header) header.setAttribute('aria-expanded', 'false');
  });
}

// Optional: Open first section by default on page load
function openFirstSection() {
  const firstCollapsible = document.querySelector('.section.collapsible');
  if (firstCollapsible) {
    firstCollapsible.classList.add('expanded');
    const header = firstCollapsible.querySelector('.section-header');
    if (header) header.setAttribute('aria-expanded', 'true');
  }
}