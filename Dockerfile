FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install system dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild better-sqlite3 for Alpine
RUN npm rebuild better-sqlite3

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects anonymous telemetry data - disable it
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /app/tmp && chown nextjs:nodejs /app/tmp

# Set proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/tmp ./tmp

USER nextjs

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose the port the app will run on
EXPOSE 3000

ENV PORT 3000

# Start the application
CMD ["node", "server.js"] 