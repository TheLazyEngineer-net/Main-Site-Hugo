// Light / Dark theme setup and toggling
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themes = new Set(["system", "light", "dark"]);
  const themeToggles = document.querySelectorAll("[theme-toggle]");

  const isDark = function (val) {
    return val === true || val === "dark";
  };

  const getTheme = function (val) {
    return isDark(val) ? "dark" : "light";
  };

  const getMediaTheme = function () {
    return getTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  const setSiteTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", getTheme(theme));
    themeToggles.forEach((e) => (e.checked = isDark(theme)));
  };

  // initialization of theme on load
  let theme = (t = localStorage.theme) ? t : defaultTheme;
  if (!themes.has(theme)) {
    theme = "system";
  }

  setSiteTheme(theme === "system" ? getMediaTheme() : theme);
  localStorage.theme = theme;

  // add click event handler to the buttons
  themeToggles.forEach((el) => {
    el.addEventListener("change", function () {
      setSiteTheme(el.checked);
      localStorage.theme = getTheme(el.checked);
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.theme) {
        localStorage.theme = "system";
      }
      if (localStorage.theme === "system") {
        setSiteTheme(getTheme(e.matches));
      }
    });
})();
