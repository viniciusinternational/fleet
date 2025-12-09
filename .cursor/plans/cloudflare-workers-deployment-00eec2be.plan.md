---
name: Cloudflare Workers Deployment Setup
overview: ""
todos:
  - id: d0d9d1b0-bfdf-4756-b527-1162b39d0d96
    content: Update next.config.ts to include OpenNext.js Cloudflare adapter wrapper and configuration
    status: pending
  - id: 8311b189-4a76-46b0-bf35-6bc64aa84b37
    content: Update prisma/schema.prisma generator configuration for edge runtime compatibility
    status: pending
  - id: 139d2974-b7f4-4503-9888-3513ca66dea6
    content: Modify src/lib/db.ts to work with Cloudflare Workers edge runtime (remove query logging, ensure singleton)
    status: pending
  - id: 463edb43-86b0-45f3-8d9c-c9e3f52216e7
    content: Create wrangler.toml with Cloudflare Workers configuration, account settings, and environment variable placeholders
    status: pending
  - id: a3f89456-5198-4b51-9977-4e50b0a6bacb
    content: Add build:cloudflare, deploy:cloudflare, and preview:cloudflare scripts to package.json
    status: pending
  - id: b21d77c2-9fcd-41f6-9609-d1ff81eb3405
    content: Create .dev.vars.example template file for local environment variable reference (gitignored)
    status: pending
---

# Cloudflare Workers Deployment Setup

## Overview

Configure the Next.js application for deployment to Cloudflare Workers using `@opennextjs/cloudflare`, with PostgreSQL database connection from your VPS via environment variables.

## Configuration Files to Create/Update

### 1. Update `next.config.ts`

Add OpenNext.js Cloudflare adapter configuration:

- Import and use the `withCloudflareAdapter` wrapper
- Configure build output for Cloudflare Workers

### 2. Update `prisma/schema.prisma`

Modify Prisma generator for edge runtime compatibility:

- Add `previewFeatures` with `driverAdapters`
- Ensure Prisma Client works in Cloudflare Workers environment

### 3. Update `src/lib/db.ts`

Modify Prisma Client initialization for edge runtime:

- Remove or conditionally disable query logging (not supported in Workers)
- Ensure singleton pattern works in Workers environment
- Handle edge runtime specific initialization

### 4. Create `wrangler.toml`

Cloudflare Workers configuration file:

- Set account ID and worker name
- Configure environment variables placeholders
- Set compatibility date for Cloudflare Workers
- Configure Node.js compatibility flags

### 5. Update `package.json`

Add deployment scripts:

- Build script for Cloudflare (`build:cloudflare`)
- Deploy script using Wrangler (`deploy:cloudflare`)
- Preview script for local testing (`preview:cloudflare`)

### 6. Create `.dev.vars` (optional, for local testing)

Local environment variables template (gitignored):

- Template for DATABASE_URL, GEMINI_API_KEY, etc.
- Helps with local Wrangler testing

## Key Technical Considerations

1. **Prisma Edge Runtime**: Prisma Client needs edge-compatible configuration for Cloudflare Workers
2. **Database Connection**: Connection pooling may be needed; ensure VPS allows external connections
3. **Environment Variables**: Set via Cloudflare Dashboard or `wrangler.toml` secrets
4. **Build Process**: Use OpenNext.js build output optimized for Cloudflare Workers
5. **File Uploads**: Static files in `/public` need special handling for Cloudflare Workers

## Deployment Steps (Documentation)

1. Configure environment variables in Cloudflare Dashboard
2. Build the application with OpenNext.js adapter
3. Deploy using Wrangler CLI
4. Verify database connectivity
5. Test API routes and authentication

## Notes

- Ensure VPS PostgreSQL allows connections from Cloudflare IP ranges
- Consider using connection pooling service if direct connections cause issues
- Static assets will be served from Cloudflare's CDN
- File uploads in `/public/uploads` may need separate storage solution