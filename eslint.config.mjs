import _import from 'eslint-plugin-import';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [{
  ignores: ['**/dist/*', '**/node_modules/**/*', '**/tsup.config.ts'],
}, ...compat.extends(
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended-type-checked',
  'prettier',
), {
  plugins: {
    import: fixupPluginRules(_import),
    '@typescript-eslint': typescriptEslint,
  },

  languageOptions: {
    globals: {
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: 5,
    sourceType: 'commonjs',

    parserOptions: {
      project: './tsconfig.json',
    },
  },

  rules: {
    'lines-between-class-members': ['error', 'always'],
    semi: ['error', 'always'],
    'no-multiple-empty-lines': ['error'],

    'operator-linebreak': ['error', 'before', {
      overrides: {
        '=': 'after',
        '+=': 'after',
        '-=': 'after',
        '*=': 'after',
        '/=': 'after',
      },
    }],

    quotes: ['error', 'single', {
      avoidEscape: true,
    }],

    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'explicit',

      overrides: {
        constructors: 'no-public',
      },
    }],

    'require-await': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/await-thenable': 'error',

    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
    }],

    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
    }],

    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': ['error'],

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
  },
}, {
  files: ['**/.eslintrc.{js,cjs}'],

  languageOptions: {
    globals: {
      ...globals.node,
    },

    ecmaVersion: 5,
    sourceType: 'commonjs',
  },
}];
