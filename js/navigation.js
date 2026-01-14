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
// Page Navigation
// ===========================

function showPage(pageId, updateHash = true) {
  const pages = document.querySelectorAll(".page-content");
  pages.forEach((page) => page.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) selectedPage.classList.add("active");

  if (selectedPage && selectedPage.hasAttribute("data-exhibit")) {
    const exhibitId = selectedPage.getAttribute("data-exhibit");
    if (exhibitId) {
      showExhibit(exhibitId, "medical", false);
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

  const navLinks = exhibitPage.querySelectorAll(".exhibit-nav .exhibit-tab");
  navLinks.forEach((a) => a.classList.remove("active"));

  const activeLink = Array.from(navLinks).find((a) =>
    (a.getAttribute("onclick") || "").includes(`showExhibit('${exhibitId}','${tab}'`)
  );
  if (activeLink) activeLink.classList.add("active");

  if (updateHash) {
    history.replaceState(null, "", `#${exhibitId}/${tab}`);
  }

  closeExhibitMenu();

  if (exhibitId === "heart" && window.__heart3D && typeof window.__heart3D.resize === "function") {
    requestAnimationFrame(() => window.__heart3D.resize());
  }
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

window.addEventListener("DOMContentLoaded", loadFromHash);
window.addEventListener("hashchange", loadFromHash);