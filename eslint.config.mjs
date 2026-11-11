import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginCypress from 'eslint-plugin-cypress';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  { ignores: ['node_modules/', 'cypress/videos/', 'cypress/screenshots/', 'cypress/reports/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginCypress.configs.recommended,
  prettier,
]);
