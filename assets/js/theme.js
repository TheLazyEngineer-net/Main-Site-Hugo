// light / dark site theme setup and toggling
const defaultTheme = '{{ site.Params.theme.default | default "system"}}';
const themes = new Set(["system", "light", "dark"]);
const mediaIsDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggles = document.querySelectorAll(
  'input[theme-toggle][type="checkbox"]',
);

const isDark = function (val) {
  return val === true || val === "dark";
};

const getTheme = function (val) {
  return isDark(val) ? "dark" : "light";
};

const setPageTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", getTheme(theme));
  // checked checkbox <=> dark mode
  themeToggles.forEach((e) => (e.checked = isDark(theme)));
};

// initialization of theme on load
let theme = (t = localStorage.theme) ? t : defaultTheme;
if (!themes.has(theme)) {
  theme = "system";
}

setPageTheme(theme !== "system" ? theme : getTheme(mediaIsDark.matches));
localStorage.theme = theme;

// add change event handler to the buttons
themeToggles.forEach((el) => {
  el.addEventListener("change", (e) => {
    const isDark = e.target.checked;
    setPageTheme(isDark);
    localStorage.theme = getTheme(isDark);
  });
});

// listen for system theme changes
mediaIsDark.addEventListener("change", (e) => {
  if (!localStorage.theme) {
    localStorage.theme = "system";
  }
  if (localStorage.theme === "system") {
    setPageTheme(getTheme(e.matches));
  }
});
