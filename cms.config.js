// Dhamna's site-specific CMS contract. The central CMS stores and enforces
// the corresponding server-side allowlist; this file drives the site loader.
module.exports = {
  siteId: "6ab46563cab67088362a335e",
  contentSchema: {
    home: {
      fields: {
        "hero.eyebrow": {
          type: "text",
          label: "Homepage hero eyebrow",
          maxLength: 120,
        },
      },
    },
  },
};
