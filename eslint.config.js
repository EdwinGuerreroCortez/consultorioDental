import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // DESACTIVAMOS TODAS LAS REGLAS MOLESTAS

      ...js.configs.recommended.rules,
      // React sin advertencias estrictas
      'react/prop-types': 'off',
      'react/display-name': 'off',

      // JSX
      'react/jsx-no-target-blank': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // Lógica real
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-undef': 'off',

      // MUI y JSX deep nesting
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',

      // Hot reload seguro
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true },
      ],
    },
  },
]
