// @ts-check

import typescriptEslint from 'typescript-eslint';
import eslint from '@eslint/js';
import typescriptEslintParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default typescriptEslint.config(
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  prettierConfig,
  {
    ignores: ['dist/', 'eslint.config.mjs'],
    rules: {
      // Eslint rules
      'lines-between-class-members': ['error', 'always'],
      'semi': ['error', 'always'],
      'no-multiple-empty-lines': ['error'],
      'quotes': ['error', 'single', {
        avoidEscape: true,
      }],
      'max-len': ['error', {
        code: 100,
        tabWidth: 2,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],

      // TS Eslint rules
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // Only allow unused vars if prefixed by _
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
      }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': ['error', {
        allowInterfaces: 'always',
      }],
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },
);
