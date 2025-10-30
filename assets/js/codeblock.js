// Ack: https://aaronluna.dev/blog/add-copy-button-to-code-blocks-hugo-chroma/
const copyCodeToClipboard = async function (copy, highlight) {
  const codeToCopy = highlight.querySelector(
    ":last-child > .chroma > code",
  ).textContent;

  try {
    result = await navigator.permissions.query({ name: "clipboard-write" });
    if (result.state == "granted" || result.state == "prompt") {
      await navigator.clipboard.writeText(codeToCopy);
    } else {
      copyCodeBlockExecCommand(codeToCopy, highlight);
    }
  } catch (_) {
    copyCodeBlockExecCommand(codeToCopy, highlight);
  } finally {
    codeWasCopied(copy);
  }
};

const copyCodeBlockExecCommand = function (codeToCopy, highlightDiv) {
  const textArea = document.createElement("textArea");
  textArea.contentEditable = "true";
  textArea.readOnly = "false";
  textArea.className = "copyable-text-area";
  textArea.value = codeToCopy;

  highlightDiv.insertBefore(textArea, highlightDiv.firstChild);

  const range = document.createRange();
  range.selectNodeContents(textArea);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  textArea.setSelectionRange(0, 999999);
  document.execCommand("copy");
  highlightDiv.removeChild(textArea);
};

const codeWasCopied = function (copy) {
  const tooltip = copy.closest(".tooltip");
  const content = tooltip.querySelector(".tooltip-content");

  tooltip.classList.replace("tooltip-info", "tooltip-success");
  tooltip.classList.add("tooltip-open");
  content.innerText = "Copied!";

  setTimeout(() => {
    tooltip.classList.remove("tooltip-open");
    setTimeout(() => {
      tooltip.classList.replace("tooltip-success", "tooltip-info");
      content.innerText = "Copy";
    }, 250);
  }, 1500);
};

document.querySelectorAll("[codeblock]").forEach((el) => {
  const copy = el.querySelector("[codeblock-copy]");
  if (copy) {
    const highlight = el.querySelector(".highlight");
    if (!highlight) {
      throw new Error("no .hightlight in [codeblock]");
    }

    copy.addEventListener("click", () => copyCodeToClipboard(copy, highlight));
  }
});
