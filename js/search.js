// ===========================
// Patient Search Functionality
// ===========================

(function() {
  // Store for patient data - will be populated on init
  let patientIndex = [];

  // ===========================
  // Build Patient Index
  // ===========================
  
  function buildPatientIndex() {
    patientIndex = [];
    
    // Find all exhibit pages
    const exhibitPages = document.querySelectorAll('.page-content[data-exhibit]');
    
    exhibitPages.forEach(exhibitPage => {
      const exhibitId = exhibitPage.getAttribute('data-exhibit');
      
      // Find the history panel within this exhibit
      const historyPanel = exhibitPage.querySelector(`#${exhibitId}-history`);
      if (!historyPanel) return;
      
      // Find all sections with patient IDs (looking for headers like "M 014", "M 011", etc.)
      const sections = historyPanel.querySelectorAll('.section');
      
      sections.forEach(section => {
        const header = section.querySelector('.section-header h2, h2');
        if (!header) return;
        
        const headerText = header.textContent.trim();
        
        // Match patient ID patterns: "M 014", "M014", "014", etc.
        // Flexible pattern to catch various formats
        const patientMatch = headerText.match(/^([A-Za-z]?\s*\d{2,4})$/);
        
        if (patientMatch || /^\d+$/.test(headerText) || /^[A-Za-z]\s*\d+/.test(headerText)) {
          patientIndex.push({
            id: headerText,
            idNormalized: headerText.replace(/\s+/g, '').toUpperCase(),
            exhibitId: exhibitId,
            exhibitName: formatExhibitName(exhibitId),
            sectionElement: section
          });
        }
      });
    });
    
    console.log('Patient index built:', patientIndex.length, 'patients found');
  }
  
  function formatExhibitName(exhibitId) {
    // Convert exhibit ID to display name
    const names = {
      'heart': 'Heart',
      'skeleton': 'Skeleton',
      'respiratory': 'Respiratory System',
      'brain': 'Brain',
      'muscle': 'Muscle',
      'fetus': 'Fetal Development'
    };
    return names[exhibitId] || exhibitId.charAt(0).toUpperCase() + exhibitId.slice(1);
  }

  // ===========================
  // Search Functions
  // ===========================
  
  function searchPatients(query) {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.replace(/\s+/g, '').toUpperCase();
    
    return patientIndex.filter(patient => {
      return patient.idNormalized.includes(normalizedQuery) ||
             patient.id.toUpperCase().includes(query.toUpperCase());
    });
  }
  
  function navigateToPatient(patient) {
    // Navigate to the exhibit's history panel
    if (typeof showExhibit === 'function') {
      showExhibit(patient.exhibitId, 'history');
    }
    
    // Close search overlay
    closeSearch();
    
    // Scroll to the specific section after a brief delay for page transition
    setTimeout(() => {
      if (patient.sectionElement) {
        // Expand the section if it's collapsible
        if (patient.sectionElement.classList.contains('collapsible') && 
            !patient.sectionElement.classList.contains('expanded')) {
          patient.sectionElement.classList.add('expanded');
        }
        
        // Scroll to the section
        patient.sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add a brief highlight effect
        patient.sectionElement.classList.add('search-highlight-section');
        setTimeout(() => {
          patient.sectionElement.classList.remove('search-highlight-section');
        }, 2000);
      }
    }, 100);
  }

  // ===========================
  // UI Functions
  // ===========================
  
  function createSearchOverlay() {
    // Check if overlay already exists
    if (document.getElementById('searchOverlay')) {
      return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <button class="search-close-btn" aria-label="Close search" onclick="closeSearch()"></button>
      <div class="search-container">
        <label class="search-label" for="patientSearchInput">Search Patient Records</label>
        <div class="search-input-wrapper">
          <img src="images/spyglass.png" alt="" class="search-icon" />
          <input 
            type="text" 
            id="patientSearchInput" 
            class="search-input" 
            placeholder="Enter patient number (e.g., M 014)"
            autocomplete="off"
          />
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add input event listener
    const input = document.getElementById('patientSearchInput');
    input.addEventListener('input', handleSearchInput);
    input.addEventListener('keydown', handleSearchKeydown);
  }
  
  function handleSearchInput(e) {
    const query = e.target.value;
    const results = searchPatients(query);
    renderSearchResults(results, query);
  }
  
  function handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      closeSearch();
    } else if (e.key === 'Enter') {
      // Navigate to first result if exists
      const firstResult = document.querySelector('.search-result-item');
      if (firstResult) {
        firstResult.click();
      }
    }
  }
  
  function renderSearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (!query || query.trim() === '') {
      container.innerHTML = '';
      return;
    }
    
    if (results.length === 0) {
      container.innerHTML = `
        <p class="search-no-results">No patients found matching "${query}"</p>
      `;
      return;
    }
    
    const resultsHtml = results.map((patient, index) => `
      <a href="#" class="search-result-item" data-index="${index}" onclick="handlePatientClick(event, ${index})">
        <div class="result-patient-id">${highlightMatch(patient.id, query)}</div>
        <div class="result-exhibit">${patient.exhibitName} Exhibition</div>
      </a>
    `).join('');
    
    container.innerHTML = `
      <div class="search-results-title">Results (${results.length})</div>
      ${resultsHtml}
    `;
    
    // Store results for click handling
    container._results = results;
  }
  
  function highlightMatch(text, query) {
    if (!query) return text;
    
    const normalizedQuery = query.replace(/\s+/g, '');
    const regex = new RegExp(`(${escapeRegex(normalizedQuery)}|${escapeRegex(query)})`, 'gi');
    
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }
  
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Global click handler for results
  window.handlePatientClick = function(e, index) {
    e.preventDefault();
    const container = document.getElementById('searchResults');
    if (container && container._results && container._results[index]) {
      navigateToPatient(container._results[index]);
    }
  };

  // ===========================
  // Open/Close Search
  // ===========================
  
  window.openSearch = function() {
    createSearchOverlay();
    
    // Rebuild index each time in case content changed
    buildPatientIndex();
    
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.classList.add('open');
      
      // Focus the input
      setTimeout(() => {
        const input = document.getElementById('patientSearchInput');
        if (input) {
          input.value = '';
          input.focus();
        }
        // Clear previous results
        const results = document.getElementById('searchResults');
        if (results) results.innerHTML = '';
      }, 100);
    }
  };
  
  window.closeSearch = function() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
  };

  // ===========================
  // Initialize
  // ===========================
  
  function init() {
    // Update search button click handlers
    const searchBtns = document.querySelectorAll('.search-btn');
    searchBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
      });
    });
    
    // Close on overlay background click
    document.addEventListener('click', function(e) {
      const overlay = document.getElementById('searchOverlay');
      if (overlay && overlay.classList.contains('open')) {
        if (e.target === overlay) {
          closeSearch();
        }
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSearch();
      }
    });
    
    // Build initial index
    buildPatientIndex();
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();