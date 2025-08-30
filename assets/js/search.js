(async function () {
  const RESULT_EXCERPT_QUERY = "p[search-result-excerpt]";
  const RESULT_IMAGE_QUERY = "img[search-result-image]";
  const pagefind = await import("/pagefind/pagefind.js");
  const searchInputs = document.querySelectorAll('input[type="search"]');

  searchInputs.forEach((el) => {
    // Pagefind can be initialized to speed things up.  It's only applicable
    // if search is used and should be transparent to the user with a focus change.
    // It also should happen only once.
    el.addEventListener("focus", async function func() {
      el.removeEventListener("focus", func);
      await pagefind.init();
    });

    el.addEventListener("change", async (e) => {
      const search = await pagefind.search(e.target.value);
      await showResults(search);
    });

    el.addEventListener("input", async (e) => {
      const search = await pagefind.debouncedSearch(e.target.value);
      await showResults(search);
    });
  });

  const showResults = async function (search) {
    if (search === null) {
      console.debug("null search");
      return;
    }

    document.querySelectorAll("[search-results]").forEach(async (el) => {
      const index = getIntAttribute(el, "search-results-index") ?? 0;
      const count = getIntAttribute(el, "search-results-count") ?? 5;
      const template = getResultTemplate(el);

      // if something happens later, we want to retain the template
      el.replaceChildren(template);

      const results = await Promise.all(
        search.results.slice(index, count).map((r) => r.data()),
      );

      results.map((e) => toHtml(e, template)).forEach((e) => el.appendChild(e));
      console.log(results);
    });
  };

  const toHtml = function (result, template) {
    let res = template.content.cloneNode(true);

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
      res = filterOutElements(RESULT_EXCERPT_QUERY, res);
    }

    if (result.meta.image) {
      res
        .querySelectorAll(RESULT_IMAGE_QUERY)
        .forEach((e) => (e.src = result.meta.image));
    } else {
      console.debug("search result doesn't contain image");
      res = filterOutElements(RESULT_IMAGE_QUERY, res);
    }

    return res;
  };

  const getIntAttribute = function (el, attr) {
    return isNaN((value = el.getAttribute(attr))) ? null : value;
  };

  const getResultTemplate = function (el) {
    const templates = el.querySelectorAll("template[search-result]");

    if (templates.length !== 1) {
      throw new Error(
        "not exactly one search-result template in search-results element",
      );
    }

    return templates[0];
  };

  const filterOutElements = function (query, el) {
    // we can stop if there are no child elements to process
    if (
      el.childNodes.length === 0 ||
      (el.nodeType === Node.ELEMENT_NODE && el.childElementCount === 0)
    ) {
      return;
    }

    // we need to iterate over the nodes, not the elements
    const valid = Array.from(el.childNodes).filter(
      (c) => c.nodeType !== Node.ELEMENT_NODE || !c.matches(query),
    );

    valid.forEach((c) => {
      replacement.appendChild(filterOutElements(query, c));
    });

    return replacement;
  };
})();
