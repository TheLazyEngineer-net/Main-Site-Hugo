// Top level attributes (must be siblings):
//   search-button: button element to toggle search showModal
//   search-button-modal: modal to show/hide with search-button - expected to be sibling of button
//   search-results: ul element with a template for displaying search results
//   search-pagination: element containing the pagination templates
(async function () {
  const pagefind = await import("/pagefind/pagefind.js");
  const searchBars = document.querySelectorAll("[search-bar]");
  const searchButtons = document.querySelectorAll("[search-button]");

  // throws a useful message when exactly one element is not returned
  const getSingleElement = function (el, query) {
    const rets = el.querySelectorAll(query);
    const length = rets.length;

    if (length !== 1) {
      throw new Error("not exactly one element returned: " + length);
    }

    return rets[0];
  };

  searchBars.forEach(async (bar) => {
    const input = getSingleElement(bar, 'input[type="search"]');
    const results = getSingleElement(bar.parentElement, "ul[search-results]");
    const pgn = getSingleElement(bar.parentElement, "[search-pagination]");

    if (input.value) {
      const search = await pagefind.search(input.value);
      await showResults(search, results, pgn, 1);
    }

    input.addEventListener("change", async (e) => {
      const search = await pagefind.search(e.target.value);
      await showResults(search, results, pgn, 1);
    });

    input.addEventListener("input", async (e) => {
      const search = await pagefind.debouncedSearch(e.target.value);
      await showResults(search, results, pgn, 1);
    });
  });

  searchButtons.forEach(async (b) => {
    const modal = getSingleElement(b.parentElement, "[search-button-modal]");

    b.addEventListener("click", () => modal.showModal());

    modal.addEventListener("toggle", async (e) => {
      if (e.newState === "open") {
        searchInput.focus();
      }
    });
  });

  const showResults = async function (
    search,
    resultsList,
    pagination,
    pageNum,
  ) {
    if (search === null) {
      console.debug("null search");
      return;
    }

    const count = getIntAttribute(resultsList, "search-results-count") ?? 5;
    const resultsTemplate = getSingleElement(
      resultsList,
      "template[search-result]",
    );

    // if something happens later, we want to retain the template
    resultsList.replaceChildren(resultsTemplate);

    const index = Math.max((pageNum - 1) * count, 0);
    const results = await Promise.all(
      search.results.slice(index, index + count).map((r) => r.data()),
    );

    results
      .map((e) => toHtml(e, resultsTemplate))
      .forEach((e) => resultsList.appendChild(e));

    const pageCount = Math.ceil(search.results.length / count);
    showPagination(pageNum, pageCount, pagination, (num) =>
      showResults(search, resultsList, pagination, num),
    );
  };

  const toHtml = function (result, resultsTemplate) {
    const RESULT_EXCERPT_QUERY = "p[search-result-excerpt]";
    const RESULT_IMAGE_QUERY = "img[search-result-image]";
    let res = resultsTemplate.content.cloneNode(true);

    if (result.url) {
      res
        .querySelectorAll("a[search-result-link]")
        .forEach((e) => (e.href = result.url));
    } else {
      // can't think of a way to recover from this
      throw new Error("missing URL in the search result");
    }

    const title = result.meta.title ?? "** Missing title **";
    res
      .querySelectorAll("[search-result-title]")
      .forEach((e) => (e.innerHTML = title));

    if (result.excerpt) {
      res
        .querySelectorAll(RESULT_EXCERPT_QUERY)
        .forEach((e) => (e.innerHTML = result.excerpt));
    } else {
      console.warn("search result doesn't contain excerpt");
      filterOutElements(RESULT_EXCERPT_QUERY, res);
    }

    if (result.meta.image) {
      res
        .querySelectorAll(RESULT_IMAGE_QUERY)
        .forEach((e) => (e.src = result.meta.image));
    } else {
      console.debug("search result doesn't contain image");
      filterOutElements(RESULT_IMAGE_QUERY, res);
    }

    return res;
  };

  const showPagination = function (pageNum, pageCount, pagination, showPage) {
    const template = getSingleElement(
      pagination,
      "template[search-pagination-button]",
    );

    pagination.replaceChildren(template);

    if (pageCount < 2) {
      return;
    }

    if (pageNum > 2) {
      createPaginationElement(template, "<<", () => showPage(1), pagination);
    }

    if (pageNum > 1) {
      createPaginationElement(
        template,
        "<",
        () => showPage(pageNum - 1),
        pagination,
      );
    }

    const minPageNum = Math.max(1, pageNum - 2);
    const maxPageNum = Math.min(pageCount, pageNum + 2);
    for (let i = minPageNum; i <= maxPageNum; ++i) {
      createPaginationElement(
        template,
        i.toString(),
        () => showPage(i),
        pagination,
        i === pageNum,
      );
    }

    if (pageNum < pageCount) {
      createPaginationElement(
        template,
        ">",
        () => showPage(pageNum + 1),
        pagination,
      );
    }

    if (pageNum < pageCount - 1) {
      createPaginationElement(
        template,
        ">>",
        () => showPage(pageCount),
        pagination,
      );
    }
  };

  const createPaginationElement = function (
    template,
    value,
    onclick,
    parent,
    disabled = false,
  ) {
    let el = template.content.firstElementChild;

    if (!el || !el.isEqualNode(template.content.lastElementChild)) {
      throw new Error(
        "single element template does not contain exactly one element",
      );
    }

    el = el.cloneNode(true);

    if (disabled) {
      el.setAttribute("disabled", "");
    }

    if (value) {
      el.innerHTML = value;
    }

    if (onclick) {
      el.onclick = onclick;
    }

    parent.appendChild(el);
  };

  const getIntAttribute = function (el, attr) {
    return isNaN((value = el.getAttribute(attr))) ? null : parseInt(value);
  };

  // The minor bit of trickery here is that at the top of the stack this will
  // be called with a DocumentFragment as the Node, so we don't have to worry
  // about checking the query against the Node itself since it won't have attributes.
  // If this changes, this function will need to be revised with a wrapper.
  const filterOutElements = function (query, node) {
    if (node.childElementCount === 0) {
      return;
    }

    let matches = [];
    for (let child of node.children) {
      if (child.matches(query)) {
        matches.push(child);
        continue;
      }

      filterOutElements(query, child);
    }

    matches.forEach((e) => e.remove());
  };
})();
