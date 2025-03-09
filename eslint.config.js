import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import neostandard from 'neostandard';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import rxjsX from 'eslint-plugin-rxjs-x';

export default [
  // Angular template files
  {
    files: ['**/*.html'],
    ignores: [],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      '@angular-eslint/template/no-inline-styles': ['error', { allowBindToStyle: true }],
      // '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/attributes-order': 'error',
    }
  },

  // TypeScript files
  ...neostandard({
    ts: true,
    semi: true,
    noJsx: true,
  }).map((config) => {
    // don't use neostandard's ignores because it sets it globally
    config.ignores = ['**/*.html'];
    return config;
  }),
  ...tseslint.config(
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      extends: [
        rxjsX.configs.recommended,
        tseslint.configs.recommended,
      ],
      plugins: {
        '@angular-eslint': angular,
        'unused-imports': unusedImports,
      },
      rules: {
        ...angular.configs.recommended.rules,
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/space-before-function-paren': 'off',
        'no-void': 'off',
        'accessor-pairs': 'off',
        '@angular-eslint/prefer-standalone': 'off',
      },
    }
  ),
];
