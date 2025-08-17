// Light / Dark theme toggle
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themeToggleButtons = document.querySelectorAll(".theme-toggle");

  // change theme to current value in localStorage
  toggleTheme(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  // Add click event handler to the buttons
  themeToggleButtons.forEach((el) => {
    el.addEventListener("click", function () {
      if ((theme = localStorage.getItem("theme"))) {
        toggleTheme(theme === "light");
      } else {
        toggleTheme(!document.documentElement.classList.contains("dark"));
      }
    });
  });

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (defaultTheme === "system" && !("theme" in localStorage)) {
        toggleTheme(e.matches);
      }
    });
})();
