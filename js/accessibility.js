/* ===========================
   Accessibility - Audio File Player
   Plays uploaded audio files for each section
   =========================== */

(function initAccessibility() {
  let currentAudio = null;
  let currentButton = null;

  // Map section IDs to their audio files
  const audioFiles = {
    "home-about": "audio/home-about.mp3",
    "home-hours": "audio/home-hours.mp3",
    "skeleton": "audio/skeleton.mp3",
    "respiratory": "audio/respiratory.mp3",
    "nerve": "audio/nerve.mp3",
    "gastrointestinal": "audio/gastrointestinal.mp3",
    "urogenital": "audio/urogenital.mp3",
    "muscle": "audio/muscle.mp3",
    "fetus": "audio/fetus.mp3",
    "heart-anatomy": "audio/heart-anatomy.mp3",
    "heart-physiology": "audio/heart-physiology.mp3",
    "heart-pulmonary": "audio/heart-pulmonary.mp3",
    "heart-systemic": "audio/heart-systemic.mp3",
    "heart-conduction": "audio/heart-conduction.mp3",
    "heart-disease": "audio/heart-disease.mp3",
    "heart-mi": "audio/heart-mi.mp3",
    "heart-mi-symptoms": "audio/heart-mi-symptoms.mp3",
    "heart-prevention": "audio/heart-prevention.mp3",
    "heart-more-info": "audio/heart-more-info.mp3",
    "heart-exhibition": "audio/heart-exhibition.mp3",
    "heart-history": "audio/heart-history.mp3",
    "heart-disease-panel": "audio/heart-disease-panel.mp3",
    "heart-reflections": "audio/heart-reflections.mp3",
    "disclaimer": "audio/disclaimer.mp3",
    "contact": "audio/contact.mp3",
  };

  // Stop current audio
  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    resetButton(currentButton);
    currentButton = null;
  }

  // Reset button to default state
  function resetButton(btn) {
    if (btn) {
      btn.classList.remove("speaking");
      btn.setAttribute("aria-pressed", "false");
      btn.title = "Play audio";
    }
  }

  // Play audio for a section
  function playAudio(audioId, button) {
    const audioSrc = audioFiles[audioId];

    // If clicking the same button that's playing, stop it
    if (currentButton === button && currentAudio && !currentAudio.paused) {
      stop();
      return;
    }

    // Stop any currently playing audio
    stop();

    if (!audioSrc) {
      console.warn(`No audio file mapped for: ${audioId}`);
      showNoAudioMessage(button);
      return;
    }

    // Create and play audio
    currentAudio = new Audio(audioSrc);
    currentButton = button;

    // Update button state
    button.classList.add("speaking");
    button.setAttribute("aria-pressed", "true");
    button.title = "Stop audio";

    currentAudio.addEventListener("ended", () => {
      resetButton(button);
      currentAudio = null;
      currentButton = null;
    });

    currentAudio.addEventListener("error", (e) => {
      console.warn(`Audio file not found: ${audioSrc}`);
      showNoAudioMessage(button);
      resetButton(button);
      currentAudio = null;
      currentButton = null;
    });

    currentAudio.play().catch((e) => {
      console.error("Audio playback failed:", e);
      resetButton(button);
    });
  }

  // Show message when audio file is missing
  function showNoAudioMessage(button) {
    const originalTitle = button.title;
    button.title = "Audio not available";
    button.classList.add("no-audio");

    setTimeout(() => {
      button.title = originalTitle;
      button.classList.remove("no-audio");
    }, 2000);
  }

  // Create a speak button
  function createSpeakButton(audioId) {
    const btn = document.createElement("button");
    btn.className = "speak-btn";
    btn.setAttribute("aria-label", "Play audio for this section");
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("title", "Play audio");
    btn.setAttribute("data-audio-id", audioId);
    btn.type = "button";
    btn.innerHTML = `
      <svg class="icon-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <path class="sound-waves" d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
      <svg class="icon-stop" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="1"/>
      </svg>
    `;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      playAudio(audioId, btn);
    });

    return btn;
  }

  // Add speak buttons to all sections with data-audio-id
  function addSpeakButtons() {
    const sections = document.querySelectorAll(".section[data-audio-id]");
    
    sections.forEach((section) => {
      // Skip if button already exists
      if (section.querySelector(".speak-btn")) return;

      const audioId = section.getAttribute("data-audio-id");
      if (!audioId) return;

      const btn = createSpeakButton(audioId);
      const header = section.querySelector("h2");
      
      if (header) {
        header.appendChild(btn);
      }
    });
  }

  // Stop audio when changing pages
  function stopOnPageChange() {
    if (window.showPage) {
      const originalShowPage = window.showPage;
      window.showPage = function (pageId, updateHash) {
        stop();
        return originalShowPage(pageId, updateHash);
      };
    }
  }

  // Initialize
  function init() {
    addSpeakButtons();
    stopOnPageChange();

    // Stop when page is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });

    window.addEventListener("beforeunload", stop);
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose API
  window.accessibility = {
    play: playAudio,
    stop: stop,
    audioFiles: audioFiles,
  };
})();