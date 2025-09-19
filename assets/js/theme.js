// Light / Dark theme setup and toggling
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themes = new Set(["system", "light", "dark"]);
  const themeToggles = document.querySelectorAll("[theme-toggle]");
  
  const getTheme = function (isDark) {
    return (isDark === true || isDark === "dark") ? "dark" : "light"
  };

  const getMediaTheme = function () {
    return getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  const setSiteTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", getTheme(theme));
  };

  // initialization of theme on load
  let theme = (t = localStorage.theme) ? t : defaultTheme;
  if (!themes.has(theme)) { theme = "system"; }

  setSiteTheme(theme === "system" ? getMediaTheme() : theme);
  localStorage.theme = theme;

  // add click event handler to the buttons
  themeToggles.forEach((el) => {
    el.addEventListener("change", function () {
      const theme = el.checked ? "light" : "dark";
      
      setSiteTheme(theme);
      localStorage.theme = theme;
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.theme) { localStorage.theme = "system"; }
      if (localStorage.theme === "system") { setSiteTheme(getTheme(e.matches)); }
    });
})();

