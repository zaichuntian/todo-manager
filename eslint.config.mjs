import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier';
import vueParser from 'vue-eslint-parser';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // 忽略文件
  {
    ignores: [
      'node_modules',
      'public',
      '*.log',
      '.idea',
      'dist/',
      'build/',
      'coverage/',
      '.env',
      '.env.local',
      '.env.*.local',
    ],
  },
  // 基础 JS 配置
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // 加入 node 环境
      },
    },
  },

  // TS 推荐规则
  tseslint.configs.recommended,

  // Vue 推荐规则
  ...pluginVue.configs['flat/essential'],

  // Prettier 格式化
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Vue 文件解析配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // 你自定义的所有规则
  {
    rules: {
      'no-var': 'error',
      'no-console': 'warn',
      'no-useless-assignment': 'off', // 在 Vue 组件中，函数在模板中使用，ESLint 无法识别
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'vue/no-param-reassign': 'off',
      'vue/html-self-closing': 'off',
      'vue/no-unknown-vue-component': 'off',
      'vue/no-any': 'off',
      'vue/multi-word-component-names': 'off', // 允许单单词组件名
    },
  },
]);
