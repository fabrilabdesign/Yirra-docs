import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Yirra Systems Documentation',
  tagline: 'Build guides, technical specifications, and developer resources for the Yirra drone platform',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.yirrasystems.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yirra-systems', // Usually your GitHub org/user name.
  projectName: 'yirra-docs', // Usually your repo name.

  onBrokenLinks: 'throw', // Fail build on broken links

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/yirra-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true, // Clean light-only experience
      respectPrefersColorScheme: false,
    },
    algolia: {
      appId: 'YOUR_APP_ID', // TODO: Set up Algolia search
      apiKey: 'YOUR_API_KEY',
      indexName: 'yirra-docs',
      contextualSearch: true,
      searchParameters: {},
      searchPagePath: false,
    },
    navbar: {
      title: 'Yirra Systems',
      logo: {
        alt: 'Yirra Systems Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          label: 'Home',
          to: '/',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Build Guide',
          position: 'left',
          items: [
            {
              label: 'Platform Overview',
              to: '/docs/platform-overview',
            },
            {
              label: 'Bill of Materials',
              to: '/docs/bill-of-materials',
            },
            {
              label: 'Tools & Materials',
              to: '/docs/tools-materials',
            },
            {
              label: '3D Models & STL / 3MF Files',
              to: '/docs/stl-files',
            },
            {
              label: '3D Printing Guide',
              to: '/docs/3d-printing-guide',
            },
            {
              label: 'Carbon Arm Preparation',
              to: '/docs/carbon-arm-preparation',
            },
            {
              label: 'Arm Bonding (DP-409 Workflow)',
              to: '/docs/arm-bonding-dp409',
            },
            {
              label: 'Assembly Guide',
              to: '/docs/assembly-guide',
            },
            {
              label: 'Firmware & Software (iNav – light)',
              to: '/docs/firmware-software-inav',
            },
            {
              label: 'Tuning & Maiden Flight (minimal)',
              to: '/docs/tuning-maiden-flight',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/troubleshooting',
            },
          ],
        },
        {
          href: 'https://yirrasystems.com',
          label: 'Store',
          position: 'right',
        },
        {
          href: 'https://yirrasystems.com/contact',
          label: 'Support',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/platform-overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Main Website',
              href: 'https://yirrasystems.com',
            },
            {
              label: 'Contact',
              href: 'https://yirrasystems.com/contact',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Products',
              href: 'https://yirrasystems.com/products',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Yirra Systems. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
