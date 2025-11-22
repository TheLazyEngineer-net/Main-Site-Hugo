import $ from "jquery";
import * as d3 from "d3";
import { renderFlow } from "./lib/flowviewer.js";

/**
 * Parse the flow.json to get the details on the tabs/subflows present
 */
const processFlow = function (flow) {
  const tabids = [];
  const tabs = [];
  flow.forEach((d) => {
    if (d.type === "subflow") {
      tabids.push(d.id);
      tabs.push({
        id: d.id,
        label: d.name,
        type: "subslow",
      });
    } else if (d.z) {
      if (tabids.indexOf(d.z) === -1) {
        tabids.push(d.z);
        tabs.push({
          id: d.z,
          label: d.z,
          type: "tab",
        });
      }
    }
  });
  return tabs;
};

const addPanZoom = function (fv) {
  var svgs = d3.selectAll(fv.querySelectorAll("svg"));
  svgs.each(function () {
    var svg = d3.select(this);

    svg.html("<g>" + svg.html() + "</g>");
    var inner = svg.select("g");
    var zoom = d3
      .zoom()
      .translateExtent([
        [0, 0],
        [3000, 3000],
      ])
      .scaleExtent([0.5, 1])
      .on("start", function () {
        svg.classed("dragging", true);
      })
      .on("zoom", function (event) {
        inner.attr("transform", event.transform);
      })
      .on("end", function () {
        svg.classed("dragging", false);
      });
    svg.call(zoom);
  });
};

const clearFlow = function (fv) {
  fv.querySelector("svg .flowGridlines").innerHTML = "";
  fv.querySelector("svg .containerGroup").innerHTML = "";
  fv.querySelector("svg .flowGroups").innerHTML = "";
  fv.querySelector("svg .flowWires").innerHTML = "";
  fv.querySelector("svg .flowNodes").innerHTML = "";
};

const openTab = function (id, fv, flow) {
  // clear any existing flow
  clearFlow(fv);
  // draw the new flow - uses function from `public/js/flowviewer.js`
  renderFlow(id, flow, $(fv.querySelectorAll("svg")));
  addPanZoom(fv);
};

const addTab = function (tab, index, fv, flow) {
  const name = tab.type === "tab" ? "Flow " + (index + 1) : tab.label;
  $(fv)
    .children("[flowviewer-tabs]")
    .append(
      `<div flowviewer-tab=${index} id="flowviewer-tab-${index}">${name}</div>`,
    )
    .on("click", `#flowviewer-tab-${index}`, function () {
      fv.querySelectorAll("[flowviewer-tab]").forEach((t) =>
        t.classList.remove("active"),
      );
      $(this).addClass("active");
      openTab(tab.id, fv, flow);
    });
};

const getFlow = async (response) => {
  const utf8Decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  let flow = "";

  while (true) {
    const { done, value } = await reader.read();
    const chunk = value ? utf8Decoder.decode(value, { stream: true }) : "";
    flow = flow.concat(chunk);

    if (done) {
      return flow;
    }
  }
};

document.querySelectorAll("[flowviewer]").forEach((fv) => {
  const src = fv.querySelector("[flowviewer-share-details] a").href;
  fetch(src).then((response) => {
    if (!response.ok) {
      throw new Error(`could not fetch ${src}, status: ${response.status}`);
    }

    getFlow(response)
      .then((flow) => {
        // Now unescape the flow
        const entityMap = [
          { r: /&lt;/g, c: "<" },
          { r: /&gt;/g, c: ">" },
          { r: /&quot;/g, c: '"' },
          { r: /&amp;/g, c: "&" },
        ];
        entityMap.forEach((em) => {
          flow = flow.replace(em.r, em.c);
        });
        flow = JSON.parse(flow);
        // get the tabs/subflows for our provided flow
        const tabs = processFlow(flow);
        // sort them such that tabs render first
        tabs.sort((a, b) => {
          return a.type > b.type ? -1 : a.type < b.type ? 1 : 0;
        });

        tabs.forEach((tab, index) => {
          addTab(tab, index, fv, flow);
        });

        clearFlow(fv);
        renderFlow(tabs[0].id, flow, $(fv.querySelectorAll("svg")));
        addPanZoom(fv);
        $(fv.querySelector("#flowviewer-tab-0")).addClass("active");
        $(fv.querySelector("#copy-flow")).on("click", function () {
          navigator.clipboard.writeText(JSON.stringify(flow));
        });
      })
      .catch((error) => {
        console.error(`could not process flow file ${src}, ${error}`);
      });
  });
});
