# ContactFormAPI.com — Website

Marketing website for ContactFormAPI, built with Astro 6, Tailwind CSS v4, Contentful CMS, and Polar.sh for pricing.

## Tech Stack

- **Framework:** [Astro 6](https://astro.build) (server-rendered)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) via Vite plugin
- **CMS:** [Contentful](https://contentful.com) — Blog posts and static pages (About, Terms, Privacy, etc.)
- **Pricing:** [Polar.sh](https://polar.sh) — Products/plans fetched via API
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com)

## Project Structure

```
src/
├── components/       # Header, Footer
├── layouts/          # BaseLayout
├── lib/
│   ├── contentful.ts # Contentful client & queries
│   ├── polar.ts      # Polar.sh API client
│   └── rich-text.ts  # Contentful Rich Text renderer
├── pages/
│   ├── index.astro       # Landing page (static)
│   ├── pricing.astro     # Plans from Polar.sh
│   ├── blog/
│   │   ├── index.astro   # Blog listing (Contentful)
│   │   └── [slug].astro  # Blog post (Contentful)
│   └── [slug].astro      # Dynamic pages (Contentful)
├── styles/
│   └── global.css        # Tailwind imports + theme
└── env.d.ts              # TypeScript env types
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `CONTENTFUL_SPACE_ID` | Your Contentful space ID |
| `CONTENTFUL_ACCESS_TOKEN` | Contentful Content Delivery API token |
| `CONTENTFUL_PREVIEW_TOKEN` | Contentful Content Preview API token |
| `POLAR_ACCESS_TOKEN` | Polar.sh Organization Access Token (scope: `products:read`) |
| `POLAR_ORGANIZATION_ID` | Your Polar.sh organization ID |

### 3. Contentful Content Models

Create these content types in Contentful:

**Page** (`page`)
| Field | Type | Required |
|---|---|---|
| `title` | Short text | Yes |
| `slug` | Short text | Yes |
| `description` | Short text | Yes |
| `body` | Rich Text | Yes |
| `seoTitle` | Short text | No |
| `seoDescription` | Short text | No |

**Blog Post** (`blogPost`)
| Field | Type | Required |
|---|---|---|
| `title` | Short text | Yes |
| `slug` | Short text | Yes |
| `excerpt` | Short text | Yes |
| `body` | Rich Text | Yes |
| `publishedDate` | Date | Yes |
| `author` | Short text | No |
| `featuredImage` | Media | No |
| `seoTitle` | Short text | No |
| `seoDescription` | Short text | No |

### 4. Development

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

## Deployment (Cloudflare Pages)

### Via Wrangler CLI

```bash
npx wrangler pages deploy ./dist
```

### Via Cloudflare Dashboard

1. Connect your Git repository in Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables (from `.env`) as secrets:

```bash
npx wrangler pages secret put CONTENTFUL_SPACE_ID
npx wrangler pages secret put CONTENTFUL_ACCESS_TOKEN
npx wrangler pages secret put CONTENTFUL_PREVIEW_TOKEN
npx wrangler pages secret put POLAR_ACCESS_TOKEN
npx wrangler pages secret put POLAR_ORGANIZATION_ID
```

## Pages Overview

| Page | Source | Route |
|---|---|---|
| Landing / Home | Static (Astro) | `/` |
| Pricing / Plans | Polar.sh API | `/pricing` |
| Blog List | Contentful | `/blog` |
| Blog Post | Contentful | `/blog/[slug]` |
| About, Terms, etc. | Contentful | `/[slug]` |
