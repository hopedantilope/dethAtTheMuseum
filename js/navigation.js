// ===========================
// Main Menu Functions
// ===========================

function toggleMainMenu() {
  const menu = document.getElementById("mainMenu");
  if (menu) {
    menu.classList.toggle("open");
  }
}

function toggleSubmenu(button) {
  button.classList.toggle("expanded");
  const submenu = button.nextElementSibling;
  if (submenu && submenu.classList.contains("submenu")) {
    submenu.classList.toggle("open");
  }
}

// Close main menu when clicking outside
document.addEventListener("click", function(e) {
  const menu = document.getElementById("mainMenu");
  if (menu && menu.classList.contains("open")) {
    const nav = menu.querySelector(".main-menu-nav");
    const header = menu.querySelector(".main-menu-header");
    const menuBtn = document.querySelector(".menu-btn");
    
    if (!nav.contains(e.target) && !header.contains(e.target) && !menuBtn.contains(e.target)) {
      menu.classList.remove("open");
    }
  }
});

// ===========================
// Exhibit Navigation Control
// ===========================

// List of pages that should show the bottom exhibit nav
const exhibitPages = ['heart', 'skeleton', 'respiratory', 'nerve', 'muscle', 'fetus'];

function updateExhibitNavVisibility(pageId) {
  const exhibitNav = document.getElementById('exhibitNav');
  if (!exhibitNav) return;
  
  if (exhibitPages.includes(pageId)) {
    exhibitNav.classList.add('visible');
  } else {
    exhibitNav.classList.remove('visible');
  }
}

function updateExhibitNavTabs(exhibitId, tab) {
  const exhibitNav = document.getElementById('exhibitNav');
  if (!exhibitNav) return;
  
  // Update the onclick handlers to point to current exhibit
  const tabs = exhibitNav.querySelectorAll('.exhibit-tab');
  tabs.forEach(tabEl => {
    const panelName = tabEl.getAttribute('data-panel');
    tabEl.setAttribute('onclick', `showExhibit('${exhibitId}','${panelName}'); return false;`);
    
    // Update active state
    if (panelName === tab) {
      tabEl.classList.add('active');
    } else {
      tabEl.classList.remove('active');
    }
  });
}

// ===========================
// Page Navigation
// ===========================

function showPage(pageId, updateHash = true) {
  const pages = document.querySelectorAll(".page-content");
  pages.forEach((page) => page.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) selectedPage.classList.add("active");

  // Update exhibit nav visibility
  updateExhibitNavVisibility(pageId);

  if (selectedPage && selectedPage.hasAttribute("data-exhibit")) {
    const exhibitId = selectedPage.getAttribute("data-exhibit");
    if (exhibitId) {
      showExhibit(exhibitId, "medical", false);
      return; // showExhibit handles the rest
    }
  }

  if (updateHash) {
    history.replaceState(null, "", "#" + pageId);
  }

  closeExhibitMenu();

  if (pageId === "heart" && window.__heart3D && typeof window.__heart3D.resize === "function") {
    requestAnimationFrame(() => window.__heart3D.resize());
  }
}

function showExhibit(exhibitId, tab = "medical", updateHash = true) {
  const pages = document.querySelectorAll(".page-content");
  pages.forEach((page) => page.classList.remove("active"));

  const exhibitPage = document.getElementById(exhibitId);
  if (!exhibitPage) return;

  exhibitPage.classList.add("active");

  const panels = exhibitPage.querySelectorAll(".exhibit-panel");
  panels.forEach((p) => p.classList.remove("active"));

  const targetPanel = document.getElementById(`${exhibitId}-${tab}`);
  if (targetPanel) targetPanel.classList.add("active");
  else {
    const fallback = document.getElementById(`${exhibitId}-medical`);
    if (fallback) fallback.classList.add("active");
    tab = "medical";
  }

  // Update exhibit nav visibility and tabs
  updateExhibitNavVisibility(exhibitId);
  updateExhibitNavTabs(exhibitId, tab);

  if (updateHash) {
    history.replaceState(null, "", `#${exhibitId}/${tab}`);
  }

  closeExhibitMenu();

  if (exhibitId === "heart" && window.__heart3D && typeof window.__heart3D.resize === "function") {
    requestAnimationFrame(() => window.__heart3D.resize());
  }
  
  // Re-initialize accordions for the new content
  if (typeof initAccordions === 'function') {
    setTimeout(initAccordions, 50);
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// ===========================
// Hash Navigation
// ===========================

function loadFromHash() {
  const raw = (location.hash || "#home").slice(1).trim();
  if (!raw) return showPage("home", false);

  if (raw.includes("/")) {
    const [exhibitId, tab] = raw.split("/");
    const exhibitEl = document.getElementById(exhibitId);

    if (exhibitEl && exhibitEl.classList.contains("page-content")) {
      showExhibit(exhibitId, tab || "medical", false);
      return;
    }

    showPage("home", false);
    return;
  }

  const target = document.getElementById(raw) ? raw : "home";

  const targetEl = document.getElementById(target);
  if (targetEl && targetEl.hasAttribute("data-exhibit")) {
    showExhibit(target, "medical", false);
  } else {
    showPage(target, false);
  }
}

// ===========================
// Exhibit Menu (old overlay)
// ===========================

function openExhibitMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("exhibitMenu");
  if (menu) menu.classList.add("open");
}

function closeExhibitMenu() {
  const menu = document.getElementById("exhibitMenu");
  if (menu) menu.classList.remove("open");
}

// Close exhibit menu when clicking outside
document.addEventListener("click", function(e) {
  const menu = document.getElementById("exhibitMenu");
  if (menu && menu.classList.contains("open")) {
    const content = menu.querySelector(".menu-overlay-content");
    if (content && !content.contains(e.target)) {
      closeExhibitMenu();
    }
  }
});

// ===========================
// Keyboard Navigation
// ===========================

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeExhibitMenu();
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.classList.remove("open");
  }
});

// ===========================
// Initialize
// ===========================

window.addEventListener("DOMContentLoaded", function() {
  loadFromHash();
  
  // Make sure exhibit nav is hidden on initial load if on home
  const activePage = document.querySelector('.page-content.active');
  if (activePage) {
    updateExhibitNavVisibility(activePage.id);
  }
});

window.addEventListener("hashchange", loadFromHash);