// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Echo",
  tagline:
    "Unified interface for fast transaction dispatch to Ethereum block builders",
  url: "https://echo.chainbound.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/echo-logo.jpg",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
      },
      navbar: {
        title: "",
        logo: {
          alt: "Echo Logo",
          src: "img/echo-logo.jpg",
        },
        items: [
          {
            to: "/1-intro",
            label: "Intro",
            position: "left",
          },
          {
            label: "Docs",
            type: "doc",
            docId: "architecture",
            position: "left",
          },
          {
            label: "Blog",
            to: "/blog",
          },
          {
            to: "/commitment",
            label: "Our Commitment",
            position: "left",
          },
          {
            to: "/6-disclaimer",
            label: "Disclaimer",
            position: "right",
          },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Introduction",
                to: "/docs/architecture",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/J4KNdeCYGX",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/chainbound",
              },
              {
                label: "Chainbound",
                href: "https://www.chainbound.io/",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Chainbound LLC`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["rust"],
      },
    }),
};

module.exports = config;
