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
      'https://www.sqleditor.online/blog-sitemap.xml',
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/api/*', '/_next/*', '/404', '/500'],
  generateIndexSitemap: true,
  outDir: 'public',
  transform: async (config, path) => {
    // Custom transformation for URLs
    // Set higher priority for important pages
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Important pages get higher priority
    if (path === '/about' || path === '/faq') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Set higher priority for blog posts
    if (path.startsWith('/blog/') && !path.endsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }

    // Default transformation for other pages
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }
  },
} 