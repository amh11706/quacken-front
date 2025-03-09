import angular from '@angular-eslint/eslint-plugin';
import neostandard from 'neostandard';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import rxjsX from 'eslint-plugin-rxjs-x';

export default [
  // Ignore patterns
  {
    ignores: ['projects/**/*'],
  },

  // TypeScript files
  ...neostandard({
    ts: true,
    semi: true,
  }),
  ...tseslint.config(
    tseslint.configs.recommended,
    rxjsX.configs.recommended,

    {
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
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
    },
  ),
];
