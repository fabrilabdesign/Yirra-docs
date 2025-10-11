module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  plugins: ['react', 'regexp'],
  parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'regexp/no-dupe-characters-character-class': 'error',
    'regexp/no-dupe-disjunctions': 'error',
    // Ban raw light-mode utility classes in JSX under dark theme; enforce tokens instead
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'JSXAttribute[name.name="className"][value.type="Literal"][value.value=/\\b(bg|text|border)-(white|black|gray-[0-9]{2,3})\\b/] ',
        message:
          'Use token-based classes (bg-surface/elev1, text-primary/secondary, border-line-*) instead of raw gray/white.',
      },
      {
        selector:
          'JSXAttribute[name.name="className"][value.type="Literal"][value.value=/hover:bg-gray-50|bg-gradient/] ',
        message:
          'Avoid light gradients and hover:bg-gray-50; use hover token overlays or flat surfaces.',
      },
    ],
  },
  settings: { react: { version: 'detect' } },
};


