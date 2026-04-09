module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  skippedContentGlobs: ["_site/assets/**/*.html"],
  safelist: {
    // Protect all custom class prefixes used in the blog series
    greedy: [
      // Blog listing & post layout
      /^neo-/,
      /^post-/,
      /^toc-/,
      /^playlist/,
      // NeoSigma diagram components
      /^ns-/,
      /^mm-/,
      // Mermaid
      /^mermaid/,
      /^mermaid-/,
      // Interactive chart wrappers (all chapters)
      /^chain-/,
      /^par-/,
      /^refl-/,
      /^tool-/,
      /^plan-/,
      /^mas-/,
      /^mem-/,
      /^routing-/,
      /^sim-/,
      // Light/dark mode & theme
      /^unloaded/,
      /^active/,
      /^done/,
      /^running/,
      /^toc-active/,
      /^mm-open/,
      // Misc utility classes added dynamically via JS
      /^auto-play/,
      /^badge-/,
      /^par-badge/,
      /^par-agent/,
      /^par-demo/,
      /^par-summary/,
      /^par-timing/,
      /^par-usecase/,
      /^plan-/,
      /^deep-/,
      /^dr-/,
      /^refl-/,
      /^mas-/,
      /^mem-/,
    ],
    // Protect specific classes that appear dynamically
    standard: [
      "active", "done", "running", "unloaded", "mm-open",
      "toc-active", "mermaid", "mermaid-wrapper",
      "ns-diagram", "ns-node", "ns-phase", "ns-arrow",
      "ns-row", "ns-branch", "ns-decision",
      "neo-post-card", "neo-blog-page", "neo-blog-list",
    ],
  },
};
