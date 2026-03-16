import { createClient, type EntryFieldTypes, type Entry, type EntrySkeletonType } from "contentful";

const spaceId = import.meta.env.CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.CONTENTFUL_ACCESS_TOKEN;
const previewToken = import.meta.env.CONTENTFUL_PREVIEW_TOKEN;

const isConfigured = Boolean(spaceId && accessToken);

const client = isConfigured
  ? createClient({ space: spaceId, accessToken })
  : null;

const previewClient = isConfigured && previewToken
  ? createClient({ space: spaceId, accessToken: previewToken, host: "preview.contentful.com" })
  : null;

function getClient(preview = false) {
  if (preview && previewClient) return previewClient;
  return client;
}

interface PageFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  description: EntryFieldTypes.Text;
  body: EntryFieldTypes.RichText;
  seoTitle?: EntryFieldTypes.Text;
  seoDescription?: EntryFieldTypes.Text;
}

interface BlogPostFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  excerpt: EntryFieldTypes.Text;
  body: EntryFieldTypes.RichText;
  publishedDate: EntryFieldTypes.Date;
  author?: EntryFieldTypes.Text;
  featuredImage?: EntryFieldTypes.AssetLink;
  seoTitle?: EntryFieldTypes.Text;
  seoDescription?: EntryFieldTypes.Text;
}

export type PageSkeleton = EntrySkeletonType<PageFields, "page">;
export type BlogPostSkeleton = EntrySkeletonType<BlogPostFields, "blogPost">;

export type PageEntry = Entry<PageSkeleton, undefined, string>;
export type BlogPostEntry = Entry<BlogPostSkeleton, undefined, string>;

export async function getPages(preview = false): Promise<PageEntry[]> {
  const c = getClient(preview);
  if (!c) return [];
  const entries = await c.getEntries<PageSkeleton>({
    content_type: "page",
    order: ["sys.createdAt"],
  });
  return entries.items;
}

export async function getPageBySlug(
  slug: string,
  preview = false
): Promise<PageEntry | undefined> {
  const c = getClient(preview);
  if (!c) return undefined;
  const entries = await c.getEntries<PageSkeleton>({
    content_type: "page",
    "fields.slug": slug,
    limit: 1,
  } as any);
  return entries.items[0];
}

export async function getBlogPosts(preview = false): Promise<BlogPostEntry[]> {
  const c = getClient(preview);
  if (!c) return [];
  const entries = await c.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishedDate"],
  });
  return entries.items;
}

export async function getBlogPostBySlug(
  slug: string,
  preview = false
): Promise<BlogPostEntry | undefined> {
  const c = getClient(preview);
  if (!c) return undefined;
  const entries = await c.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  } as any);
  return entries.items[0];
}
