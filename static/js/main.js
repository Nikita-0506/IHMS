(function () {
  "use strict";

  var toggle = document.getElementById("sidebar-toggle");
  var sidebar = document.getElementById("sidebar");

  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      var hidden = sidebar.style.display === "none";
      sidebar.style.display = hidden ? "block" : "none";
    });
  }

  var themeToggle = document.getElementById("theme-toggle");
  var storageKey = "ihms-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
  }

  var persistedTheme = localStorage.getItem(storageKey);
  if (persistedTheme === "dark" || persistedTheme === "light") {
    applyTheme(persistedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
})();
