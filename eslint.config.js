import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import * as importPlugin from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'public',
      '*.config.js',
      '*.config.ts',
      'src/lib/api/schema.d.ts',
    ],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript ESLint recommended
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // React-specific settings & plugins
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: fixupPluginRules(reactPlugin),
      'react-hooks': fixupPluginRules(reactHooks),
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      'jsx-a11y': fixupPluginRules(jsxA11y),
      import: fixupPluginRules(importPlugin),
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // React 17+ doesn't need React in scope
      'react/react-in-jsx-scope': 'off',

      // Enforce .tsx extension
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],

      // Functional components preferred
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Prettier conflicts (handled by eslint-config-prettier in final extension if used, but here manually disabling some if needed,
      // typically strict airbnb might conflict slightly, but we should add prettier config AT THE END)

      // Vite React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'arrow-body-style': ['error', 'as-needed'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
);
