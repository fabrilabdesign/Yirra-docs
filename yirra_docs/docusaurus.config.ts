import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Yirra Systems Documentation',
  tagline: 'Build guides, technical specifications, and developer resources for the Yirra drone platform',
  favicon: 'img/favicon.ico',


  // Set the production url of your site here
  url: 'https://docs.yirrasystems.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yirra-systems', // Usually your GitHub org/user name.
  projectName: 'yirra-docs', // Usually your repo name.

  onBrokenLinks: 'warn', // Warn on broken links during transition

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
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Yirra Systems',
      logo: {
        alt: 'Yirra Systems Logo',
        src: 'img/drone/Logo (3).png',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Files & Parts',
          position: 'left',
          items: [
            {
              label: 'CAD Downloads',
              to: '/docs/downloads',
            },
            {
              label: 'Parts List',
              to: '/docs/bom',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Build',
          position: 'left',
          items: [
            {
              label: '3D Printing',
              to: '/docs/3d-printing',
            },
            {
              label: 'Arm Bonding',
              to: '/docs/arm-bonding',
            },
            {
              label: 'Assembly',
              to: '/docs/assembly',
            },
            {
              label: 'Firmware',
              to: '/docs/inav',
            },
          ],
        },
        {
          href: 'https://yirrasystems.com',
          label: 'Store',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Files & Parts',
          items: [
            {
              label: 'CAD Downloads',
              to: '/docs/downloads',
            },
            {
              label: 'Parts List',
              to: '/docs/bom',
            },
          ],
        },
        {
          title: 'Build',
          items: [
            {
              label: '3D Printing',
              to: '/docs/3d-printing',
            },
            {
              label: 'Arm Bonding',
              to: '/docs/arm-bonding',
            },
            {
              label: 'Assembly',
              to: '/docs/assembly',
            },
            {
              label: 'Firmware',
              to: '/docs/inav',
            },
          ],
        },
        {
          title: 'Yirra Systems',
          items: [
            {
              label: 'Store',
              href: 'https://yirrasystems.com',
            },
            {
              label: 'License',
              to: '/docs/license',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Yirra Systems<br/><small style="opacity: 0.7">Replicant GEN 1 is open hardware under CERN-OHL-W-2.0 (commercial use allowed). Battery pack internals are proprietary. Use at your own risk.</small>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
