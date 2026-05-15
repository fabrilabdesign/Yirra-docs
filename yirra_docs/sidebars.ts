import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'platform',
    'battery',
    {
      type: 'category',
      label: 'Licensing',
      collapsed: false,
      link: { type: 'doc', id: 'compliance/index' },
      items: [
        // Entry page — the three-door funnel
        {
          type: 'doc',
          id: 'compliance/index',
          label: 'Three doors (start here)',
        },
        // The three doors
        'compliance/free',
        'compliance/partner',
        'compliance/enterprise',
        // Reference & legal
        'compliance-guide',
        'commercial-programs',
        'license',
      ],
    },
    'downloads',
    'bom',
    '3d-printing',
    'arm-bonding',
    'assembly',
    'inav',
    'revision-history',
  ],
};

export default sidebars;
