// Top level attributes (must be siblings):
//   search-bar: element containing the search input
//   search-results: ul element with a template for displaying search results
//   search-pagination: element containing the pagination templates
(async function () {
  const RESULT_EXCERPT_QUERY = "p[search-result-excerpt]";
  const RESULT_IMAGE_QUERY = "img[search-result-image]";
  const pagefind = await import("/pagefind/pagefind.js");
  const searchBars = document.querySelectorAll("[search-bar]");

  const getSingleElement = function (el, query) {
    const rets = el.querySelectorAll(query);
    const length = rets.length;

    if (length !== 1) {
      throw new Error("not exactly one element returned: " + length);
    }

    return rets[0];
  };

  searchBars.forEach(async (searchBar) => {
    const searchInput = getSingleElement(searchBar, 'input[type="search"]');
    const searchResults = getSingleElement(searchBar.parentElement, "ul[search-results]");
    const searchPagination = getSingleElement(searchBar.parentElement, "[search-pagination]");

    // Handle if the search input already has a value
    if (searchInput.value) {
      await pagefind.init();
      const search = await pagefind.search(searchInput.value);
      await showResults(search, searchResults, searchPagination, 1);
    } else {
      // Pagefind can be initialized to speed things up.  It's only applicable
      // if search is used and should be transparent to the user with a focus change.
      // It also should happen only once.
      searchInput.addEventListener("focus", async function func() {
        searchInput.removeEventListener("focus", func);
        await pagefind.init();
      });
    }

    searchInput.addEventListener("change", async (e) => {
      const search = await pagefind.search(e.target.value);
      await showResults(search, searchResults, searchPagination, 1);
    });

    searchInput.addEventListener("input", async (e) => {
      const search = await pagefind.debouncedSearch(e.target.value);
      await showResults(search, searchResults, searchPagination, 1);
    });
  });

  const showResults = async function (search, resultsList, pagination, pageNum) {
    if (search === null) {
      console.debug("null search");
      return;
    }

    const count = getIntAttribute(resultsList, "search-results-count") ?? 5;
    const resultsTemplate = getSingleElement(resultsList, "template[search-result]");

    // if something happens later, we want to retain the template
    resultsList.replaceChildren(resultsTemplate);

    const index = Math.max((pageNum - 1) * count, 0);
    const results = await Promise.all(search.results.slice(index, index + count).map((r) => r.data()));

    results
      .map((e) => toHtml(e, resultsTemplate))
      .forEach((e) => resultsList.appendChild(e));

    const pageCount = Math.ceil(search.results.length / count);
    showPagination(pageNum, pageCount, pagination, (num) =>
      showResults(search, resultsList, pagination, num),
    );
  };

  const toHtml = function (result, resultsTemplate) {
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
    const prevTemplate = getSingleElement(
      pagination,
      "template[search-pagination-prev]",
    );
    const itemTemplate = getSingleElement(
      pagination,
      "template[search-pagination-text]",
    );
    const nextTemplate = getSingleElement(
      pagination,
      "template[search-pagination-next]",
    );

    pagination.replaceChildren(prevTemplate, itemTemplate, nextTemplate);
    
    if (pageCount < 2) {
      return;
    }

    if (pageNum !== 1) {
      const onclick = () => showPage(pageNum - 1);
      createPaginationElement(prevTemplate, "", onclick, pagination);
    }

    if (pageNum >= 1) {
      const onclick = () => showPage(1);
      createPaginationElement(itemTemplate, "1", onclick, pagination);
    }

    if (pageNum > 3) {
      createPaginationElement(itemTemplate, "...", null, pagination);
    }

    let i = Math.max(pageNum - 1, 2);
    while (i < Math.min(pageNum + 2, pageCount)) {
      const pageNum = i;
      createPaginationElement(itemTemplate, pageNum, () => showPage(pageNum),  pagination);
      ++i;
    }

    if (pageNum < pageCount - 2) {
      createPaginationElement(itemTemplate, "...", null, pagination);
    }

    if (pageNum <= pageCount) {
      const onclick = () => showPage(pageCount);
      createPaginationElement(itemTemplate, pageCount, onclick, pagination);
    }

    if (pageNum < pageCount) {
      const onclick = () => showPage(pageNum + 1);
      createPaginationElement(nextTemplate, null, onclick, pagination);
    }
  };

  const createPaginationElement = function (template, value, onclick, parent) {
    let el = template.content.firstElementChild;

    if (!el || !el.isEqualNode(template.content.lastElementChild)) {
      throw new Error(
        "single element template does not contain exactly one element",
      );
    }

    el = el.cloneNode(true);

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
