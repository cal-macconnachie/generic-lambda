// ESLint configuration for a TypeScript AWS CDK project
// Uses TypeScript, Node.js, Jest, and Prettier integration

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const jestPlugin = require('eslint-plugin-jest');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: [
      'cdk.out/**',
    ],
    files: [
        '**/*.ts',
        '**/*.test.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      ecmaVersion: 2020,
      globals: {
        NodeJS: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'jest': jestPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      // Prettier integration
      'prettier/prettier': ['error', { trailingComma: 'none' }],
      // Example: allow console for AWS Lambda debugging
      'no-console': 'off',
      'no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
];
