import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Advanced SQLite Queries for Data Analysis | SQLite Editor",
  description: "Master advanced SQLite query techniques for data analysis. Learn window functions, CTEs, JSON operations, and complex analytical queries with practical examples.",
  keywords: "advanced sqlite queries, sqlite data analysis, sqlite window functions, sqlite CTE, sqlite analytics, complex sql queries",
  alternates: {
    canonical: "https://www.sqleditor.online/blog/advanced-sqlite-queries",
  },
  openGraph: {
    title: "Advanced SQLite Queries for Data Analysis",
    description: "Master advanced SQLite query techniques for data analysis. Learn window functions, CTEs, JSON operations, and complex analytical queries.",
    url: "https://www.sqleditor.online/blog/advanced-sqlite-queries",
  },
};

export default function BlogPost() {
  return (
    <>
      <Script id="article-schema" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Advanced SQLite Queries for Data Analysis",
            "description": "Master advanced SQLite query techniques for data analysis. Learn window functions, CTEs, JSON operations, and complex analytical queries with practical examples.",
            "author": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "datePublished": "2023-06-28",
            "dateModified": "2023-06-28",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.sqleditor.online/blog/advanced-sqlite-queries"
            }
          }
        `}
      </Script>
    
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <article className="max-w-3xl mx-auto prose dark:prose-invert">
          <Link href="/blog" className="text-primary hover:underline mb-6 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <time dateTime="2023-06-28">June 28, 2023</time>
              <span>•</span>
              <span>SQLite, Queries, Data Analysis, Advanced</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Advanced SQLite Queries for Data Analysis</h1>
          
          <p className="lead">
            SQLite&apos;s analytical capabilities extend far beyond basic SELECT statements. With window functions, common table expressions, and advanced SQL techniques, you can perform sophisticated data analysis directly in SQLite. This guide explores powerful query patterns that will transform how you analyze data.
          </p>
          
          <h2 id="window-functions">1. Window Functions - Your Analysis Powerhouse</h2>
          <p>
            Window functions allow you to perform calculations across related rows without grouping them. They&apos;re perfect for rankings, running totals, and comparative analysis.
          </p>
          
          <h3>Ranking and Row Numbers</h3>
          <pre className="language-sql">
            <code>
{`-- Rank employees by salary within each department
SELECT 
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as salary_rank,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank
FROM employees;

-- Find top 3 performers in each region
SELECT * FROM (
    SELECT 
        employee_id,
        region,
        performance_score,
        ROW_NUMBER() OVER (PARTITION BY region ORDER BY performance_score DESC) as rank
    FROM employee_performance
) ranked
WHERE rank <= 3;`}
            </code>
          </pre>
          
          <h3>Running Totals and Moving Averages</h3>
          <pre className="language-sql">
            <code>
{`-- Calculate running total of daily sales
SELECT 
    date,
    daily_sales,
    SUM(daily_sales) OVER (
        ORDER BY date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as running_total,
    AVG(daily_sales) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg
FROM daily_sales
ORDER BY date;

-- Year-over-year growth comparison
SELECT 
    year,
    month,
    revenue,
    LAG(revenue, 12) OVER (ORDER BY year, month) as prev_year_revenue,
    ROUND(
        (revenue - LAG(revenue, 12) OVER (ORDER BY year, month)) * 100.0 / 
        LAG(revenue, 12) OVER (ORDER BY year, month), 2
    ) as yoy_growth_percent
FROM monthly_revenue
ORDER BY year, month;`}
            </code>
          </pre>
          
          <h2 id="cte-queries">2. Common Table Expressions (CTEs)</h2>
          <p>
            CTEs make complex queries readable and maintainable by breaking them into logical steps.
          </p>
          
          <h3>Recursive CTEs for Hierarchical Data</h3>
          <pre className="language-sql">
            <code>
{`-- Generate an organizational hierarchy
WITH RECURSIVE org_hierarchy(employee_id, name, manager_id, level, path) AS (
    -- Base case: top-level managers
    SELECT 
        employee_id, 
        name, 
        manager_id, 
        0 as level,
        name as path
    FROM employees 
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT 
        e.employee_id,
        e.name,
        e.manager_id,
        oh.level + 1,
        oh.path || ' > ' || e.name
    FROM employees e
    JOIN org_hierarchy oh ON e.manager_id = oh.employee_id
)
SELECT 
    employee_id,
    SUBSTR('                    ', 1, level * 2) || name as indented_name,
    level,
    path
FROM org_hierarchy
ORDER BY path;`}
            </code>
          </pre>
          
          <h3>Complex Data Transformations</h3>
          <pre className="language-sql">
            <code>
{`-- Multi-step customer analysis
WITH customer_metrics AS (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        SUM(total) as total_spent,
        AVG(total) as avg_order_value,
        MIN(order_date) as first_order,
        MAX(order_date) as last_order
    FROM orders
    GROUP BY customer_id
),
customer_segments AS (
    SELECT 
        *,
        CASE 
            WHEN total_spent >= 1000 THEN 'VIP'
            WHEN total_spent >= 500 THEN 'Premium'
            WHEN total_spent >= 100 THEN 'Regular'
            ELSE 'New'
        END as segment,
        CASE 
            WHEN julianday('now') - julianday(last_order) <= 30 THEN 'Active'
            WHEN julianday('now') - julianday(last_order) <= 90 THEN 'At Risk'
            ELSE 'Churned'
        END as status
    FROM customer_metrics
)
SELECT 
    segment,
    status,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_lifetime_value,
    AVG(avg_order_value) as avg_order_value
FROM customer_segments
GROUP BY segment, status
ORDER BY segment, status;`}
            </code>
          </pre>
          
          <h2 id="json-operations">3. JSON Data Analysis</h2>
          <p>
            SQLite&apos;s JSON functions enable you to work with semi-structured data directly in SQL.
          </p>
          
          <h3>Extracting JSON Data</h3>
          <pre className="language-sql">
            <code>
{`-- Analyze user preferences stored as JSON
SELECT 
    user_id,
    JSON_EXTRACT(preferences, '$.theme') as preferred_theme,
    JSON_EXTRACT(preferences, '$.notifications.email') as email_notifications,
    JSON_ARRAY_LENGTH(JSON_EXTRACT(preferences, '$.interests')) as interest_count
FROM users
WHERE JSON_VALID(preferences);

-- Aggregate JSON array data
SELECT 
    JSON_EXTRACT(value, '$.category') as category,
    COUNT(*) as item_count,
    AVG(CAST(JSON_EXTRACT(value, '$.price') AS REAL)) as avg_price
FROM products, JSON_EACH(attributes)
WHERE JSON_TYPE(attributes) = 'array'
GROUP BY category;`}
            </code>
          </pre>
          
          <h2 id="time-series-analysis">4. Time Series Analysis</h2>
          <p>
            SQLite excels at time-based analysis with its comprehensive date/time functions.
          </p>
          
          <h3>Cohort Analysis</h3>
          <pre className="language-sql">
            <code>
{`-- Customer cohort retention analysis
WITH first_purchase AS (
    SELECT 
        customer_id,
        DATE(MIN(order_date)) as cohort_month
    FROM orders
    GROUP BY customer_id
),
purchase_periods AS (
    SELECT 
        fp.customer_id,
        fp.cohort_month,
        DATE(o.order_date) as purchase_date,
        ROUND((julianday(o.order_date) - julianday(fp.cohort_month)) / 30.0) as period_number
    FROM first_purchase fp
    JOIN orders o ON fp.customer_id = o.customer_id
),
cohort_data AS (
    SELECT 
        cohort_month,
        period_number,
        COUNT(DISTINCT customer_id) as customers
    FROM purchase_periods
    GROUP BY cohort_month, period_number
),
cohort_sizes AS (
    SELECT 
        cohort_month,
        COUNT(DISTINCT customer_id) as cohort_size
    FROM first_purchase
    GROUP BY cohort_month
)
SELECT 
    cd.cohort_month,
    cs.cohort_size,
    cd.period_number,
    cd.customers,
    ROUND(cd.customers * 100.0 / cs.cohort_size, 2) as retention_rate
FROM cohort_data cd
JOIN cohort_sizes cs ON cd.cohort_month = cs.cohort_month
ORDER BY cd.cohort_month, cd.period_number;`}
            </code>
          </pre>
          
          <h3>Seasonal Analysis</h3>
          <pre className="language-sql">
            <code>
{`-- Seasonal sales pattern analysis
SELECT 
    STRFTIME('%m', order_date) as month,
    STRFTIME('%w', order_date) as day_of_week,
    COUNT(*) as order_count,
    SUM(total) as revenue,
    AVG(total) as avg_order_value,
    -- Compare to overall averages
    ROUND(
        COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM orders
        ) * 12, 2
    ) as monthly_share_percent
FROM orders
GROUP BY month, day_of_week
ORDER BY month, day_of_week;

-- Holiday impact analysis
WITH holiday_periods AS (
    SELECT DATE('2023-11-23') as start_date, DATE('2023-11-27') as end_date, 'Black Friday Weekend' as period
    UNION ALL SELECT DATE('2023-12-15'), DATE('2023-12-31'), 'Holiday Season'
    UNION ALL SELECT DATE('2023-07-01'), DATE('2023-07-07'), 'July 4th Week'
)
SELECT 
    hp.period,
    COUNT(o.id) as orders_during_period,
    SUM(o.total) as revenue_during_period,
    AVG(o.total) as avg_order_value,
    -- Compare to non-holiday periods
    (SELECT AVG(total) FROM orders 
     WHERE order_date NOT BETWEEN hp.start_date AND hp.end_date
    ) as normal_avg_order_value
FROM holiday_periods hp
LEFT JOIN orders o ON o.order_date BETWEEN hp.start_date AND hp.end_date
GROUP BY hp.period;`}
            </code>
          </pre>
          
          <h2 id="statistical-functions">5. Statistical Analysis</h2>
          <p>
            Perform statistical calculations to understand your data distributions and relationships.
          </p>
          
          <h3>Descriptive Statistics</h3>
          <pre className="language-sql">
            <code>
{`-- Calculate comprehensive statistics for sales data
WITH stats AS (
    SELECT 
        COUNT(*) as count,
        AVG(amount) as mean,
        MIN(amount) as min_value,
        MAX(amount) as max_value,
        SUM(amount) as total
    FROM sales
),
percentiles AS (
    SELECT 
        amount,
        NTILE(4) OVER (ORDER BY amount) as quartile,
        PERCENT_RANK() OVER (ORDER BY amount) as percent_rank
    FROM sales
),
quartile_values AS (
    SELECT 
        MIN(CASE WHEN quartile = 2 THEN amount END) as q1,
        MIN(CASE WHEN quartile = 3 THEN amount END) as median,
        MIN(CASE WHEN quartile = 4 THEN amount END) as q3
    FROM percentiles
)
SELECT 
    s.count,
    ROUND(s.mean, 2) as mean,
    s.min_value,
    qv.q1 as first_quartile,
    qv.median,
    qv.q3 as third_quartile,
    s.max_value,
    ROUND(qv.q3 - qv.q1, 2) as iqr,
    s.total
FROM stats s, quartile_values qv;`}
            </code>
          </pre>
          
          <h2 id="text-analysis">6. Text Analysis and Pattern Matching</h2>
          <p>
            SQLite provides powerful text processing capabilities for analyzing textual data.
          </p>
          
          <h3>Advanced Text Search</h3>
          <pre className="language-sql">
            <code>
{`-- Analyze customer feedback sentiment keywords
WITH feedback_words AS (
    SELECT 
        feedback_id,
        TRIM(LOWER(value)) as word,
        LENGTH(feedback_text) - LENGTH(REPLACE(feedback_text, ' ', '')) + 1 as word_count
    FROM customer_feedback, JSON_EACH('["' || REPLACE(REPLACE(feedback_text, ' ', '","'), '"', '') || '"]')
    WHERE LENGTH(TRIM(value)) > 3  -- Filter short words
),
sentiment_keywords AS (
    SELECT 'excellent' as keyword, 'positive' as sentiment
    UNION ALL SELECT 'great', 'positive'
    UNION ALL SELECT 'love', 'positive'
    UNION ALL SELECT 'amazing', 'positive'
    UNION ALL SELECT 'terrible', 'negative'
    UNION ALL SELECT 'awful', 'negative'
    UNION ALL SELECT 'hate', 'negative'
    UNION ALL SELECT 'disappointed', 'negative'
)
SELECT 
    sk.sentiment,
    COUNT(DISTINCT fw.feedback_id) as feedback_count,
    COUNT(fw.word) as keyword_mentions,
    GROUP_CONCAT(DISTINCT fw.word) as keywords_found
FROM feedback_words fw
JOIN sentiment_keywords sk ON fw.word LIKE '%' || sk.keyword || '%'
GROUP BY sk.sentiment;

-- Find patterns in product descriptions
SELECT 
    SUBSTR(description, 1, 50) as description_sample,
    LENGTH(description) as description_length,
    (LENGTH(description) - LENGTH(REPLACE(LOWER(description), 'premium', ''))) / LENGTH('premium') as premium_mentions,
    CASE 
        WHEN description LIKE '%limited edition%' THEN 'Limited Edition'
        WHEN description LIKE '%bestseller%' THEN 'Bestseller'
        WHEN description LIKE '%new%' THEN 'New Product'
        ELSE 'Standard'
    END as product_category
FROM products
WHERE LENGTH(description) > 0;`}
            </code>
          </pre>
          
          <h2 id="pivot-unpivot">7. Pivot and Unpivot Operations</h2>
          <p>
            Transform data between wide and narrow formats for different analytical perspectives.
          </p>
          
          <h3>Creating Pivot Tables</h3>
          <pre className="language-sql">
            <code>
{`-- Pivot monthly sales by product category
SELECT 
    strftime('%Y', order_date) as year,
    SUM(CASE WHEN category = 'Electronics' THEN total ELSE 0 END) as electronics,
    SUM(CASE WHEN category = 'Clothing' THEN total ELSE 0 END) as clothing,
    SUM(CASE WHEN category = 'Books' THEN total ELSE 0 END) as books,
    SUM(CASE WHEN category = 'Home' THEN total ELSE 0 END) as home,
    SUM(total) as total_sales
FROM orders o
JOIN products p ON o.product_id = p.id
GROUP BY strftime('%Y', order_date)
ORDER BY year;

-- Dynamic pivot using JSON aggregation
WITH category_sales AS (
    SELECT 
        strftime('%Y-%m', order_date) as month,
        category,
        SUM(total) as sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY month, category
)
SELECT 
    month,
    JSON_GROUP_OBJECT(category, sales) as sales_by_category,
    SUM(sales) as total_monthly_sales
FROM category_sales
GROUP BY month
ORDER BY month;`}
            </code>
          </pre>
          
          <h2 id="performance-tips">8. Performance Optimization for Analytical Queries</h2>
          <p>
            Ensure your analytical queries run efficiently, even on large datasets.
          </p>
          
          <h3>Optimal Indexing Strategy</h3>
          <pre className="language-sql">
            <code>
{`-- Create indexes optimized for analytical queries
CREATE INDEX idx_orders_date_customer ON orders(order_date, customer_id);
CREATE INDEX idx_orders_product_date ON orders(product_id, order_date);
CREATE INDEX idx_products_category ON products(category);

-- Partial index for active customers only
CREATE INDEX idx_active_customers ON customers(customer_id, registration_date) 
WHERE status = 'active';

-- Expression index for computed columns
CREATE INDEX idx_order_month ON orders(strftime('%Y-%m', order_date));`}
            </code>
          </pre>
          
          <h3>Query Optimization Techniques</h3>
          <pre className="language-sql">
            <code>
{`-- Use EXISTS instead of IN for better performance
SELECT customer_id, name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.customer_id = c.customer_id 
    AND o.order_date >= date('now', '-1 year')
);

-- Limit analytical scope with date ranges
SELECT 
    product_id,
    COUNT(*) as sales_count,
    SUM(total) as revenue
FROM orders
WHERE order_date >= date('now', '-90 days')  -- Focus on recent data
GROUP BY product_id
HAVING COUNT(*) >= 5  -- Filter early
ORDER BY revenue DESC
LIMIT 20;  -- Limit results`}
            </code>
          </pre>
          
          <h2 id="real-world-example">9. Complete Real-World Example</h2>
          <p>
            Let&apos;s combine multiple techniques in a comprehensive e-commerce analysis:
          </p>
          
          <pre className="language-sql">
            <code>
{`-- Comprehensive e-commerce business intelligence query
WITH customer_lifetime_metrics AS (
    -- Calculate customer lifetime value and behavior
    SELECT 
        c.customer_id,
        c.registration_date,
        COUNT(o.id) as total_orders,
        SUM(o.total) as lifetime_value,
        AVG(o.total) as avg_order_value,
        MIN(o.order_date) as first_purchase_date,
        MAX(o.order_date) as last_purchase_date,
        (julianday(MAX(o.order_date)) - julianday(MIN(o.order_date))) as customer_lifespan_days
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
),
customer_segments AS (
    -- Segment customers based on RFM analysis
    SELECT 
        *,
        NTILE(5) OVER (ORDER BY lifetime_value DESC) as value_quintile,
        NTILE(5) OVER (ORDER BY total_orders DESC) as frequency_quintile,
        NTILE(5) OVER (ORDER BY julianday('now') - julianday(last_purchase_date)) as recency_quintile,
        CASE 
            WHEN total_orders = 0 THEN 'Never Purchased'
            WHEN julianday('now') - julianday(last_purchase_date) <= 30 THEN 'Active'
            WHEN julianday('now') - julianday(last_purchase_date) <= 90 THEN 'At Risk'
            ELSE 'Churned'
        END as status
    FROM customer_lifetime_metrics
),
segment_analysis AS (
    -- Analyze segment performance
    SELECT 
        value_quintile,
        frequency_quintile,
        recency_quintile,
        status,
        COUNT(*) as customer_count,
        AVG(lifetime_value) as avg_lifetime_value,
        AVG(avg_order_value) as avg_order_value,
        AVG(total_orders) as avg_order_frequency,
        SUM(lifetime_value) as total_segment_value
    FROM customer_segments
    GROUP BY value_quintile, frequency_quintile, recency_quintile, status
)
SELECT 
    -- Create meaningful segment names
    CASE 
        WHEN value_quintile >= 4 AND frequency_quintile >= 4 AND recency_quintile >= 4 THEN 'VIP Champions'
        WHEN value_quintile >= 3 AND frequency_quintile >= 3 THEN 'Loyal Customers'
        WHEN recency_quintile <= 2 THEN 'At Risk'
        WHEN value_quintile <= 2 AND frequency_quintile <= 2 THEN 'Low Value'
        ELSE 'Developing'
    END as segment_name,
    customer_count,
    ROUND(avg_lifetime_value, 2) as avg_lifetime_value,
    ROUND(avg_order_value, 2) as avg_order_value,
    ROUND(avg_order_frequency, 1) as avg_order_frequency,
    ROUND(total_segment_value, 2) as total_segment_value,
    ROUND(customer_count * 100.0 / SUM(customer_count) OVER (), 2) as percent_of_customers,
    ROUND(total_segment_value * 100.0 / SUM(total_segment_value) OVER (), 2) as percent_of_revenue
FROM segment_analysis
WHERE customer_count > 0
ORDER BY total_segment_value DESC;`}
            </code>
          </pre>
          
          <h2 id="conclusion">Conclusion</h2>
          <p>
            Advanced SQLite queries unlock powerful analytical capabilities that rival specialized analytics platforms. From window functions and CTEs to JSON processing and statistical analysis, SQLite provides a comprehensive toolkit for data analysis.
          </p>
          <p>
            The key to mastering these techniques is practice and understanding your specific use cases. Start with simpler patterns and gradually build complexity as you become more comfortable with the syntax and concepts.
          </p>
          <p>
            Ready to put these techniques into practice? Try them out in our <Link href="/" className="text-primary hover:underline">free SQLite editor</Link> and discover what insights your data holds!
          </p>
          
          <div className="mt-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Related Articles</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/essential-sqlite-commands" className="text-primary hover:underline">
                  5 Essential SQLite Commands Every Developer Should Know
                </Link>
              </li>
              <li>
                <Link href="/blog/optimize-sqlite-performance" className="text-primary hover:underline">
                  How to Optimize Your SQLite Database for Better Performance
                </Link>
              </li>
              <li>
                <Link href="/blog/getting-started-sqlite-editor" className="text-primary hover:underline">
                  Getting Started with SQLite Editor Online - A Complete Guide
                </Link>
              </li>
            </ul>
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t py-4 px-4 text-center text-xs text-muted-foreground bg-muted/30">
          <div className="flex justify-center space-x-4 mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/blog" className="text-primary">Blog</Link>
          </div>
          <p>SQLite Editor Online - Version 0.0.1</p>
          <p className="mt-1">
            Request new features: <a href="mailto:toanphamhsgs@gmail.com" className="text-primary hover:underline">toanphamhsgs@gmail.com</a>
          </p>
        </footer>
      </main>
    </>
  );
} 