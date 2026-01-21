// ===========================
// Audio Reader - Section Text-to-Speech
// ===========================

(function() {
  let currentButton = null;
  
  // Check if speech synthesis is supported
  function isSupported() {
    return 'speechSynthesis' in window;
  }
  
  // Stop any current speech
  function stopSpeech() {
    if (isSupported()) {
      window.speechSynthesis.cancel();
    }
    if (currentButton) {
      currentButton.classList.remove('playing');
      currentButton = null;
    }
  }
  
  // Speak text
  function speak(text, button) {
    if (!isSupported()) {
      alert("Sorry — text-to-speech isn't supported in this browser.");
      return;
    }
    
    // If same button clicked while playing, stop
    if (currentButton === button && window.speechSynthesis.speaking) {
      stopSpeech();
      return;
    }
    
    // Stop any current speech
    stopSpeech();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US'; // Force English language
    
    // Try to get an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang && (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Set current button and add playing class
    currentButton = button;
    button.classList.add('playing');
    
    // Handle end of speech
    utterance.onend = function() {
      if (currentButton === button) {
        button.classList.remove('playing');
        currentButton = null;
      }
    };
    
    utterance.onerror = function() {
      if (currentButton === button) {
        button.classList.remove('playing');
        currentButton = null;
      }
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }
  
  // Get text content from a section
  function getSectionText(section) {
    const content = section.querySelector('.section-content-inner') || 
                    section.querySelector('.section-content') ||
                    section;
    
    if (!content) return '';
    
    // Clone to avoid modifying original
    const clone = content.cloneNode(true);
    
    // Remove any audio buttons from clone
    clone.querySelectorAll('.section-audio-btn').forEach(btn => btn.remove());
    
    // Get text content
    return clone.innerText.trim();
  }
  
  // Get text from home/about text containers
  function getTextBlockContent(container) {
    // Clone to avoid modifying original
    const clone = container.cloneNode(true);
    
    // Remove audio buttons and links from clone
    clone.querySelectorAll('.section-audio-btn, .visit-link, .collection-link, .about-tour-link, .tour-link').forEach(el => el.remove());
    
    // Get h2 and p text
    let text = '';
    const heading = clone.querySelector('h2, h1');
    const paragraphs = clone.querySelectorAll('p');
    
    if (heading) text += heading.innerText + '. ';
    paragraphs.forEach(p => {
      text += p.innerText + ' ';
    });
    
    return text.trim();
  }
  
  // Create audio button element
  function createAudioButton() {
    const button = document.createElement('button');
    button.className = 'section-audio-btn';
    button.setAttribute('aria-label', 'Read section aloud');
    button.innerHTML = '<img src="images/volume.png" alt="Read aloud" />';
    return button;
  }
  
  // Add audio button to a collapsible section
  function addAudioButtonToSection(section) {
    // Check if button already exists
    if (section.querySelector('.section-audio-btn')) return;
    
    const header = section.querySelector('.section-header');
    if (!header) return;
    
    const button = createAudioButton();
    
    // Insert before the toggle icon
    const toggle = header.querySelector('.section-toggle');
    if (toggle) {
      header.insertBefore(button, toggle);
    } else {
      header.appendChild(button);
    }
    
    // Click handler
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Don't trigger section collapse
      
      const text = getSectionText(section);
      if (text) {
        speak(text, button);
      }
    });
  }
  
  // Add audio button to home page text blocks (visit-text, collection-text)
  function addAudioButtonToTextBlock(textBlock, getTextFn) {
    // Check if button already exists
    if (textBlock.querySelector('.section-audio-btn')) return;
    
    const button = createAudioButton();
    
    // Insert inside the heading (at the end)
    const heading = textBlock.querySelector('h1, h2');
    if (heading) {
      heading.appendChild(button);
    } else {
      textBlock.insertBefore(button, textBlock.firstChild);
    }
    
    // Click handler
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      
      const text = getTextFn(textBlock);
      if (text) {
        speak(text, button);
      }
    });
  }
  
  // Initialize audio buttons on all sections
  function initAudioButtons() {
    // Collapsible sections (exhibits, disclaimer, etc.)
    const sections = document.querySelectorAll('.section.collapsible');
    sections.forEach(addAudioButtonToSection);
    
    // Home page text blocks
    const visitTexts = document.querySelectorAll('.visit-text');
    visitTexts.forEach(block => addAudioButtonToTextBlock(block, getTextBlockContent));
    
    const collectionTexts = document.querySelectorAll('.collection-text');
    collectionTexts.forEach(block => addAudioButtonToTextBlock(block, getTextBlockContent));
    
    // About page hero text
    const aboutHeroTexts = document.querySelectorAll('.about-hero-text');
    aboutHeroTexts.forEach(block => addAudioButtonToTextBlock(block, getTextBlockContent));
    
    // About page cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach(card => {
      if (card.querySelector('.section-audio-btn')) return;
      
      const button = createAudioButton();
      
      // Insert after the image
      const image = card.querySelector('.about-card-image');
      if (image) {
        image.after(button);
      } else {
        card.insertBefore(button, card.firstChild);
      }
      
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        let text = '';
        if (h3) text += h3.innerText + '. ';
        if (p) text += p.innerText;
        
        if (text) {
          speak(text.trim(), button);
        }
      });
    });
  }
  
  // Stop speech when navigating away
  function handlePageChange() {
    stopSpeech();
  }
  
  // Initialize
  function init() {
    if (!isSupported()) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    // Load voices (some browsers load async)
    window.speechSynthesis.onvoiceschanged = function() {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.getVoices();
    
    // Add buttons to existing sections
    initAudioButtons();
    
    // Stop speech on page navigation
    window.addEventListener('hashchange', handlePageChange);
    
    // Observe for new sections being added (for SPA)
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.classList && node.classList.contains('section') && node.classList.contains('collapsible')) {
              addAudioButtonToSection(node);
            }
            // Also check children
            const childSections = node.querySelectorAll ? node.querySelectorAll('.section.collapsible') : [];
            childSections.forEach(addAudioButtonToSection);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Re-init when page becomes active (for SPA navigation)
    document.querySelectorAll('.page-content').forEach(function(page) {
      const pageObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.attributeName === 'class' && page.classList.contains('active')) {
            // Small delay to ensure content is rendered
            setTimeout(initAudioButtons, 50);
          }
        });
      });
      pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
  }
  
  // Expose stop function globally
  window.stopAudioReader = stopSpeech;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();