import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quickstart',
        'getting-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/apps',
        'concepts/deployments',
        'concepts/sandboxes',
        'concepts/infrastructure-from-code',
      ],
    },
    {
      type: 'category',
      label: 'MCP',
      items: [
        'mcp/overview',
        'mcp/tools',
      ],
    },
  ],
  apiSidebar: [
    'api/overview',
    'api/authentication',
    'api/apps',
    'api/deployments',
  ],
  sdkSidebar: [
    'sdk/python',
    'sdk/javascript',
  ],
};

export default sidebars;
