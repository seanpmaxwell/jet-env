import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';


export default tseslint.config(
  globalIgnores(['dist']),
  {
        files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/no-misused-promises': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-confusing-void-expression': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/restrict-template-expressions': [
        'error', { allowNumber: true },
      ],
      '@typescript-eslint/restrict-plus-operands': [
        'warn', { allowNumberAndString: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 0,
      '@typescript-eslint/no-unnecessary-type-parameters': 0,
      'max-len': [
        'warn',
        {
          'code': 80,
        },
      ],
      '@stylistic/ts/semi': ['warn'],
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-unused-expressions': 'warn',
      'comma-dangle': ['warn', 'always-multiline'],
      'no-console': 1,
      'no-extra-boolean-cast': 0,
      'indent': ['warn', 2],
      'quotes': ['warn', 'single'],
      'n/no-process-env': 1,
      'n/no-missing-import': 0,
      'n/no-unpublished-import': 0,
      'prefer-const': 'warn',
    },
  },
);
