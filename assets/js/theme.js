// Light / Dark theme toggle
(function () {
  const defaultTheme = "{{ site.Params.theme.default | default `system`}}";
  const themeButtons = document.querySelectorAll("button[theme-toggle]");
  const setTheme = function (isDark) {
    const theme = isDark ? "dark" : "light";
    localStorage.theme = theme;
    document.documentElement.setAttribute("theme", theme);
  };

  // change theme to current value in localStorage
  setTheme(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  // add click event handler to the buttons
  themeButtons.forEach((el) => {
    el.addEventListener("click", function () {
      const themeAttr = document.documentElement.attributes.getNamedItem("theme");
      const theme = themeAttr ? themeAttr.value : "dark";
      setTheme(theme === "light");
    });
  });

  // listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (defaultTheme === "system" && !("theme" in localStorage)) {
        setTheme(e.matches);
      }
    });
})();
