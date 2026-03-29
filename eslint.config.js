import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import threeFiberConfig from '@react-three/eslint-plugin';

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...threeFiberConfig.configs.recommended,
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
