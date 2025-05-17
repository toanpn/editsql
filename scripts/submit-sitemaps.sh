#!/bin/bash

# Script to submit sitemaps to Google and Bing search engines
# Usage: ./submit-sitemaps.sh

# Set your site URL
SITE_URL="https://www.sqleditor.online"

# Sitemaps to submit
SITEMAPS=(
  "$SITE_URL/sitemap.xml"
  "$SITE_URL/site-sitemap.xml"
  "$SITE_URL/sitemap-0.xml"
  "$SITE_URL/blog-sitemap.xml"
)

echo "Starting sitemap submission..."

# Submit to Google
for sitemap in "${SITEMAPS[@]}"; do
  echo "Submitting $sitemap to Google..."
  curl "https://www.google.com/ping?sitemap=$sitemap"
  echo ""
  sleep 2
done

# Submit to Bing
for sitemap in "${SITEMAPS[@]}"; do
  echo "Submitting $sitemap to Bing..."
  curl "https://www.bing.com/ping?sitemap=$sitemap"
  echo ""
  sleep 2
done

echo "Sitemap submission completed."
echo "Remember to also submit your sitemaps through Google Search Console and Bing Webmaster Tools." 