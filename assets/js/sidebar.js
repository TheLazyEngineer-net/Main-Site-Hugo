// Navigation sidebar related functionality
const rootFontSize = parseFloat(
  getComputedStyle(document.documentElement).fontSize,
);
const mdWidth =
  parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--breakpoint-md")
      .replace("rem", ""),
  ) * rootFontSize;

const connectSidebar = function (navElementId, checkboxElementId) {
  const nav = document.getElementById(navElementId);
  const checkbox = document.getElementById(checkboxElementId);

  const syncNavElement = function () {
    checkbox.checked
      ? nav.classList.remove("hidden")
      : nav.classList.add("hidden");
  };

  const checkBoxBasedOnWindowWidth = function () {
    const windowWidth = window.innerWidth;
    checkbox.checked = windowWidth >= mdWidth;
    syncNavElement();
  };

  // initialization nav elements on load
  syncNavElement();

  // add checkbox change event handler
  checkbox.addEventListener("change", syncNavElement);

  // add window resize event listener
  window.addEventListener("resize", checkBoxBasedOnWindowWidth);
};

connectSidebar("docs-nav", "docs-checkbox");
connectSidebar("toc-nav", "toc-checkbox");
