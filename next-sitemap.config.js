/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://litesql.online',
  generateRobotsTxt: false, // Disable auto-generation to use custom robots.txt
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    // Deliberately empty. This list previously named sitemap.xml (the index
    // itself, so it referenced itself) and blog-sitemap.xml, which has never
    // existed and returned 404. sitemap-0.xml, generated from the build
    // manifest below, already covers every route including all eight blog
    // posts, so there is nothing left to add by hand.
    additionalSitemaps: [],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/api/*', '/_next/*', '/404', '/500'],
  generateIndexSitemap: true,
  outDir: 'public',
  // Every route now lives under src/app/[locale], so next-sitemap sees only a
  // dynamic segment in the build manifest and cannot enumerate pages on its
  // own — left alone it emits a sitemap containing one URL and not the
  // homepage. These are the default-locale paths, which localePrefix:
  // 'as-needed' serves unprefixed. The prefixed locales are deliberately
  // absent: every one of them currently declares the unprefixed URL as its
  // canonical, so listing them would ask Google to crawl pages that disclaim
  // themselves. Fix the canonicals first, then add them here.
  additionalPaths: async (config) => Promise.all([
    '/',
    '/about',
    '/faq',
    '/blog',
    '/blog/advanced-sqlite-queries',
    '/blog/essential-sqlite-commands',
    '/blog/getting-started-sqlite-editor',
    '/blog/migrating-mysql-to-sqlite',
    '/blog/optimize-sqlite-performance',
    '/blog/sqlite-schema-design-patterns',
    '/blog/sqlite-security-best-practices',
    '/blog/sqlite-vs-other-databases',
  ].map((path) => config.transform(config, path))),
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