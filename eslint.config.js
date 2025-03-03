import angular from '@angular-eslint/eslint-plugin';
import neostandard from 'neostandard';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import rxjsX from 'eslint-plugin-rxjs-x';

export default [
  // Ignore patterns
  {
    ignores: ['projects/**/*']
  },

  // TypeScript files
  ...neostandard({
    ts: true,
    semi: true,
  }),
  ...tseslint.config({
    extends: [
      ...tseslint.configs.recommended,
      rxjsX.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }),

  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/space-before-function-paren': 'off',
      'no-void': 'off',
      'accessor-pairs': 'off',
    },
  }
];
