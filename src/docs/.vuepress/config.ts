import { defineUserConfig, defaultTheme } from 'vuepress'
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { searchPlugin } from '@vuepress/plugin-search'

export default defineUserConfig({
  lang: 'en-US',
  title: '5150',
  description: 'An opinionated guide to technical consulting',
  base: '/',
  head: [],
  theme: defaultTheme({
    repo: 'https://github.com/dsudduth/fiftyonefifty',
    editLink: true,
    docsDir: 'docs',
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guides/' },
    ]
  }),
  plugins: [
    backToTopPlugin(),
    searchPlugin({})
  ]
})
