document.addEventListener('DOMContentLoaded', function() {
  initAccordions();
});

function initAccordions() {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    const header = section.querySelector('.section-header');
    if (header) {
      header.addEventListener('click', () => {
        toggleSection(section);
      });
      
      // Keyboard 
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.addEventListener('keydown', (e) => {
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
  
  // Optional: close other sections (remove these lines for multi-open)
  // const allSections = section.parentElement.querySelectorAll('.section');
  // allSections.forEach(s => s.classList.remove('expanded'));
  
  if (isExpanded) {
    section.classList.remove('expanded');
  } else {
    section.classList.add('expanded');
  }
}