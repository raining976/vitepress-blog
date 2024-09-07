import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ra1ning's knowledge base",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: '前端',
        link: "/front-end/index.md"
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/raining976' }
    ]
  }
})
