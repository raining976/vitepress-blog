import { defineConfig } from 'vitepress'
import sidebar from './configs/sidebar.mjs'
// https://vitepress.dev/reference/site-config
const links = []
export default defineConfig({
  title: "Ra1ning",
  description: "Ra1ning Ra1ning的小世界 博客 前端 Ra1ning的博客",
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'referrer', content: 'no-referrer' }], // 绕过gitee图床的防盗链
    ['meta', { name: 'keywords', content: 'Ra1ning的小世界 Ra1ning raining976 Raining HTML5 CSS JavaScript Vue 前端 操作系统 OUC' }],
    ['meta', { name: 'rebots', content: 'index,follow' }],
    ['meta', { name: 'googlebot', content: 'index,follow' }]
  ],
  srcDir: './src', // md源目录
  vite: {
    // https://cn.vitejs.dev/config/shared-options.html#publicdir
    publicDir: "../public", // 指定 public 目录路径
  },
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: false,
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: '前端',
        link: '/前端/index',
        activeMatch: '/前端/'
      },
      {
        text: '操作系统',
        link: "/操作系统/操作系统导论",
        activeMatch: '/操作系统/'
      },
      {
        text: 'OUC课程相关',
        link: '/OUC课程相关/index',
        activeMatch: '/OUC课程相关/'
      }
    ],
    sidebar,
    outline: {
      level: [1, 4],
      label: '本页目录'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/raining976' },
      {
        icon: {
          svg: '<svg t="1727778719322" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4297" width="32" height="32"><path d="M688.570182 268.288c-11.357091 0-20.782545-9.309091-20.782545-20.805818 0-11.380364 9.402182-20.736 20.782545-20.736 49.175273 0 93.905455 19.968 126.138182 52.247273l1.186909 1.256727c31.557818 32.232727 50.990545 76.311273 50.990545 124.834909 0 11.473455-9.262545 20.759273-20.759273 20.759273-11.473455 0-20.759273-9.285818-20.759273-20.759273 0-37.189818-14.871273-71.051636-38.865455-95.697455l-1.186909-1.093818C760.576 283.648 726.388364 268.288 688.570182 268.288L688.570182 268.288z" fill="#9FA0A0" p-id="4298"></path><path d="M688.570182 145.501091c-11.357091 0-20.782545-9.309091-20.782545-20.805818 0-11.426909 9.402182-20.759273 20.782545-20.759273 83.083636 0 158.487273 33.768727 212.875636 88.226909 54.528 54.481455 88.32 129.815273 88.32 212.898909 0 11.473455-9.378909 20.759273-20.875636 20.759273-11.450182 0-20.736-9.285818-20.736-20.759273 0-71.68-29.090909-136.587636-76.078545-183.621818C825.134545 174.568727 760.32 145.501091 688.570182 145.501091L688.570182 145.501091z" fill="#9FA0A0" p-id="4299"></path><path d="M880.942545 867.514182c-32.186182 32.279273-76.683636 52.386909-125.858909 52.619636L754.036364 920.133818 266.938182 920.133818c-64.325818 0-122.507636-25.995636-164.631273-68.119273l0.139636-0.093091c-42.146909-42.123636-68.235636-100.375273-68.235636-164.491636 0-61.672727 24.133818-117.829818 63.418182-159.488 34.955636-37.050182 81.92-62.673455 134.725818-70.562909 24.273455-47.36 60.532364-87.738182 104.913455-116.898909 48.546909-31.860364 106.589091-50.618182 168.680727-50.618182 84.922182 0 161.722182 34.443636 217.320727 90.018909 49.687273 49.710545 82.455273 116.293818 88.808727 190.394182 31.185455 10.705455 58.600727 29.742545 79.313455 54.528 26.507636 31.325091 42.402909 71.749818 42.402909 115.595636 0 49.687273-20.084364 94.626909-52.689455 127.115636l0-0.046545L880.942545 867.514182z" fill="#9FA0A0" p-id="4300"></path></svg>'
        },
        link: "https://nav.raining976.top"
      }
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
    search: {
      provider: 'local'
    },
    sitemap: {
      hostname: 'https://blog.raining976.top',
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
