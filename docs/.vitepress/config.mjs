import { defineConfig } from 'vitepress'
import sidebar from './configs/sidebar.mjs'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ra1ning's Blog",
  description: "Ra1ning的知识库 博客 前端",
  srcDir: './src', // md源目录
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: false,
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar,
    outline: {
      level: [1, 4],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/raining976' }
    ],
    // footer
    footer: {
      // message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Ra1ning All Rights Reserved'
    },
    // 上次修改
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
  },
  // markdown语法配置
  markdown: {
    math: true, // 允许数学表达式 插件：npm add -D markdown-it-mathjax3
    // 自定义容器
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  }
})
