/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.sqleditor.online',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://www.sqleditor.online/sitemap.xml',
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/api/*', '/_next/*'],
  generateIndexSitemap: false,
} 