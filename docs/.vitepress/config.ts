// .vitepress/config.ts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'requestify.js',
  description: 'Лёгкий и расширяемый HTTP-клиент с поддержкой middleware.',
  lang: 'ru-RU',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', items: [
        {text: 'Installation', link: '/installation'},
        {text: 'Methoods', link: '/methoods'},
        {text: 'Helpers', link: '/helpers'},
        {text: 'Migrations', link: '/migrations'},
      ] },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Installation', link: '/installation' }
        ],
      },
      {
        text: 'Methoods',
        items: [
          { text: 'Config', link: '/methoods/base-config' },
          { text: 'GET', link: '/methoods/get' },
          { text: 'POST', link: '/methoods/post' },
          { text: 'PUT', link: '/methoods/put' },
          { text: 'PATCH', link: '/methoods/patch' },
          { text: 'DELETE', link: '/methoods/delete' },
          { text: 'middleware', link: '/methoods/middleware' },
          { text: 'registerMiddleware', link: '/methoods/register-middleware' },
          { text: 'removeMiddleware', link: '/methoods/remove-middleware' },
          { text: 'copy', link: '/methoods/copy' },
        ],
      },
      {
        text: 'Helpers',
        items: [
          { text: 'defineMiddleware', link: '/helpers/define-middleware' },
        ],
      },
      {
        text: 'Migrations',
        items: [
          { text: 'How to migrate to v1 from v2', link: '/migrations/v1-v2' },
        ],
      },
      {
        text: 'Other',
        items: [
          { text: 'Best practices', link: '/others/best-practices' },
        ],
      },
    ],
  },
});
