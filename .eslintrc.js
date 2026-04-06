module.exports = {
  root: true,
  // eslint-plugin-storybook v10+ is ESM-only and breaks ESLint 8 legacy config (require).
  // Re-add when on ESLint 9 flat config.
  extends: ['airbnb-base'],
  ignorePatterns: ['stories/**', 'vitest.config.js', '.storybook/**'],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
};
