import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'test-results/**', 'artifacts/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: { ...reactHooks.configs.recommended.rules, ...jsxA11y.configs.recommended.rules },
    settings: { 'jsx-a11y': { components: { Link: 'a' } } },
  },
  { files: ['**/*.mjs'], languageOptions: { globals: globals.node } },
  {
    files: ['scripts/visual-qa.mjs', 'scripts/diagnostics-qa.mjs', 'scripts/interactive-qa.mjs', 'scripts/bake-studio.mjs', 'scripts/scroll-recording.mjs', 'scripts/creative-qa.mjs', 'scripts/record-creative.mjs', 'scripts/processor-qa.mjs', 'scripts/record-processor.mjs', 'scripts/bake-hero-posters.mjs', 'scripts/hero-resources-qa.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
