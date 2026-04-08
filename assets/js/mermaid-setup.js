let mermaidTheme = determineComputedTheme();

function getMermaidConfig(theme) {
  const isDark = theme === "dark";

  const darkVars = {
    background:           "#0d1117",
    mainBkg:              "#141b2d",
    nodeBorder:           "#2698ba",
    clusterBkg:           "#0f1623",
    clusterBorder:        "#2698ba",
    titleColor:           "#e0e0e0",
    edgeLabelBackground:  "#0d1117",
    primaryColor:         "#141b2d",
    primaryBorderColor:   "#2698ba",
    primaryTextColor:     "#e0e0e0",
    secondaryColor:       "#1a1f2e",
    secondaryBorderColor: "#c97af2",
    secondaryTextColor:   "#e0e0e0",
    tertiaryColor:        "#1a1f2e",
    tertiaryBorderColor:  "#4fc97e",
    tertiaryTextColor:    "#e0e0e0",
    lineColor:            "#4a5a6a",
    fontFamily:           "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
    fontSize:             "13px",
    textColor:            "#e0e0e0",
    errorBkgColor:        "#1a0a0a",
    errorTextColor:       "#ff6b6b",
  };

  const lightVars = {
    background:           "#ffffff",
    mainBkg:              "#f0f4f8",
    nodeBorder:           "#2698ba",
    primaryColor:         "#f0f4f8",
    primaryBorderColor:   "#2698ba",
    primaryTextColor:     "#1a1a2e",
    secondaryColor:       "#ede9f8",
    secondaryBorderColor: "#c97af2",
    secondaryTextColor:   "#1a1a2e",
    tertiaryColor:        "#e0f5ea",
    tertiaryBorderColor:  "#4fc97e",
    tertiaryTextColor:    "#1a1a2e",
    lineColor:            "#6b7280",
    fontFamily:           "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
    fontSize:             "13px",
    textColor:            "#1a1a2e",
    edgeLabelBackground:  "#ffffff",
  };

  return {
    startOnLoad: false,
    theme:       "base",
    themeVariables: isDark ? darkVars : lightVars,
    flowchart: {
      curve:       "basis",
      padding:     24,
      nodeSpacing: 44,
      rankSpacing: 54,
      htmlLabels:  true,
    },
    sequence: {
      mirrorActors: false,
      useMaxWidth:  true,
    },
  };
}

// ── openNsDiagram: expand custom .ns-diagram into the shared modal ───────────
window.openNsDiagram = function(btn) {
  var diagram = btn.closest('.ns-diagram');
  var body    = diagram && diagram.querySelector('.ns-diagram-body');
  var modal   = document.getElementById('mermaid-modal');
  var mmBody  = document.getElementById('mmBody');
  if (!body || !modal) return;
  mmBody.innerHTML = '';
  mmBody.appendChild(body.cloneNode(true));
  modal.classList.add('mm-open');
  document.body.style.overflow = 'hidden';
};

// ── Expanded view modal ──────────────────────────────────────────────────────
function injectModal() {
  if (document.getElementById("mermaid-modal")) return;

  const modal = document.createElement("div");
  modal.id = "mermaid-modal";
  modal.innerHTML = `
    <div class="mm-backdrop"></div>
    <div class="mm-panel">
      <div class="mm-header">
        <span class="mm-label">EXPANDED VIEW</span>
        <span class="mm-hint">Press ESC to close</span>
        <button class="mm-close" id="mmClose" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>
      </div>
      <div class="mm-body" id="mmBody"></div>
    </div>
  `;
  document.body.appendChild(modal);

  function closeModal() {
    modal.classList.remove("mm-open");
    document.body.style.overflow = "";
  }

  document.getElementById("mmClose").addEventListener("click", closeModal);
  modal.querySelector(".mm-backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function setupExpandable() {
  injectModal();
  const modal = document.getElementById("mermaid-modal");
  const body  = document.getElementById("mmBody");

  document.querySelectorAll(".mermaid-wrapper").forEach((wrapper) => {
    // Add expand hint
    if (!wrapper.querySelector(".mm-expand-hint")) {
      const hint = document.createElement("div");
      hint.className = "mm-expand-hint";
      hint.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Click to expand`;
      wrapper.appendChild(hint);
    }

    wrapper.style.cursor = "zoom-in";
    wrapper.addEventListener("click", () => {
      const svg = wrapper.querySelector("svg");
      if (!svg) return;
      const clone = svg.cloneNode(true);
      clone.removeAttribute("width");
      clone.removeAttribute("height");
      clone.style.width  = "100%";
      clone.style.height = "auto";
      clone.style.maxWidth = "100%";
      body.innerHTML = "";
      body.appendChild(clone);
      modal.classList.add("mm-open");
      document.body.style.overflow = "hidden";
    });
  });
}

// ── Trim empty whitespace from mermaid SVG viewBox ───────────────────────────
function trimMermaidPadding() {
  document.querySelectorAll(".mermaid-wrapper .mermaid svg").forEach(function (svg) {
    // Find the outermost content group (skip defs/style elements)
    var contentG = null;
    svg.querySelectorAll("g").forEach(function (g) {
      if (!contentG && g.childElementCount > 0) contentG = g;
    });
    if (!contentG) return;

    try {
      var box = contentG.getBBox();
      if (!box || box.width === 0 || box.height === 0) return;

      var pad = 14; // small breathing room around content
      var vx = box.x - pad;
      var vy = box.y - pad;
      var vw = box.width  + pad * 2;
      var vh = box.height + pad * 2;

      svg.setAttribute("viewBox", vx + " " + vy + " " + vw + " " + vh);
      svg.style.width  = "100%";
      svg.style.height = "auto";
      // Aspect ratio: constrain the wrapper height so it doesn't balloon
      var ratio = vh / vw;
      var wrapper = svg.closest(".mermaid-wrapper");
      if (wrapper) {
        wrapper.style.aspectRatio = (vw / vh).toFixed(3);
        wrapper.style.overflow = "hidden";
      }
    } catch (e) { /* getBBox can fail on hidden elements */ }
  });
}

// ── Main setup ───────────────────────────────────────────────────────────────
document.addEventListener("readystatechange", () => {
  if (document.readyState !== "complete") return;

  // 1. Apply custom theme
  mermaid.initialize(getMermaidConfig(mermaidTheme));

  // 2. Convert fenced ```mermaid code blocks → .mermaid elements inside wrappers
  document.querySelectorAll("pre>code.language-mermaid").forEach((elem) => {
    const svgCode = elem.textContent;
    const backup  = elem.parentElement;
    backup.classList.add("unloaded");

    const wrapper = document.createElement("div");
    wrapper.classList.add("mermaid-wrapper");

    const mermaidElem = document.createElement("pre");
    mermaidElem.classList.add("mermaid");
    mermaidElem.appendChild(document.createTextNode(svgCode));

    wrapper.appendChild(mermaidElem);
    backup.after(wrapper);
  });

  // 3. Render all .mermaid elements; after rendering add expand functionality
  const runResult = mermaid.run({ nodes: document.querySelectorAll(".mermaid") });
  const afterRender = runResult && typeof runResult.then === "function"
    ? runResult
    : Promise.resolve();

  afterRender.then(() => {
    trimMermaidPadding();
    setupExpandable();
  }).catch(() => {
    setTimeout(() => { trimMermaidPadding(); setupExpandable(); }, 800);
  });

  // 4. d3 zoom
  if (typeof d3 !== "undefined") {
    window.addEventListener("load", function () {
      d3.selectAll(".mermaid svg").each(function () {
        const svg   = d3.select(this);
        svg.html("<g>" + svg.html() + "</g>");
        const inner = svg.select("g");
        const zoom  = d3.zoom().on("zoom", (e) => inner.attr("transform", e.transform));
        svg.call(zoom);
      });
    });
  }
});
