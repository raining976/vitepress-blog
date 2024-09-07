import { defineConfig } from 'vitepress'
import sidebar from './configs/sidebar.mjs'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ra1ning's Blog",
  description: "Ra1ning的知识库（博客）",
  srcDir: './src', // md源目录
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '前端面试', link: '/font-end' }
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/raining976' }
    ]
  }
})
